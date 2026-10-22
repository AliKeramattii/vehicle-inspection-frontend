import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {inspectionPhotographyTemplate as template,legacyPhotographyTemplate,templateCapturePlan} from "@/features/photography/inspection-template";
import {vehicleIdentificationGuides} from "@/features/photography/vehicle-identification-guides";
import {validPhotoChoice,evidencePhoto} from "@/features/photography/photo-choice";
import {photographyProgress,requirementStatus,photographyVisualState} from "@/features/photography/photography-model";
import {capturePackageProgress,type CapturePackageData} from "@/features/capture-package/capture-package-model";
import {acceptedMedia,requiredMediaCount,uploadJobId,type UploadJob} from "@/features/upload/upload-model";
import {indexedDBUploadQueue as queue} from "@/features/upload/queue-repository";
import {indexedDBPhotoStore as store,photoKey,photoNamespace,photoRevisionKey,readPhoto,selectPhotoAlternative,type LocalPhoto} from "@/lib/media/photo-store";
import {inspectionPhotoTemplate} from "@/features/photography/template-policy";
import {pinPhotographyTemplate,readFacts,saveFacts} from "@/lib/media/inspection-facts-store";
import {additionalDatabaseFixture} from "./additional-idb-fixture";
import {adminSnapshotSchema,actors} from "@/features/admin/model";
import {initialAdminWorkspace} from "@/features/admin/fixtures";
import {MemoryAdminPersistence} from "@/features/admin/persistence";
import {MockAdminRepository} from "@/features/admin/repository";
import {deriveInspectionSummary} from "@/features/submission/submission-model";
import {adaptInspection} from "@/lib/api/adapters/inspection";
import {inspectionFixture} from "@/mocks/fixtures";
import {developmentLocationAdapter} from "@/lib/map/location-adapter";
import {requestTemplate,type EvidenceRequest} from "@/features/additional-evidence/request-model";

const all=template.sections.flatMap(s=>s.photoRequirements),group=all.find(p=>p.choice)!,fixed=all.filter(p=>!p.choice);
const namespace=photoNamespace("v2",template.templateId,template.templateVersion);
const blob=new Blob(["original camera bytes"],{type:"image/jpeg"});
const record=(id:string,alternativeId?:string):LocalPhoto=>({key:photoKey(namespace,id),namespace,requirementId:id,status:"captured",blob,revisionId:`revision-${id}-${alternativeId}`,capturedAt:"2026-10-22T00:00:00Z",alternativeId});
const photos=(choice="pillar")=>all.map(p=>record(p.id,p.choice?choice:undefined));
const data:CapturePackageData={namespace,odometer:{kilometers:48320},video360:{state:"local",accepted:{blob:new Blob(["video"],{type:"video/webm"}),durationSeconds:28,metadata:{kind:"video-360",mimeType:"video/webm",sizeBytes:5,localBlobKey:"video",capturedAt:"2026-10-22T00:00:00Z"}}}};
beforeEach(()=>{additionalDatabaseFixture();vi.stubGlobal("IDBKeyRange",{bound:vi.fn()});});
afterEach(()=>vi.unstubAllGlobals());

describe("eleven logical photographs",()=>{
 it("defines ten mandatory fixed slots and one single-choice group, without adding the other three",()=>{
  expect(fixed).toHaveLength(10);expect(all).toHaveLength(11);expect(all.every(p=>p.required)).toBe(true);
  expect(group.choice?.alternatives).toEqual(vehicleIdentificationGuides.map(g=>g.id));expect(templateCapturePlan().totalRequired).toBe(11);
  expect(requiredMediaCount(template)).toBe(12);expect(all.some(p=>p.id==="chassis-number")).toBe(false);
 });
 it.each(vehicleIdentificationGuides)("$id independently satisfies the group and appears in upload/reviewer metadata",choice=>{
  const records=photos(choice.id),progress=photographyProgress(template,records);
  expect(progress).toMatchObject({completed:11,total:11,remaining:0,complete:true});
  const media=acceptedMedia("v2",namespace,template,records,data),technical=media.filter(m=>m.requirementId===group.id);
  expect(media.filter(m=>m.evidenceKind==="photo")).toHaveLength(11);expect(media.filter(m=>m.evidenceKind==="video-360")).toHaveLength(1);
  expect(technical).toHaveLength(1);expect(technical[0]).toMatchObject({alternativeId:choice.id,required:true});expect(technical[0].title).toContain(choice.shortTitle);
  expect(evidencePhoto(group,technical[0]).sampleImage).toBe(choice.src);
 });
 it.each([undefined,"unknown", "pillar,seat"])("rejects zero/invalid/multiple alternatives: %s",choice=>{
  const records=[...fixed.map(p=>record(p.id)),record(group.id,choice)];
  expect(validPhotoChoice(group,choice)).toBe(false);expect(photographyProgress(template,records)).toMatchObject({completed:10,total:11,complete:false});
  expect(acceptedMedia("v2",namespace,template,records,data).some(m=>m.requirementId===group.id)).toBe(false);
 });
 it.each(fixed)("fixed $id remains mandatory",photo=>{expect(photographyProgress(template,photos().filter(p=>p.requirementId!==photo.id)).complete).toBe(false);});
 it("ignores unrelated alternative metadata on a fixed photograph",()=>{expect(evidencePhoto(fixed[0],{alternativeId:"seat"})).toBe(fixed[0]);});
 it("does not count preference or unconfirmed draft, and keeps selection independent of accepted credit",()=>{
  const draft={blob,alternativeId:"seat",capturedAt:"now"};
  expect(photographyProgress(template,[...fixed.map(p=>record(p.id)),{...record(group.id),blob:undefined,status:"pending",selectedAlternativeId:"seat",draft}]).completed).toBe(10);
  const accepted={...record(group.id,"pillar"),draft,selectedAlternativeId:"seat"};
  expect(requirementStatus(group,[accepted])).toBe("captured");expect(photographyVisualState(group,[accepted])).toBe("attention");
  expect(evidencePhoto(group,accepted).sampleImage).toBe(vehicleIdentificationGuides[2].src);
  expect(evidencePhoto(group,accepted,false).sampleImage).toBe(vehicleIdentificationGuides[0].src);
 });
 it("retake preserves identity/reason and blocks completion without touching other ten",()=>{
  const records=photos();records.find(p=>p.requirementId===group.id)!.status="retake-requested";
  expect(photographyProgress(template,records)).toMatchObject({completed:10,total:11,complete:false,attention:true});
 });
 it("keeps video/odometer separate and preserves uploaded vs processing/verified thresholds",()=>{
  const records=photos(),media=acceptedMedia("v2",namespace,template,records,data);
  const inspection=adaptInspection(structuredClone(inspectionFixture));inspection.location=developmentLocationAdapter.initialLocation;
  const capture={media,videoDurationSeconds:28,odometer:data.odometer,capture:capturePackageProgress(template,records,data)};
  const jobs:UploadJob[]=media.map(m=>({...m,id:uploadJobId(m),current:true,upload:"uploaded",verification:"processing",attemptCount:1,bytesUploaded:m.byteSize}));
  const ready=deriveInspectionSummary(inspection,"ref",template,capture,jobs);expect(ready.readiness.canSubmit).toBe(true);expect(ready.upload.total).toBe(12);expect(ready.processingCount).toBe(12);
  jobs[0].upload="queued";expect(deriveInspectionSummary(inspection,"ref",template,capture,jobs).readiness.canSubmit).toBe(false);
  expect(capturePackageProgress(template,records,{...data,odometer:undefined}).complete).toBe(false);
  expect(capturePackageProgress(template,records,{...data,video360:undefined}).complete).toBe(false);
 });
});

describe("durable choice and revision safety",()=>{
 it.each(vehicleIdentificationGuides)("persists $id with source-first capture and accepted evidence",async choice=>{
  await selectPhotoAlternative(namespace,group.id,choice.id);expect((await readPhoto(photoKey(namespace,group.id)))?.selectedAlternativeId).toBe(choice.id);
  await store.saveDraft(namespace,group.id,{blob,alternativeId:choice.id,capturedAt:"now"});
  await store.confirm(namespace,group.id);const saved=await readPhoto(photoKey(namespace,group.id));
  expect(saved).toMatchObject({alternativeId:choice.id,selectedAlternativeId:choice.id,status:"captured"});expect(saved?.blob).toBe(blob);expect(saved?.draft).toBeUndefined();
 });
 it("keeps accepted A until B confirms, archives old bytes, and rejects late queue callbacks",async()=>{
  await store.saveDraft(namespace,group.id,{blob,alternativeId:"pillar",capturedAt:"a"});await store.confirm(namespace,group.id);
  const a=(await store.list(namespace))[0];await queue.reconcile(namespace,acceptedMedia("v2",namespace,template,[a],{namespace}));const old=(await queue.claim("old",Date.now()))!;
  await selectPhotoAlternative(namespace,group.id,"seat");await store.saveDraft(namespace,group.id,{blob:new Blob(["replacement"],{type:"image/jpeg"}),alternativeId:"seat",capturedAt:"b"});
  const pending=(await store.list(namespace))[0];expect(pending.alternativeId).toBe("pillar");expect(pending.blob).toBe(blob);expect(requirementStatus(group,[pending])).toBe("captured");
  const revision=pending.draft!.revisionId!;await store.confirm(namespace,group.id,revision);
  const b=(await store.list(namespace))[0];expect(b.alternativeId).toBe("seat");expect(b.revisionId).not.toBe(a.revisionId);
  expect((await readPhoto(photoRevisionKey(a.key,a.revisionId!)))?.blob).toBe(blob);expect(await store.list(namespace)).toHaveLength(1);
  await queue.reconcile(namespace,acceptedMedia("v2",namespace,template,[b],{namespace}));expect(await queue.update(old.id,"old",{upload:"uploaded"})).toBe(false);
  const jobs=await queue.list();expect(jobs.filter(j=>j.current)).toHaveLength(1);expect(jobs.find(j=>j.current)?.alternativeId).toBe("seat");expect(jobs.find(j=>j.id===old.id)?.upload).toBe("cancelled");
 });
 it("discards a replacement without deleting accepted identity or allowing stale confirmation",async()=>{
  await store.saveDraft(namespace,group.id,{blob,alternativeId:"engine",capturedAt:"a"});await store.confirm(namespace,group.id);
  await store.saveDraft(namespace,group.id,{blob,alternativeId:"seat",capturedAt:"b"});const revision=(await store.list(namespace))[0].draft!.revisionId;
  await store.saveDraft(namespace,group.id,{blob,alternativeId:"windshield",capturedAt:"c"});await expect(store.confirm(namespace,group.id,revision)).rejects.toThrow("نسخه");
  await store.discardDraft(namespace,group.id);expect((await store.list(namespace))[0].alternativeId).toBe("engine");
 });
});

describe("policy pins and Admin history",()=>{
 it("pins new inspections to v2 and survives reload and concurrent default reads",async()=>{
  const [a,b]=await Promise.all([inspectionPhotoTemplate("fresh"),inspectionPhotoTemplate("fresh")]);expect(a).toEqual(template);expect(b).toEqual(template);
  expect((await readFacts("fresh"))?.photographyTemplate).toEqual(template);expect(await pinPhotographyTemplate("fresh",legacyPhotographyTemplate)).toEqual(template);
 });
 it("retains pre-policy facts and twelve-photo namespaces without rewriting evidence",async()=>{
  await saveFacts("old",{location:developmentLocationAdapter.initialLocation});expect(await inspectionPhotoTemplate("old")).toEqual(legacyPhotographyTemplate);
  const ns=photoNamespace("old-media",legacyPhotographyTemplate.templateId,1);await store.saveDraft(ns,"chassis-number",{blob,capturedAt:"legacy"});await store.confirm(ns,"chassis-number");
  expect(await inspectionPhotoTemplate("old-media")).toEqual(legacyPhotographyTemplate);expect((await store.list(ns))[0].requirementId).toBe("chassis-number");
  expect(templateCapturePlan(legacyPhotographyTemplate).totalRequired).toBe(12);
 });
 it("retains the published v1 identity for existing White-Label settings while defaulting Admin to v2",()=>{
  const current=initialAdminWorkspace().templates[0];expect(current.currentPublishedId).toBe(template.templateId+":v2");
  expect(current.versions.find(v=>v.id===template.templateId+":v1")).toMatchObject({state:"published",snapshot:legacyPhotographyTemplate});
 });
 it("validates v1 separately and prevents Admin weakening v2 or expanding the group",async()=>{
  expect(adminSnapshotSchema.safeParse(template).success).toBe(true);expect(adminSnapshotSchema.safeParse(legacyPhotographyTemplate).success).toBe(true);
  const weakened=structuredClone(template);weakened.sections[0].photoRequirements[0].required=false;expect(adminSnapshotSchema.safeParse(weakened).success).toBe(false);
  const expanded=structuredClone(template);expanded.sections[5].photoRequirements.push(legacyPhotographyTemplate.sections[5].photoRequirements[2]);expect(adminSnapshotSchema.safeParse(expanded).success).toBe(false);
  const legacyWorkspace=initialAdminWorkspace(legacyPhotographyTemplate),repo=new MockAdminRepository(new MemoryAdminPersistence(legacyWorkspace));
  const created=await repo.createTemplate(actors["platform-admin"],"قالب جدید");expect(created.versions[0].snapshot.photoPolicyVersion).toBe(2);expect(created.versions[0].snapshot.sections.flatMap(s=>s.photoRequirements)).toHaveLength(11);
  expect((await repo.read(actors["platform-admin"])).templates[0].versions[0].snapshot).toEqual(legacyPhotographyTemplate);
 });
 it("scoped correction contains only the requested logical group, not four additional photographs",()=>{
  const request={template,items:[{id:"choice",kind:"photo",requirementId:group.id,reviewerReason:"کد خوانا نیست.",originalEvidenceId:"original"}]} as EvidenceRequest;
  const partial=requestTemplate(request);expect(partial.sections.flatMap(s=>s.photoRequirements)).toHaveLength(1);expect(partial.sections[0].photoRequirements[0].choice).toEqual(group.choice);
 });
});
