import { isEditLocked } from "./submission-model";
import { submissionService } from "./submission-service";
/** Defense at mutation boundaries as well as route guard; server/unit mocks have no durable browser state. */
export async function assertInspectionEditable(inspectionId: string) {
  if (typeof indexedDB === "undefined") return;
  if (isEditLocked(await submissionService.recover(inspectionId))) throw new Error("این بازدید برای بررسی ارسال شده یا در حال ارسال است و فعلاً امکان ویرایش ندارد.");
}
export async function assertCaptureEditable(namespace: string) {
  const parts: unknown = JSON.parse(namespace);
  if (!Array.isArray(parts) || typeof parts[0] !== "string") throw new Error("شناسه بازدید معتبر نیست.");
  await assertInspectionEditable(parts[0]);
}
