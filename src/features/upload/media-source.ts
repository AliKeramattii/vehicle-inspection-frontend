import { readPhoto } from "@/lib/media/photo-store";
import { indexedDBCaptureDataStore } from "@/lib/media/capture-data-store";
import { photoRevision, type UploadJob } from "./upload-model";
import { UploadFailure } from "./retry-policy";

export type MediaBlobReference = Pick<UploadJob, "namespace" | "evidenceKind" | "localBlobKey" | "revision" | "byteSize" | "mimeType">;
export interface UploadMediaSource { read(job: MediaBlobReference): Promise<Blob>; isCurrent(job: MediaBlobReference): Promise<boolean> }
async function lookup(job: MediaBlobReference) {
  if (job.evidenceKind === "photo") {
    const photo = await readPhoto(job.localBlobKey);
    return { blob: photo?.blob, current: Boolean(photo?.blob && photoRevision(photo) === job.revision && photo.status !== "retake-requested") };
  }
  const video = (await indexedDBCaptureDataStore.get(job.namespace)).video360;
  return { blob: video?.accepted?.blob, current: Boolean(video?.accepted && video.accepted.metadata.localBlobKey === job.revision && video.state !== "retakeRequired") };
}
export const durableUploadMedia: UploadMediaSource = {
  async read(job) {
    const { blob, current } = await lookup(job);
    if (!current || !blob?.size) throw new UploadFailure("فایل ذخیره‌شده پیدا نشد یا جایگزین شده است. عکس یا ویدیو را بررسی کنید.", false);
    if (blob.size !== job.byteSize || blob.type !== job.mimeType) throw new UploadFailure("اطلاعات فایل با نسخه ذخیره‌شده تطبیق ندارد. آن را بررسی کنید.", false);
    return blob;
  },
  async isCurrent(job) { return (await lookup(job)).current; },
};
