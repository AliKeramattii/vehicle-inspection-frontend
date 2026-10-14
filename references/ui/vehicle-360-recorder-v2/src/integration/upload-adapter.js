import { listPendingRecordings, markRecordingQueued } from '../storage/recordings-db.js';
/**
 * Adapter ONLY. The host must implement its durable production upload queue.
 * This module never posts to a guessed API, never selects local videos,
 * never treats saved evidence as uploaded/verified, and never duplicates jobs.
 *
 * Host integration:
 * window.VehicleInspectionUploadBridge = {
 *   enqueueRecordedWalkaround: async ({recordingId, blob, mimeType, durationMs, evidenceType}) => {
 *     // Bridge to EXISTING revision-based idempotent queue, return {jobId}.
 *   }
 * }
 */
export async function enqueueWithHostQueue(record){
  const enqueue = window.VehicleInspectionUploadBridge?.enqueueRecordedWalkaround;
  if (typeof enqueue !== 'function') {
    return {connected:false, message:'ویدیو روی دستگاه ذخیره شد. اتصال به صف آپلود اصلی پروژه هنوز انجام نشده است.'};
  }
  const result = await enqueue({
    recordingId:record.id, blob:record.blob, mimeType:record.mimeType,
    durationMs:record.durationMs, evidenceType:'walkaround-360'
  });
  await markRecordingQueued(record.id,result?.jobId ?? null);
  return {connected:true,jobId:result?.jobId ?? null,message:'ویدیو در صف آپلود موجود پروژه ثبت شد.'};
}

/** Re-hand off accepted evidence after a reload/crash; host MUST dedupe on recordingId. */
export async function resumePendingHandoffs(){
  if(typeof window.VehicleInspectionUploadBridge?.enqueueRecordedWalkaround !== 'function')return;
  const pending=await listPendingRecordings();
  for(const record of pending){
    try{await enqueueWithHostQueue(record)}catch(err){
      console.warn('Recording handoff awaits queue recovery',record.id,err);
    }
  }
}
