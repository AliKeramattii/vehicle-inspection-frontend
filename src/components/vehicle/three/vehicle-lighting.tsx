export function VehicleLighting() {
  return <><hemisphereLight args={["#ffffff", "#b8c4d0", 2.1]} />
    <directionalLight position={[4, 7, 5]} intensity={3} /><directionalLight position={[-5, 4, -2]} intensity={1.4} />
  </>;
}
