import { useMemo } from "react";
import { DoubleSide, Shape } from "three";
import { RoundedBox } from "@react-three/drei";
import { vehicleNodes as nodes, type VehicleNode, type Vector3Tuple } from "@/lib/vehicle/semantic-nodes";
import { RegionHighlight } from "./region-highlight";

type Props = { bodyColor: string; highlightNodes: readonly VehicleNode[] };
function Panel({ node, position, size, color, highlightNodes, rotation = [0, 0, 0] }: {
  node: VehicleNode; position: Vector3Tuple; size: Vector3Tuple; color: string; highlightNodes: Props["highlightNodes"]; rotation?: Vector3Tuple;
}) {
  return <group name={node} position={position} rotation={rotation}>
    <RoundedBox args={size} radius={.035} smoothness={2}><meshStandardMaterial color={color} metalness={.28} roughness={.36} /></RoundedBox>
    {highlightNodes.includes(node) && <mesh scale={[1.01, 1.01, 1.01]}><boxGeometry args={size} /><RegionHighlight node={node} highlighted={highlightNodes} /></mesh>}
  </group>;
}
export function DevelopmentVehicleModel({ bodyColor, highlightNodes }: Props) {
  const cabin = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-2.04, 1.15); shape.lineTo(-1.67, 1.82); shape.quadraticCurveTo(-1.2, 1.96, .3, 1.9);
    shape.lineTo(1.02, 1.2); shape.closePath();
    return shape;
  }, []);
  const sideGlass = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.83, 1.25); shape.lineTo(-1.54, 1.75); shape.lineTo(.23, 1.77); shape.lineTo(.86, 1.25); shape.closePath();
    return shape;
  }, []);
  const glass = "#26323e", trim = "#202a35";
  return <group>
    <Panel node={nodes.body} position={[0, .86, 0]} size={[1.92, .66, 4.3]} color={bodyColor} highlightNodes={highlightNodes} />
    <Panel node={nodes.hood} position={[0, 1.13, 1.49]} size={[1.82, .11, 1.25]} color={bodyColor} highlightNodes={highlightNodes} rotation={[-.025, 0, 0]} />
    <mesh name={nodes.roof} position={[.845, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><extrudeGeometry args={[cabin, { depth: 1.69, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .04, bevelThickness: .03 }]} /><meshStandardMaterial color={bodyColor} metalness={.3} roughness={.34} /></mesh>
    <Panel node={nodes.glassFront} position={[0, 1.51, .83]} size={[1.5, .65, .035]} color={glass} highlightNodes={highlightNodes} rotation={[-.77, 0, 0]} />
    <Panel node={nodes.glassRear} position={[0, 1.49, -1.92]} size={[1.5, .57, .035]} color={glass} highlightNodes={highlightNodes} rotation={[.52, 0, 0]} />
    <Panel node={nodes.bumperFront} position={[0, .58, 2.16]} size={[1.91, .31, .14]} color={trim} highlightNodes={highlightNodes} />
    <Panel node={nodes.bumperRear} position={[0, .58, -2.16]} size={[1.91, .31, .14]} color={trim} highlightNodes={highlightNodes} />
    <Panel node={nodes.plateFront} position={[0, .71, 2.24]} size={[.6, .14, .03]} color="#f4f5f7" highlightNodes={highlightNodes} />
    <Panel node={nodes.plateRear} position={[0, .71, -2.24]} size={[.6, .14, .03]} color="#f4f5f7" highlightNodes={highlightNodes} />
    <RoundedBox args={[1.3, .36, .08]} radius={.05} position={[0, .97, 2.16]}><meshStandardMaterial color="#14202c" roughness={.4} /></RoundedBox>
    {Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[-.53 + index * .13, .97, 2.21]}><boxGeometry args={[.015, .3, .02]} /><meshStandardMaterial color="#7e8c99" metalness={.7} roughness={.35} /></mesh>)}
    {([1, -1] as const).map((side) => {
      const isLeft = side === 1;
      return <group key={side}>
        <mesh name={isLeft ? nodes.glassLeft : nodes.glassRight} position={[side * .9, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><shapeGeometry args={[sideGlass]} /><meshStandardMaterial color={glass} side={DoubleSide} roughness={.2} metalness={.22} /></mesh>
        <Panel node={isLeft ? nodes.doorFrontLeft : nodes.doorFrontRight} position={[side * .966, 1, .35]} size={[.018, .56, 1.05]} color={bodyColor} highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.doorRearLeft : nodes.doorRearRight} position={[side * .966, 1, -.74]} size={[.018, .56, 1.07]} color={bodyColor} highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.fenderFrontLeft : nodes.fenderFrontRight} position={[side * .977, .95, 1.48]} size={[.02, .27, .55]} color={bodyColor} highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.quarterRearLeft : nodes.quarterRearRight} position={[side * .977, 1.12, -1.63]} size={[.02, .32, .7]} color={bodyColor} highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.mirrorLeft : nodes.mirrorRight} position={[side * 1.06, 1.39, .65]} size={[.25, .12, .25]} color={bodyColor} highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.headlightLeft : nodes.headlightRight} position={[side * .76, 1.1, 2.17]} size={[.31, .12, .035]} color="#eef5ff" highlightNodes={highlightNodes} />
        <Panel node={isLeft ? nodes.taillightLeft : nodes.taillightRight} position={[side * .76, 1.13, -2.17]} size={[.32, .13, .035]} color="#ae3338" highlightNodes={highlightNodes} />
        {([1.4, -1.4] as const).map((z) => <group key={z} name={z > 0 ? isLeft ? nodes.wheelFrontLeft : nodes.wheelFrontRight : isLeft ? nodes.wheelRearLeft : nodes.wheelRearRight} position={[side * .96, .48, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh><cylinderGeometry args={[.47, .47, .27, 32]} /><meshStandardMaterial color="#20242a" roughness={.9} /></mesh>
          <mesh><cylinderGeometry args={[.33, .33, .285, 24]} /><meshStandardMaterial color="#596573" metalness={.65} roughness={.35} /></mesh>
          {Array.from({ length: 6 }, (_, index) => { const angle = index * Math.PI / 3; return <mesh key={index} position={[Math.cos(angle) * .17, -side * .15, Math.sin(angle) * .17]} rotation={[0, -angle, 0]}><boxGeometry args={[.32, .025, .05]} /><meshStandardMaterial color="#c5d0db" metalness={.7} roughness={.3} /></mesh>; })}
          <mesh><cylinderGeometry args={[.12, .12, .3, 16]} /><meshStandardMaterial color="#566474" metalness={.5} roughness={.3} /></mesh>
        </group>)}
        {[-.6, .5].map((z) => <RoundedBox key={z} args={[.025, .04, .19]} radius={.01} position={[side * .99, 1.15, z]}><meshStandardMaterial color="#a9b4be" metalness={.6} /></RoundedBox>)}
        <RoundedBox args={[.07, .065, 2.6]} radius={.02} position={[side * .65, 1.95, -.57]}><meshStandardMaterial color="#636d79" metalness={.6} /></RoundedBox>
      </group>;
    })}
  </group>;
}
