import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, type Object3D } from "three";
import { resolveSemanticNodes, vehicleNodes as nodes, type VehicleNode } from "@/lib/vehicle/semantic-nodes";
import { developmentVehicleModel, type VehicleModelSource } from "@/lib/vehicle/viewer-config";
import { DevelopmentVehicleModel } from "./development-vehicle-model";

type Props = { bodyColor: string; highlightNodes: readonly VehicleNode[]; source?: VehicleModelSource };
const paintedNodes = new Set<VehicleNode>([nodes.body, nodes.hood, nodes.roof, nodes.doorFrontLeft, nodes.doorFrontRight, nodes.doorRearLeft, nodes.doorRearRight, nodes.fenderFrontLeft, nodes.fenderFrontRight, nodes.quarterRearLeft, nodes.quarterRearRight, nodes.mirrorLeft, nodes.mirrorRight]);
function GlbVehicleModel({ url, bodyColor, highlightNodes }: Props & { url: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const materials: { node?: VehicleNode; material: MeshStandardMaterial; original: Color }[] = [];
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      let parent: Object3D = object;
      let node = resolveSemanticNodes([parent.name])[0];
      while (!node && parent.parent) { parent = parent.parent; node = resolveSemanticNodes([parent.name])[0]; }
      const values = Array.isArray(object.material) ? object.material : [object.material];
      const cloned = values.map((value) => {
        const material = value.clone();
        if (material instanceof MeshStandardMaterial) materials.push({ node, material, original: material.color.clone() });
        return material;
      });
      object.material = Array.isArray(object.material) ? cloned : cloned[0];
    });
    return { root, materials };
  }, [scene]);
  useEffect(() => {
    const primary = new Color("#2563eb");
    for (const { node, material, original } of model.materials) {
      material.color.copy(node && paintedNodes.has(node) ? new Color(bodyColor) : original);
      if (node && highlightNodes.includes(node)) material.color.lerp(primary, .22);
    }
  }, [bodyColor, highlightNodes, model]);
  useEffect(() => () => { model.root.traverse((object) => { if (object instanceof Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose(); }); }, [model]);
  return <primitive object={model.root} dispose={null} />;
}
export function VehicleModel({ source = developmentVehicleModel, ...props }: Props) {
  return source.kind === "glb" ? <GlbVehicleModel {...props} url={source.url} /> : <DevelopmentVehicleModel {...props} />;
}
