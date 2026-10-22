export type VideoRecordingProfile={id:string;width:number;height:number;frameRate:number;videoBitsPerSecond:number};
/** Retains the existing 1080p/2.5 Mbps request; alternatives are lab profiles, not automatic quality downgrades. */
export const defaultVideoProfile:VideoRecordingProfile={id:"existing-1080p",width:1920,height:1080,frameRate:30,videoBitsPerSecond:2_500_000};
export const videoExperimentProfiles:VideoRecordingProfile[]=[720,1080].flatMap(height=>[2_500_000,4_000_000,6_000_000].map(videoBitsPerSecond=>({id:`lab-${height}-${videoBitsPerSecond}`,width:height===720?1280:1920,height,frameRate:30,videoBitsPerSecond})));
export type VideoCaptureMetadata={profileId:string;requested:Omit<VideoRecordingProfile,"id">;actual:{width?:number;height?:number;frameRate?:number;videoBitsPerSecond?:number;mimeType:string}};
export function videoCaptureConstraints(profile:VideoRecordingProfile,supported:MediaTrackSupportedConstraints):MediaTrackConstraints{
 return {...(supported.width?{width:{ideal:profile.width}}:{}),...(supported.height?{height:{ideal:profile.height}}:{}),...(supported.frameRate?{frameRate:{ideal:profile.frameRate}}:{})};
}
