"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CaptureTarget, ImageTarget } from "../ekyc-types";
import { dataUrlToFile } from "../ekyc-utils";

export function useEkycCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [target, setTarget] = useState<CaptureTarget | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setTarget(null);
  }, []);

  const start = useCallback(
    async (nextTarget: CaptureTarget) => {
      stop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode:
            nextTarget === "front" || nextTarget === "back"
              ? { ideal: "environment" }
              : { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: nextTarget === "liveness",
      });
      streamRef.current = stream;
      setTarget(nextTarget);
    },
    [stop],
  );

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [target]);

  useEffect(() => stop, [stop]);

  const capture = useCallback((imageTarget: ImageTarget) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      throw new Error("Camera chưa sẵn sàng. Vui lòng thử lại.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không thể đọc hình ảnh từ camera.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return dataUrlToFile(
      canvas.toDataURL("image/jpeg", 0.92),
      `${imageTarget}.jpg`,
    );
  }, []);

  return {
    videoRef,
    streamRef,
    target,
    isOpen: target !== null,
    start,
    stop,
    capture,
  };
}
