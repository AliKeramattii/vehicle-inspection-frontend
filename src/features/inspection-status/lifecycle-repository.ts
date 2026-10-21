import { z } from "zod";
import { iranianPlateSchema } from "@/schemas/domain";
import { vehicleColors } from "@/features/vehicle/vehicle-colors";
import { sourceOwnerKey, mockInitialInspectionId, type CustomerSourceContext } from "@/features/identity/source-context";
import { mockInspectionReference } from "@/mocks/fixtures";
import { ownsInspection, safeResumeHref, type CustomerInspectionStatus, type VehicleFieldCorrection, type VehicleCorrectionValue } from "./lifecycle-model";
import { IndexedDbLifecyclePersistence, type LifecyclePersistence } from "./lifecycle-persistence";
export const vehicleCorrectionSchema = z.discriminatedUnion("field", [
 z.object({ field: z.literal("plate"), value: iranianPlateSchema }),
 z.object({ field: z.literal("color"), value: z.string().refine(v => vehicleColors.some(c => c.id === v), "رنگ معتبر انتخاب کنید.") }),
 z.object({ field: z.literal("modelYear"), value: z.number().int().min(1300).max(2100) }),
]);
export class LifecycleRepository {
 constructor(private storage: LifecyclePersistence, private now = () => new Date().toISOString(), private unique = () => crypto.randomUUID()) {}
 staffProjection(tenantId: string, id: string) { return this.storage.transact(s => s.records.find(r => r.tenantId === tenantId && r.inspectionId === id)); }
 current(scope: CustomerSourceContext) { return this.storage.transact(s => { const id = s.identities.find(i => i.ownerKey === sourceOwnerKey(scope))?.inspectionId; return s.records.find(r => r.inspectionId === id && ownsInspection(scope, r)); }); }
 read(scope: CustomerSourceContext, id: string) { return this.storage.transact(s => s.records.find(r => r.inspectionId === id && ownsInspection(scope, r))); }
 register(scope: CustomerSourceContext) { return this.storage.transact(s => {
  const ownerKey = sourceOwnerKey(scope), existing = s.identities.find(i => i.ownerKey === ownerKey);
  if (existing) return s.records.find(r => r.inspectionId === existing.inspectionId && ownsInspection(scope, r))!;
  const initial = mockInitialInspectionId(scope.tenantId), conflict = s.records.find(r => r.inspectionId === initial && !ownsInspection(scope, r));
  const id = conflict ? `insp_mock_${this.unique()}` : initial, prior = s.records.find(r => r.inspectionId === id);
  const record: CustomerInspectionStatus = prior ?? { inspectionId: id, tenantId: scope.tenantId, subjectId: scope.subjectId, mobile: scope.mobile, trackingCode: id === "insp_demo" ? mockInspectionReference : `MOCK-${id.replace("insp_mock_", "").toUpperCase()}`, status: "DRAFT", updatedAt: this.now(), source: "mock", corrections: [] };
  if (!prior) s.records.push(record); s.identities.push({ ownerKey, inspectionId: id }); return record;
 }); }
 progress(scope: CustomerSourceContext, id: string, href: string) { return this.storage.transact(s => { const record = s.records.find(r => r.inspectionId === id && ownsInspection(scope, r)); if (record && ["DRAFT", "UPLOAD_PENDING"].includes(record.status) && safeResumeHref(id, href) === href) record.resumeHref = href; }); }
 /** Reconcile local capture only while the current durable status is still pre-review.
  * A delayed return lookup must not overwrite a concurrent Reviewer decision. */
 reconcileCaptureStage(scope:CustomerSourceContext,id:string,status:"DRAFT"|"UPLOAD_PENDING"|"SUBMITTED") { return this.storage.transact(s=>{
  const record=s.records.find(r=>r.inspectionId===id&&ownsInspection(scope,r));
  if(record&&["DRAFT","UPLOAD_PENDING"].includes(record.status)){record.status=status;record.updatedAt=this.now();}
 }); }
 reconcileMediaRequest(scope:CustomerSourceContext,id:string) { return this.storage.transact(s=>{
  const record=s.records.find(r=>r.inspectionId===id&&ownsInspection(scope,r));
  if(record&&["SUBMITTED","UNDER_REVIEW","CHANGES_REQUESTED"].includes(record.status)){record.status="CHANGES_REQUESTED";record.updatedAt=this.now();}
 }); }
 /** Mock-only projection boundary. Production adapter receives an authenticated backend projection. */
 applyMockProjection(tenantId: string, id: string, patch: Partial<Pick<CustomerInspectionStatus, "status" | "customerExplanation" | "forwarding">>) { return this.storage.transact(s => { const record = s.records.find(r => r.tenantId === tenantId && r.inspectionId === id); if (!record) return; if(patch.status==="FORWARDED"&&(!patch.forwarding?.acknowledgementId||!patch.forwarding.acknowledgedAt||patch.forwarding.phase!=="acknowledged"))throw new Error("تأیید دریافت کارگزاری موجود نیست."); Object.assign(record, patch, { updatedAt: this.now() }); return record; }); }
 requestField(tenantId: string, id: string, item: VehicleFieldCorrection) { return this.storage.transact(s => { const r = s.records.find(r => r.tenantId === tenantId && r.inspectionId === id); if (!r) throw new Error("بازدید پیدا نشد."); if (!item.customerReason.trim()) throw new Error("دلیل اصلاح را بنویسید."); if (r.corrections.some(c => c.field === item.field && c.state !== "approved")) throw new Error("برای این مشخصه درخواست فعال وجود دارد."); r.corrections.push(structuredClone(item)); r.status = "CHANGES_REQUESTED"; r.updatedAt = this.now(); }); }
 submitField(scope: CustomerSourceContext, id: string, taskId: string, input: VehicleCorrectionValue) { const value = vehicleCorrectionSchema.parse(input); return this.storage.transact(s => {
  const r = s.records.find(r => r.inspectionId === id && ownsInspection(scope, r)), task = r?.corrections.find(t => t.id === taskId);
  if (!r || r.status !== "CHANGES_REQUESTED" || !task || task.state !== "requested" || task.field !== value.field) throw new Error("اصلاح این مشخصه در درخواست کارشناس مجاز نیست.");
  task.proposal = value; task.state = "submitted"; task.submittedAt = this.now(); r.updatedAt = this.now();
 }); }
 approveField(tenantId: string, id: string, taskId: string, actorId: string) { return this.storage.transact(s => { const r = s.records.find(r => r.tenantId === tenantId && r.inspectionId === id), task = r?.corrections.find(t => t.id === taskId); if (!task || task.state !== "submitted" || !task.proposal) throw new Error("اصلاحی برای بررسی ثبت نشده است."); task.state = "approved"; task.reviewedAt = this.now(); task.reviewedBy = actorId; return task; }); }
 restart(scope: CustomerSourceContext, rejectedId: string) { return this.storage.transact(s => {
  const index = s.identities.find(i => i.ownerKey === sourceOwnerKey(scope));
  if (!index) throw new Error("هویت بازدید پیدا نشد.");
  const current = s.records.find(r => r.inspectionId === index.inspectionId && ownsInspection(scope, r));
  if (index.inspectionId !== rejectedId) return current!; // Double activation returns the same new attempt.
  if (!current || current.status !== "REJECTED") throw new Error("شروع مجدد فقط برای بازدید ردشده مجاز است.");
  const suffix = this.unique(), record: CustomerInspectionStatus = { inspectionId: `insp_mock_${suffix}`, tenantId: scope.tenantId, subjectId: scope.subjectId, mobile: scope.mobile, trackingCode: `MOCK-${suffix.toUpperCase()}`, previousAttemptId: rejectedId, source: "mock", status: "DRAFT", updatedAt: this.now(), resumeHref: "/readiness", corrections: [] };
  s.records.push(record); index.inspectionId = record.inspectionId; return record;
 }); }
}
export const lifecycleRepository = new LifecycleRepository(new IndexedDbLifecyclePersistence());
