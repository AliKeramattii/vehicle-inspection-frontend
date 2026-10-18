import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { UploadProgress } from "@/features/upload/upload-progress";
import { uploadProgress, type UploadJob } from "@/features/upload/upload-model";
const base:UploadJob={id:"a",inspectionId:"demo",namespace:"demo",evidenceKind:"photo",title:"جلو",localBlobKey:"a",revision:"one",mimeType:"image/jpeg",byteSize:10,capturedAt:"now",required:true,current:true,upload:"queued",verification:"not-started",bytesUploaded:0,attemptCount:0};
it("separates binary completion, processing, verification, retry and obsolete revisions",()=>{
 const jobs:UploadJob[]=[{...base,id:"p",upload:"uploaded",verification:"processing"},{...base,id:"v",upload:"uploaded",verification:"verified"},{...base,id:"q",nextRetryAt:123},{...base,id:"f",upload:"failed"},{...base,id:"old",current:false,upload:"uploaded",verification:"verified"}];
 const progress=uploadProgress(jobs,4);expect(progress).toMatchObject({uploaded:2,processing:1,verified:1,queued:1,failed:1,retryScheduled:1,complete:false});
 render(<UploadProgress jobs={jobs} expected={4}/>);
 const breakdown=screen.getByLabelText("وضعیت فایل‌ها");expect(within(breakdown).getByText("در حال پردازش")).toBeVisible();expect(within(breakdown).getByText("تأیید شد")).toBeVisible();expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","2");
});
