import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { render, screen, waitFor } from "@testing-library/react";
import { vehicleGuideAssets, vehicleGhostAssets, vehicleHeroAssets, vehicleViewAssets, resolveVehicleGuide, isVehicleAssetUrl } from "@/config/vehicle-assets";
import { customerReferenceAssets } from "@/config/customer-reference-assets";
import { brandingAssets } from "@/config/branding-assets";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import { validateContext, type SiteBootstrap } from "@/config/site-settings.schema";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { adminSnapshotSchema } from "@/features/admin/model";
import { artworkForRequirement } from "@/features/photography/vehicle-photo-config";
import { PhotoImage } from "@/features/photography/photo-image";
const digest=(file:string)=>createHash("sha256").update(readFileSync(file)).digest("hex");
const boot:SiteBootstrap={schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"};
afterEach(()=>vi.restoreAllMocks());
describe("supplied sedan image boundaries",()=>{
 it("keeps twenty supplied sources and twelve exact required guides",()=>{
  const approved = JSON.parse(readFileSync("docs/NEW_VEHICLE_ASSETS.json", "utf8")) as { assets: { source: string }[] };
  const names = approved.assets.filter(asset => asset.source.includes("/source/")).map(asset => asset.source.split("/").at(-1));
  expect(names).toHaveLength(20);
  expect(readdirSync("references/assets/new-vehicle/source")).toEqual(expect.arrayContaining(names));
  const photos=template.sections.flatMap(section=>section.photoRequirements);expect(template.sections).toHaveLength(7);expect(photos).toHaveLength(12);
  for(const photo of photos)expect(digest("public"+photo.sampleImage)).toBe(digest("references/assets/new-vehicle/source/"+photo.id+".webp"));
 });
 it("copies the supplied hero and ghost bytes without generating or mirroring",()=>{
  for(const [folder,assets] of [["hero",vehicleHeroAssets],["ghost-guides",vehicleGhostAssets]] as const)
   for(const src of Object.values(assets))expect(digest("public"+src)).toBe(digest("references/assets/new-vehicle/generated/"+folder+"/"+src.split("/").at(-1)));
 });
 it("verifies all eight ghost guides have genuine transparent and translucent pixels",async()=>{
  expect(Object.keys(vehicleGhostAssets)).toHaveLength(8);
  for(const src of Object.values(vehicleGhostAssets)){
   const {data,info}=await sharp("public"+src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   let transparent=0,partial=0;for(let i=3;i<data.length;i+=info.channels){if(data[i]===0)transparent++;else if(data[i]<255)partial++;}
   expect(transparent,src).toBeGreaterThan(0);expect(partial,src).toBeGreaterThan(0);
  }
 });
 it("maps eight physical view roles explicitly without duplicate navigation copies",()=>{
  expect(Object.keys(vehicleViewAssets)).toEqual(["top","rear","right","front","left","body","cabin","engine-specs"]);
  expect(vehicleViewAssets.left).not.toBe(vehicleViewAssets.right);expect(vehicleViewAssets.front).toBe(vehicleGuideAssets["front-plate"].src);
  for(const src of Object.values(vehicleViewAssets))expect(readFileSync("public"+src).length).toBeGreaterThan(0);
 });
 it("keeps image and marker coordinate layers at exact source proportions",async()=>{
  for(const [id,asset] of Object.entries(vehicleGuideAssets)){
   const metadata=await sharp("public"+asset.src).metadata();expect([asset.width,asset.height]).toEqual([metadata.width,metadata.height]);
   expect(artworkForRequirement(id).aspectRatio).toBe(asset.width/asset.height);
  }
 });
 it("resolves only exact legacy built-in guides without mutating pinned history",()=>{
  const legacy=structuredClone(template);for(const photo of legacy.sections.flatMap(section=>section.photoRequirements))photo.sampleImage="/assets/inspection/photo-guides/"+photo.id+".webp";
  const before=JSON.stringify(legacy);expect(adminSnapshotSchema.safeParse(legacy).success).toBe(true);expect(JSON.stringify(legacy)).toBe(before);
  expect(resolveVehicleGuide(legacy.sections[0].photoRequirements[0].sampleImage)).toBe(vehicleGuideAssets["front-45-right"].src);
  for(const src of ["blob:captured","https://tenant.example/custom.webp","/images/custom.webp","/assets/inspection/photo-guides/unknown.webp"])expect(resolveVehicleGuide(src)).toBe(src);
 });
 it("never substitutes a reference image for a persisted customer Blob",async()=>{
  const blob=new Blob(["accepted customer evidence"],{type:"image/jpeg"});const create=vi.spyOn(URL,"createObjectURL").mockReturnValue("blob:accepted-evidence");const revoke=vi.spyOn(URL,"revokeObjectURL").mockImplementation(()=>{});
  const view=render(<PhotoImage blob={blob} src="/assets/inspection/photo-guides/front-45-right.webp" alt="مدرک مشتری" />);
  await waitFor(()=>expect(screen.getByAltText("مدرک مشتری")).toHaveAttribute("src","blob:accepted-evidence"));expect(create).toHaveBeenCalledWith(blob);view.unmount();expect(revoke).toHaveBeenCalledWith("blob:accepted-evidence");
 });
 it("uses sedan defaults while preserving the non-vehicle OTP illustration",()=>{
  expect(brandingAssets.landing.src).toBe(vehicleHeroAssets.landing);expect(brandingAssets.referral.src).toBe(vehicleHeroAssets.introduction);expect(brandingAssets.submission.src).toBe(vehicleHeroAssets.receipt);expect(brandingAssets.otp.src).toBe(customerReferenceAssets.otp);
 });
 it("permits only known new public assets, preserving tenant custom URLs",()=>{
  const settings=defaultSiteSettings("demo");for(const src of Object.values(vehicleHeroAssets)){settings.images.landing=src;expect(()=>validateContext(boot,settings,"https://visit.example")).not.toThrow();}
  settings.images.landing="/images/tenant-custom.webp";expect(()=>validateContext(boot,settings,"https://visit.example")).not.toThrow();
  for(const src of ["/assets/inspection-vehicle/hero/../private.webp","/assets/inspection-vehicle/hero/landing-vehicle.webp?override=1","/assets/unapproved.webp"]){expect(isVehicleAssetUrl(src)).toBe(false);settings.images.landing=src;expect(()=>validateContext(boot,settings,"https://visit.example")).toThrow();}
 });
});
