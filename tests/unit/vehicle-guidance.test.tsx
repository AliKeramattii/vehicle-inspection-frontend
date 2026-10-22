import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { vehicleIdentificationGuides, identificationPhoto, hasIdentificationChoices } from "@/features/photography/vehicle-identification-guides";
import { useIdentificationGuide } from "@/features/photography/use-identification-guide";
import { PhotoGuidance } from "@/features/photography/photo-guidance";
import { PhotoCamera } from "@/features/photography/photo-camera";
import { WalkaroundPreview } from "@/features/capture-package/walkaround-preview";
import { PhotoReview } from "@/features/photography/photo-review";
import { photoAlignmentView, PhotoAlignmentGuide } from "@/features/photography/photo-alignment-guide";
import { vehicleReadinessAssets, vehicleIdentificationAssets } from "@/config/vehicle-assets";
import type { CameraService } from "@/lib/media/camera-service";
const section = template.sections.find(section => section.id === "engine-details")!;
const photo = section.photoRequirements.find(photo => photo.id === "spec-plate")!;
beforeEach(() => sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());
const hash = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
describe("supplied guidance, not extra evidence", () => {
 it("wires exact readiness and technical bytes without rewriting originals", () => {
  for (const [file,src] of [["readiness-clean-vehicle.webp",vehicleReadinessAssets.clean],["readiness-open-space.webp",vehicleReadinessAssets.space],["spec-plate-2.webp",vehicleIdentificationAssets.seat],["Pearl-white sedan windshield VIN inspection.webp",vehicleIdentificationAssets.windshield]]) expect(hash("public"+src)).toBe(hash("references/assets/new-vehicle/guides/"+file));
 });
 it("keeps eleven requirements and one identity for all four variants, including pinned samples", () => {
  expect(template.sections.flatMap(s => s.photoRequirements)).toHaveLength(11);
  expect(vehicleIdentificationGuides).toHaveLength(4);
  for (const choice of vehicleIdentificationGuides) expect(identificationPhoto(photo,choice)).toMatchObject({ id:photo.id, required:true, sampleImage:choice.src, instructions:choice.instructions });
  expect(hasIdentificationChoices({...photo,sampleImage:"/assets/inspection/photo-guides/spec-plate.webp"})).toBe(true);
  expect(hasIdentificationChoices({...photo,choice:undefined,sampleImage:"/images/tenant-vin.webp"})).toBe(false);
 });
 it("offers four real buttons before guidance, with keyboard activation and change action", async () => {
  render(<PhotoGuidance photo={photo} section={section} records={[]} inspectionId="demo" />);
  expect(screen.queryByRole("link",{name:"باز کردن دوربین"})).toBeNull();
  expect(screen.getAllByRole("button",{name:/پیشنهاد/})).toHaveLength(4);
  await act(async()=>{fireEvent.click(screen.getByRole("button",{name:vehicleIdentificationGuides[3].title}));});
  expect(screen.getByRole("img",{name:/نمونه صحیح/})).toHaveAttribute("src",expect.stringContaining("windshield-vin.webp"));
  expect(screen.getByRole("link",{name:"باز کردن دوربین"})).toHaveAttribute("href","/inspection/demo/capture/photo/spec-plate/camera");
  await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"تغییر محل کد"}));});
  expect(screen.getAllByRole("button",{name:/پیشنهاد/})).toHaveLength(4);
 });
 it("survives component navigation but isolates inspection, requirement and reviewer-request scopes", async () => {
  const a=renderHook(()=>useIdentificationGuide(photo,"one","request-a"));
  await act(async()=>{await a.result.current.select("seat");});expect(a.result.current.choice?.id).toBe("seat");a.unmount();
  const b=renderHook(()=>useIdentificationGuide(photo,"one","request-a"));expect(b.result.current.choice?.id).toBe("seat");
  const c=renderHook(()=>useIdentificationGuide(photo,"one","request-b"));expect(c.result.current.choice).toBeUndefined();
  const d=renderHook(()=>useIdentificationGuide(photo,"two","request-a"));expect(d.result.current.choice).toBeUndefined();
 });
 it("does not open the camera before a VIN choice, including direct camera navigation", async () => {
  const service:CameraService={open:vi.fn(async()=>({} as MediaStream)),stop:vi.fn(),capture:vi.fn()};
  const view=render(<PhotoCamera photo={photo} inspectionId="demo" onCapture={vi.fn()} service={service} />);
  await act(async()=>{});expect(service.open).not.toHaveBeenCalled();
  vi.spyOn(HTMLMediaElement.prototype,"play").mockResolvedValue();
  fireEvent.click(screen.getByRole("button",{name:vehicleIdentificationGuides[2].title}));
  await waitFor(()=>expect(service.open).toHaveBeenCalledOnce());
  expect(document.querySelector('input[type="file"]')).toBeNull();view.unmount();expect(service.stop).toHaveBeenCalled();
 });
 it("uses the selected comparison sample while actual accepted evidence stays a Blob", async () => {
  const choice=renderHook(()=>useIdentificationGuide(photo,"demo"));await act(async()=>{await choice.result.current.select("seat");});choice.unmount();
  const blob=new Blob(["customer evidence"],{type:"image/jpeg"});vi.spyOn(URL,"createObjectURL").mockReturnValue("blob:evidence");
  render(<PhotoReview photo={photo} section={section} inspectionId="demo" record={{key:"one",namespace:"test",requirementId:photo.id,alternativeId:"seat",status:"captured",blob}} onConfirm={vi.fn()} onRetake={vi.fn()} />);
  await waitFor(()=>expect(screen.getByRole("img",{name:/عکس شما:/})).toHaveAttribute("src","blob:evidence"));
  expect(screen.getByRole("img",{name:/نمونه صحیح:/})).toHaveAttribute("src",expect.stringContaining("spec-plate-2.webp"));
  expect(screen.queryByRole("checkbox")).toBeNull();
 });
 it("keeps video movement guidance separate, with an honest static fallback until a cleared clip exists", () => {
  const view=render(<WalkaroundPreview />);expect(document.querySelector("video")).toBeNull();expect(document.querySelector(".photo-alignment-guide")).toBeNull();
  expect(screen.getByRole("img",{name:/نمای بالای خودرو/})).toHaveAttribute("src",expect.stringContaining("car-roof.webp"));
  view.rerender(<WalkaroundPreview clip="/approved-test-clip.mp4" />);const video=document.querySelector("video")!;expect(video).toHaveAttribute("controls");expect(video).not.toHaveAttribute("autoplay");
  Object.defineProperty(video,"duration",{value:12});fireEvent.loadedMetadata(video);expect(document.querySelector("video")).toBeNull();
 });
 it("maps physical photo views without mirroring and omits vehicle outlines on technical captures",()=>{
  const photos=template.sections.flatMap(s=>s.photoRequirements);
  for(const [id,view] of [["front-45-left","front-45-left"],["front-45-right","front-45-right"],["back-45-left","rear-45-left"],["back-45-right","rear-45-right"],["front-plate","front"],["rear-plate","rear"]]) expect(photoAlignmentView(photos.find(p=>p.id===id)!)).toBe(view);
  expect(photoAlignmentView(photo)).toBeUndefined();
  render(<PhotoAlignmentGuide photo={photos[0]}/>);expect(document.querySelector('.photo-alignment-guide')).toHaveAttribute("aria-hidden","true");
  expect(document.querySelector('.photo-alignment-guide img')).toHaveAttribute("alt","");
 });
});


it("serializes rapid durable choices and never lets an old response replace the last choice",async()=>{
 let release!:()=>void;const first=new Promise<void>(resolve=>{release=resolve;});
 const save=vi.fn().mockImplementationOnce(()=>first).mockResolvedValue(undefined);
 const hook=renderHook(()=>useIdentificationGuide(photo,"race","capture",{onSelect:save}));
 let a!:Promise<void>,b!:Promise<void>;
 act(()=>{a=hook.result.current.select("pillar");b=hook.result.current.select("seat");});
 await act(async()=>{await Promise.resolve();});expect(save).toHaveBeenCalledTimes(1);
 await act(async()=>{release();await Promise.all([a,b]);});
 expect(save.mock.calls.map(c=>c[0])).toEqual(["pillar","seat"]);
 expect(sessionStorage.getItem(JSON.stringify(["identification-guide-v1","race","capture",photo.id]))).toBe("seat");
});
