import { test, expect } from "@playwright/test";
test("production cannot serve restricted models or the experimental preview",async({request})=>{
  expect((await request.get("/api/development/vehicle-model/original")).status()).toBe(404);
  expect((await request.get("/api/development/vehicle-model/mobile")).status()).toBe(404);
  expect((await request.get("/assets/models/kia_sportage_gt_line_2023.glb")).status()).toBe(404);
  expect((await request.get("/inspection/insp_demo/capture/preview-3d")).status()).toBe(404);
});
