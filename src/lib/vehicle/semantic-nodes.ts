// Model space: +Y up, +Z front, +X physical vehicle left. RTL never changes this.
export const vehicleNodes = {
  body: "Body_Main", hood: "Hood", roof: "Roof",
  doorFrontLeft: "Door_FL", doorFrontRight: "Door_FR", doorRearLeft: "Door_RL", doorRearRight: "Door_RR",
  fenderFrontLeft: "Fender_FL", fenderFrontRight: "Fender_FR", quarterRearLeft: "Quarter_RL", quarterRearRight: "Quarter_RR",
  bumperFront: "Bumper_Front", bumperRear: "Bumper_Rear", mirrorLeft: "Mirror_L", mirrorRight: "Mirror_R",
  glassFront: "Glass_Front", glassRear: "Glass_Rear", glassLeft: "Glass_Side_L", glassRight: "Glass_Side_R",
  headlightLeft: "Headlight_L", headlightRight: "Headlight_R", taillightLeft: "Taillight_L", taillightRight: "Taillight_R",
  plateFront: "Plate_Front", plateRear: "Plate_Rear", wheelFrontLeft: "Wheel_FL", wheelFrontRight: "Wheel_FR",
  wheelRearLeft: "Wheel_RL", wheelRearRight: "Wheel_RR", seats: "Interior_Seats", dashboard: "Interior_Dashboard",
  cluster: "Interior_Cluster", steering: "Interior_Steering", engine: "EngineBay", vin: "VIN_Zone", specPlate: "SpecPlate_Zone",
} as const;
export type VehicleNode = typeof vehicleNodes[keyof typeof vehicleNodes];
export const semanticVehicleNodes = Object.values(vehicleNodes);
export function resolveSemanticNodes(values: readonly string[]): VehicleNode[] {
  return semanticVehicleNodes.filter((node) => values.includes(node));
}
export type Vector3Tuple = [number, number, number];

// Shared semantic anchor contract; adapters may replace measured positions for a final GLB.
export const nodeAnchors: Record<VehicleNode, Vector3Tuple> = {
  [vehicleNodes.body]: [1, 1, 0], [vehicleNodes.hood]: [0, 1.12, 1.4], [vehicleNodes.roof]: [0, 1.95, -.2],
  [vehicleNodes.doorFrontLeft]: [1, 1.22, .35], [vehicleNodes.doorFrontRight]: [-1, 1.22, .35],
  [vehicleNodes.doorRearLeft]: [1, 1.25, -.7], [vehicleNodes.doorRearRight]: [-1, 1.25, -.7],
  [vehicleNodes.fenderFrontLeft]: [1, .97, 1.45], [vehicleNodes.fenderFrontRight]: [-1, .97, 1.45],
  [vehicleNodes.quarterRearLeft]: [1, 1.15, -1.45], [vehicleNodes.quarterRearRight]: [-1, 1.15, -1.45],
  [vehicleNodes.bumperFront]: [0, .65, 2.2], [vehicleNodes.bumperRear]: [0, .65, -2.2],
  [vehicleNodes.mirrorLeft]: [1.15, 1.43, .7], [vehicleNodes.mirrorRight]: [-1.15, 1.43, .7],
  [vehicleNodes.glassFront]: [0, 1.55, .74], [vehicleNodes.glassRear]: [0, 1.55, -1.5],
  [vehicleNodes.glassLeft]: [1, 1.58, -.25], [vehicleNodes.glassRight]: [-1, 1.58, -.25],
  [vehicleNodes.headlightLeft]: [.77, 1, 2.08], [vehicleNodes.headlightRight]: [-.77, 1, 2.08],
  [vehicleNodes.taillightLeft]: [.77, 1.12, -2.08], [vehicleNodes.taillightRight]: [-.77, 1.12, -2.08],
  [vehicleNodes.plateFront]: [0, .72, 2.22], [vehicleNodes.plateRear]: [0, .72, -2.22],
  [vehicleNodes.wheelFrontLeft]: [1, .48, 1.4], [vehicleNodes.wheelFrontRight]: [-1, .48, 1.4],
  [vehicleNodes.wheelRearLeft]: [1, .48, -1.4], [vehicleNodes.wheelRearRight]: [-1, .48, -1.4],
  [vehicleNodes.seats]: [0, 1.35, -.4], [vehicleNodes.dashboard]: [0, 1.5, .4],
  [vehicleNodes.cluster]: [.5, 1.55, .45], [vehicleNodes.steering]: [.5, 1.35, .35],
  [vehicleNodes.engine]: [0, 1.13, 1.5], [vehicleNodes.vin]: [.62, 1.46, .88], [vehicleNodes.specPlate]: [.92, 1.1, .25],
};
