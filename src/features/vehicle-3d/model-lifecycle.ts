import { Box3, Mesh, MeshPhysicalMaterial, Texture, Vector3, type Object3D, type Material } from "three";
import { vehicleSemanticAlias } from "./vehicle-model-config";

export function disposeVehicle(root: Object3D) {
  const geometries = new Set<Mesh["geometry"]>(), materials = new Set<Material>(), textures = new Set<Texture>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
    }
  });
  textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose());
  root.clear();
}
export function applyVehiclePaint(root: Object3D, paint: string) {
  root.traverse(object=>{
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material)?object.material:[object.material])
      if (material instanceof MeshPhysicalMaterial && material.name === "CarPaint") material.color.set(paint);
  });
}
export function prepareVehicle(root: Object3D, paint: string) {
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root), center = box.getCenter(new Vector3());
  // Keep real metre scale/orientation; no mirroring and no resize to arbitrary unit cube.
  root.position.add(new Vector3(-center.x, -box.min.y, -center.z));
  const regionMaterials = new Map<string, Material>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const names = []; let parent: Object3D | null = object;
    while (parent) { names.unshift(parent.name); parent = parent.parent; }
    const sourcePaths = object.userData.sourcePaths as string[] | undefined;
    object.userData.inspectionRegion = sourcePaths ? object.userData.semanticRegion : vehicleSemanticAlias(names.join("/"), new Box3().setFromObject(object).getCenter(new Vector3()).toArray());
    const multiple = Array.isArray(object.material);
    const values: Material[] = multiple ? object.material : [object.material];
    const clones = values.map(material => {
      const key = `${material.uuid}:${object.userData.inspectionRegion}`;
      const existing = regionMaterials.get(key);
      if (existing) return existing;
      const clone: Material = material.clone();
      regionMaterials.set(key, clone);
      return clone;
    });
    // A one-material glTF primitive has no geometry groups: preserve scalar material shape.
    object.material = multiple ? clones : clones[0];
    for (const material of values) material.dispose();
    for (const material of clones) {
      if (!(material instanceof MeshPhysicalMaterial)) continue;
      if (material.name === "CarPaint") {
        material.color.set(paint); material.metalness = .5; material.roughness = .28; material.clearcoat = 1; material.clearcoatRoughness = .16;
      } else if (material.name === "tire") { material.metalness = 0; material.roughness = .86; }
      else if (/leather|plastic|fabrics|csrpet|seat/i.test(material.name)) { material.metalness = 0; material.roughness = .72; }
      else if (material.name === "chrome") { material.metalness = .9; material.roughness = .2; }
      else if (/window|glass_tinted/.test(material.name)) { material.roughness = .13; material.metalness = .05; material.depthWrite = false; }
      if (material.transparent) material.depthWrite = false;
      material.envMapIntensity = .8;
      material.userData.baseEmissive = material.emissive.clone();
      material.userData.baseEmissiveIntensity = material.emissiveIntensity;
    }
  });
  root.updateMatrixWorld(true);
  return { size: box.getSize(new Vector3()).toArray() };
}
