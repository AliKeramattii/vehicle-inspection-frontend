const inspectionPath = (id: string) => `/inspection/${encodeURIComponent(id)}`;
export const inspectionRoutes = {
  location: (id: string) => `${inspectionPath(id)}/location`,
  vehicle: (id: string) => `${inspectionPath(id)}/vehicle`,
  capture: (id: string) => `${inspectionPath(id)}/capture`,
  section: (id: string, section: string) => `${inspectionPath(id)}/capture/section/${encodeURIComponent(section)}`,
  photo: (id: string, photo: string, stage: "guide" | "camera" | "review") => `${inspectionPath(id)}/capture/photo/${encodeURIComponent(photo)}/${stage}`,
  photographyReview: (id: string) => `${inspectionPath(id)}/capture/review`,
  video: (id: string, stage: "record" | "review") => `${inspectionPath(id)}/capture/video/${stage}`,
  upload: (id: string) => `${inspectionPath(id)}/upload`,
};
