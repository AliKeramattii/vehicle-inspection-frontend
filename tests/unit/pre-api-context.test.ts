import { ownsInspection } from "@/features/inspection-status/lifecycle-model";
import { beforeEach, expect, it } from "vitest";
import { createMockCustomerSource, saveMockVerifiedSession, readMockVerifiedSession, sourceOwnerKey } from "@/features/identity/source-context";
import { LifecycleRepository } from "@/features/inspection-status/lifecycle-repository";
import { MemoryLifecyclePersistence } from "@/features/inspection-status/lifecycle-persistence";
const scope = await createMockCustomerSource("demo").resolve();
beforeEach(() => sessionStorage.clear());
it("keeps two insurance requests of the same tenant/customer in separate current attempts", async () => {
 let id=0;const repo=new LifecycleRepository(new MemoryLifecyclePersistence(),()=>"2026-10-21T08:00:00Z",()=>`attempt-${++id}`);
 const first=await repo.register(scope), secondScope={...scope,sourceRequestId:"insurance-request-b"};
 const second=await repo.register(secondScope);
 expect(second.inspectionId).not.toBe(first.inspectionId);
 expect((await repo.current(scope))?.inspectionId).toBe(first.inspectionId);
 expect(await repo.read(secondScope,first.inspectionId)).toBeUndefined();
});
it("does not restore one source insurance request's verified session in another", () => {
 saveMockVerifiedSession(scope,"insp_demo");
 expect(readMockVerifiedSession({...scope,sourceRequestId:"insurance-request-b"})).toBeUndefined();
});
it("does not downgrade a final decision when a delayed pre-final projection arrives", async () => {
 const repo=new LifecycleRepository(new MemoryLifecyclePersistence());await repo.register(scope);
 await repo.applyMockProjection("demo","insp_demo",{status:"REJECTED",customerExplanation:"دلیل قطعی رد"});
 await repo.applyMockProjection("demo","insp_demo",{status:"UNDER_REVIEW",customerExplanation:undefined});
 expect((await repo.current(scope))?.status).toBe("REJECTED");
 expect((await repo.current(scope))?.customerExplanation).toBe("دلیل قطعی رد");
});
it("does not create a field-correction task after a final whole-case rejection",async()=>{
 const repo=new LifecycleRepository(new MemoryLifecyclePersistence());await repo.register(scope);
 await repo.applyMockProjection("demo","insp_demo",{status:"REJECTED"});
 await expect(repo.requestField("demo","insp_demo",{id:"late",field:"color",customerReason:"اصلاح رنگ",requestedBy:"reviewer-demo",requestedAt:"2026-10-21T08:00:00Z",state:"requested"})).rejects.toThrow();
});

it("restores legacy default records/session keys without allowing another request to read them",async()=>{
 const repo=new LifecycleRepository(new MemoryLifecyclePersistence());const original=await repo.register(scope);
 const old={mode:"mock",tenantId:scope.tenantId,subjectId:scope.subjectId,mobile:scope.mobile,inspectionId:original.inspectionId,expiresAt:Date.now()+60_000};
 sessionStorage.setItem("inspection-mock-session:"+sourceOwnerKey(scope),JSON.stringify(old));
 expect(readMockVerifiedSession(scope)?.inspectionId).toBe("insp_demo");
 expect(readMockVerifiedSession({...scope,sourceRequestId:"other-request"})).toBeUndefined();
});
it("keeps a rejected attempt restart linked to the same source request without copying evidence",async()=>{
 let id=0;const repo=new LifecycleRepository(new MemoryLifecyclePersistence(),()=>"2026-10-21T08:00:00Z",()=>`attempt-${++id}`);const own={...scope,sourceRequestId:"request-b"};const first=await repo.register(own);
 await repo.applyMockProjection("demo",first.inspectionId,{status:"REJECTED"});const second=await repo.restart(own,first.inspectionId);
 expect(second.inspectionId).not.toBe(first.inspectionId);expect(second.sourceRequestId).toBe(own.sourceRequestId);expect(second.previousAttemptId).toBe(first.inspectionId);expect(await repo.read(scope,second.inspectionId)).toBeUndefined();
});
it("never downgrades approved/delivered cases but allows failed forwarding to retry and acknowledge",async()=>{
 const repo=new LifecycleRepository(new MemoryLifecyclePersistence());await repo.register(scope);
 await repo.applyMockProjection("demo","insp_demo",{status:"REVIEW_APPROVED"});await repo.applyMockProjection("demo","insp_demo",{status:"CHANGES_REQUESTED"});expect((await repo.current(scope))?.status).toBe("REVIEW_APPROVED");
 await repo.applyMockProjection("demo","insp_demo",{status:"FORWARD_FAILED",forwarding:{phase:"failed"}});await repo.applyMockProjection("demo","insp_demo",{status:"FORWARD_PENDING",forwarding:{phase:"retrying"}});expect((await repo.current(scope))?.status).toBe("FORWARD_PENDING");
 await expect(repo.applyMockProjection("demo","insp_demo",{status:"FORWARDED"})).rejects.toThrow();
 await repo.applyMockProjection("demo","insp_demo",{status:"FORWARDED",forwarding:{phase:"acknowledged",acknowledgementId:"ack",acknowledgedAt:"2026-10-21T08:00:00Z"}});await repo.applyMockProjection("demo","insp_demo",{status:"FORWARD_FAILED",forwarding:{phase:"failed"}});expect((await repo.current(scope))?.status).toBe("FORWARDED");
});

it("treats old persisted records without a source-request field as legacy-default records only",async()=>{
 const repo=new LifecycleRepository(new MemoryLifecyclePersistence());const legacy={...await repo.register(scope)};delete legacy.sourceRequestId;
 expect(ownsInspection(scope,legacy)).toBe(true);expect(ownsInspection({...scope,sourceRequestId:"request-b"},legacy)).toBe(false);
});
