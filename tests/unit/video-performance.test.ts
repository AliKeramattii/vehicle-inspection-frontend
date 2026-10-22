import {afterEach,describe,expect,it,vi} from "vitest";
import {createVideoRecorderService} from "@/lib/media/video-recorder";
import type {CameraService} from "@/lib/media/camera-service";
afterEach(()=>vi.unstubAllGlobals());
function setup(rejectFirst=false,rejectAll=false){
 let time=0,released=false;
 const track={getSettings:()=>released?{}:{width:1280,height:720,frameRate:24},addEventListener:vi.fn(),removeEventListener:vi.fn()};
 const stream={getVideoTracks:()=>[track]} as unknown as MediaStream;
 const camera:CameraService={open:vi.fn(async()=>stream),capture:vi.fn(),stop:vi.fn(()=>{released=true;})};
 const options:MediaRecorderOptions[]=[];
 class Recorder{
  static isTypeSupported(){return true;}state="inactive";mimeType:string;videoBitsPerSecond=2_200_000;
  onstart?:()=>void;onstop?:()=>void;onerror?:()=>void;onpause?:()=>void;onresume?:()=>void;ondataavailable?:(e:{data:Blob})=>void;
  constructor(_stream:MediaStream,option:MediaRecorderOptions){options.push(option);if(rejectAll||rejectFirst&&options.length===1)throw new DOMException("unsupported fixture","NotSupportedError");this.mimeType=option.mimeType!;}
  start(){this.state="recording";this.onstart?.();}stop(){this.state="inactive";this.ondataavailable?.({data:new Blob(["recorded"],{type:this.mimeType})});this.onstop?.();}
 }
 vi.stubGlobal("MediaRecorder",Recorder);vi.stubGlobal("navigator",{mediaDevices:{getSupportedConstraints:()=>({width:true,height:true,frameRate:true})}});
 return {service:createVideoRecorderService(camera,()=>time),camera,options,advance:()=>{time=2000;},track};
}
describe("recording profile and negotiated media metadata",()=>{
 it("uses supported constraints and records actual settings before tracks stop",async()=>{const f=setup();const session=await f.service.open(vi.fn());expect(f.camera.open).toHaveBeenCalledWith("environment",{width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}});await session.start();f.advance();const video=await session.stop();expect(video.capture).toMatchObject({profileId:"existing-1080p",requested:{width:1920,height:1080,videoBitsPerSecond:2_500_000},actual:{width:1280,height:720,frameRate:24,videoBitsPerSecond:2_200_000}});expect(f.camera.stop).toHaveBeenCalledTimes(1);session.dispose();expect(f.camera.stop).toHaveBeenCalledTimes(1);});
 it("tries another supported MIME when construction rejects the first codec",async()=>{const f=setup(true);const session=await f.service.open(vi.fn());expect(f.options.map(o=>o.mimeType)).toEqual(["video/webm;codecs=vp8","video/mp4"]);expect(session.mimeType).toBe("video/mp4");await session.start();f.advance();expect((await session.stop()).blob.type).toBe("video/mp4");});
 it("releases the opened stream when every advertised codec fails construction",async()=>{const f=setup(false,true);await expect(f.service.open(vi.fn())).rejects.toThrow();expect(f.camera.stop).toHaveBeenCalledTimes(1);});
});
