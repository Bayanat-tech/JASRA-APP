declare module "react-webcam" {
  import * as React from "react";

  export interface WebcamProps
    extends React.VideoHTMLAttributes<HTMLVideoElement> {
    audio?: boolean;
    screenshotFormat?: string;
    screenshotQuality?: number;
    videoConstraints?: MediaTrackConstraints;
    onUserMedia?: () => void;
    onUserMediaError?: (error: string | DOMException) => void;
    mirrored?: boolean;
  }

  export default class Webcam extends React.Component<WebcamProps> {
    getScreenshot(): string | null;
  }
}
