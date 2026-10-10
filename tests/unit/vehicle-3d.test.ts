import { describe, expect, it, vi } from "vitest";
import { Box3, BoxGeometry, Group, Mesh, MeshPhysicalMaterial, PerspectiveCamera, Texture, Vector3 } from "three";
import { vehiclePreviewEnabled, isLoopbackHost, isLoopbackRequestHost } from "@/features/vehicle-3d/preview-gate";
import { vehicleAnchors, contextualRequirements } from "@/features/vehicle-3d/vehicle-anchor-map";
import { requirementView, vehicleViewPresets } from "@/features/vehicle-3d/vehicle-view-presets";
import { adaptiveQuality, modelVariant, vehicleSemanticAlias } from "@/features/vehicle-3d/vehicle-model-config";
import { applyVehiclePaint, disposeVehicle, prepareVehicle } from "@/features/vehicle-3d/model-lifecycle";
import { boundsCorners, keepVehicleInFrame } from "@/features/vehicle-3d/camera-framing";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { photoRequirementEntry, photographyVisualState } from "@/features/photography/photography-model";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { readFileSync } from "node:fs";
import { vehicleGraphicsCapability } from "@/features/vehicle-3d/graphics-capability";

describe("restricted optional vehicle preview", () => {
  it("requires explicit development opt-in and cannot be enabled in production", () => {
    expect(vehiclePreviewEnabled("development","1")).toBe(true);
    for(const mode of ["production","test",undefined]) expect(vehiclePreviewEnabled(mode,"1")).toBe(false);
    expect(vehiclePreviewEnabled("development",undefined)).toBe(false);
    expect(isLoopbackHost("localhost")).toBe(true); expect(isLoopbackHost("[::1]")).toBe(true); expect(isLoopbackHost("10.66.66.156")).toBe(false);
    expect(isLoopbackRequestHost("localhost:3103")).toBe(true); expect(isLoopbackRequestHost("[::1]:3103")).toBe(true); expect(isLoopbackRequestHost("%%%" )).toBe(false);
    expect(isLoopbackRequestHost("user@localhost")).toBe(false);expect(isLoopbackRequestHost("localhost/path")).toBe(false);
  });
  it("uses real physical coordinates without mirroring for RTL", () => {
    expect(vehicleViewPresets.front[2]).toBeLessThan(0); expect(vehicleViewPresets.rear[2]).toBeGreaterThan(0);
    expect(vehicleViewPresets.left[0]).toBeLessThan(0); expect(vehicleViewPresets.right[0]).toBeGreaterThan(0);
    expect(requirementView("back-45-left")).toBe("rear-left"); expect(requirementView("car-roof")).toBe("top");
  });
  it("anchors reference actual configured requirements, never create photos or pretend technical details exist", () => {
    const ids=template.sections.flatMap(section=>section.photoRequirements.map(photo=>photo.id));
    expect(new Set(vehicleAnchors.map(anchor=>anchor.requirementId)).size).toBe(vehicleAnchors.length);
    for(const anchor of vehicleAnchors) { expect(ids).toContain(anchor.requirementId); expect(Math.abs(anchor.point[0])).toBeLessThan(1.2); expect(Math.abs(anchor.point[2])).toBeLessThan(2.5); }
    for(const id of contextualRequirements) expect(vehicleAnchors.some(anchor=>anchor.requirementId===id)).toBe(false);
    expect(ids).toHaveLength(12);
  });
  it("reuses pending, completed, draft and reviewer navigation without marker state storage", () => {
    const photo=template.sections[0].photoRequirements[0], blob=new Blob(["photo"]);
    const accepted:LocalPhoto={key:"k",namespace:"n",requirementId:photo.id,status:"captured",blob};
    expect(photoRequirementEntry(photo,[]).view).toBe("guide"); expect(photoRequirementEntry(photo,[accepted]).view).toBe("review");
    expect(photographyVisualState(photo,[accepted])).toBe("complete");
    const replacement={...accepted,draft:{blob,capturedAt:"2026-10-10"}};
    expect(photographyVisualState(photo,[replacement])).toBe("attention"); expect(photoRequirementEntry(photo,[replacement]).view).toBe("review");
    const retake={...accepted,status:"retake-requested" as const,reviewerReason:"پلاک خوانا نیست."};
    expect(photoRequirementEntry(photo,[retake]).view).toBe("guide"); expect(photographyVisualState(photo,[retake])).toBe("attention");
  });
  it("chooses one quality variant, not both mobile and desktop", () => {
    expect(adaptiveQuality(390,8)).toBe("mobile"); expect(adaptiveQuality(1440,8)).toBe("desktop"); expect(adaptiveQuality(1440,2)).toBe("reduced"); expect(modelVariant("reduced")).toBe("mobile");
  });
  it("reuses the capability result contract without requiring graphics for the 2D journey", () => {
    expect(vehicleGraphicsCapability(false)).toEqual({id:"webgl",status:"unsupported"});
    expect(vehicleGraphicsCapability(true).status).toBe("ready");
  });
  it("maps source aliases without changing original mesh names", () => {
    expect(vehicleSemanticAlias("Ext_Sportage_2022_base_Door_FL_carpaint.001_202")).toBe("Door_FL");
    expect(vehicleSemanticAlias("Ext_Sportage_2022_GTL_frontbumper_carpaint.001_229")).toBe("Bumper_Front");
    expect(vehicleSemanticAlias("RIM_ROOT/Wheels_14/Ext_19inch_Type_A",[-.9,.4,-1.3])).toBe("Wheel_FL");
  });
  it("normalizes bounds and applies paint only to body materials with independent region highlighting", () => {
    const root=new Group(), paint=new MeshPhysicalMaterial({name:"CarPaint"}), rubber=new MeshPhysicalMaterial({name:"tire"});
    const a=new Mesh(new BoxGeometry(),paint), b=new Mesh(new BoxGeometry(),paint), tire=new Mesh(new BoxGeometry(),rubber);
    a.name="Door_FL_carpaint";b.name="Door_FR_carpaint";tire.name="Wheel";root.add(a,b,tire);
    prepareVehicle(root,"#e8edf2");
    expect(root.position.y).toBe(.5); expect(a.name).toBe("Door_FL_carpaint"); expect(a.material).not.toBe(b.material);
    const mat=a.material as MeshPhysicalMaterial; expect(Array.isArray(mat)).toBe(false); expect(mat.color.getHexString()).toBe("e8edf2"); expect(mat.clearcoat).toBe(1);
    const tireMat=tire.material as MeshPhysicalMaterial; expect(tireMat.metalness).toBe(0); expect(tireMat.color.getHexString()).toBe("ffffff");
    const geometry=a.geometry;applyVehiclePaint(root,"#c8ccd0");expect(mat.color.getHexString()).toBe("c8ccd0");expect(a.geometry).toBe(geometry);expect(tireMat.color.getHexString()).toBe("ffffff");
    disposeVehicle(root);
  });
  it("keeps all real bounding corners inside the frame when zooming or orbiting overhead", () => {
    const corners=boundsCorners(new Box3(new Vector3(-1.055,0,-2.26),new Vector3(1.055,1.66,2.26))),target=new Vector3(0,.8,0);
    for(const position of [[4,1.2,0],[0,5.2,.01],[3,2,-3]]) {
      const camera=new PerspectiveCamera(37,360/300,.1,100);camera.position.set(...position as [number,number,number]);camera.lookAt(target);
      expect(keepVehicleInFrame(camera,corners,target,10)).toBe(true);
      camera.updateMatrixWorld();for(const point of corners){const p=point.clone().project(camera);expect(Math.abs(p.x)).toBeLessThanOrEqual(.94);expect(Math.abs(p.y)).toBeLessThanOrEqual(.94);}
      expect(camera.position.distanceTo(target)).toBeLessThanOrEqual(10.001);
    }
  });
  it("disposes shared geometry, materials and textures exactly once and releases model references", () => {
    const root=new Group(), geometry=new BoxGeometry(), texture=new Texture(), material=new MeshPhysicalMaterial({map:texture});
    root.add(new Mesh(geometry,material),new Mesh(geometry,material));
    const gd=vi.spyOn(geometry,"dispose"),md=vi.spyOn(material,"dispose"),td=vi.spyOn(texture,"dispose"); disposeVehicle(root);
    expect(gd).toHaveBeenCalledTimes(1);expect(md).toHaveBeenCalledTimes(1);expect(td).toHaveBeenCalledTimes(1);expect(root.children).toHaveLength(0);
  });
  it("keeps the default customer overview free of viewer/model imports", () => {
    const source=readFileSync("src/features/photography/photography-overview.tsx","utf8");
    expect(source).not.toMatch(/from ["'].*vehicle-3d/); expect(source).not.toMatch(/three|\.glb/);
  });
});
