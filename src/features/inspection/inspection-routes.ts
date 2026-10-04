const inspectionPath = (id: string) => `/inspection/${encodeURIComponent(id)}`;
export const inspectionRoutes = {
  location: (id: string) => `${inspectionPath(id)}/location`,
  vehicle: (id: string) => `${inspectionPath(id)}/vehicle`,
};
