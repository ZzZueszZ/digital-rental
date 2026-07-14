"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LIVENESS_PHASE_MS,
  LIVENESS_PROMPTS,
  LIVENESS_TOTAL_MS,
  MAX_LIVENESS_SECONDS,
  MIN_LIVENESS_SECONDS,
} from "../ekyc-constants";
import { getSupportedVideoMimeType, getVideoExtension } from "../ekyc-utils";

async function getDuration(file: File, elapsedMs: number) {
  return new Promise<number>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const finish = (duration: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : elapsedMs / 1000);
    };
    video.onloadedmetadata = () => finish(video.duration);
    video.onerror = () => finish(elapsedMs / 1000);
    video.src = url;
  });
}

export function useLivenessRecorder(
  onComplete: (file: File) => Promise<void>,
  onError: (error: unknown) => void,
) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const shouldCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stop = useCallback((complete = true) => {
    shouldCompleteRef.current = complete;
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, [clearTimer]);

  const start = useCallback((stream: MediaStream) => {
    try {
      const mimeType = getSupportedVideoMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      recorderRef.current = recorder;
      chunksRef.current = [];
      shouldCompleteRef.current = false;
      startedAtRef.current = Date.now();
      setElapsedMs(0);

      recorder.ondataavailable = ({ data }) => {
        if (data.size) chunksRef.current.push(data);
      };
      recorder.onstop = async () => {
        setRecording(false);
        const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
        if (!shouldCompleteRef.current || chunksRef.current.length === 0) return;
        const type = mimeType || "video/webm";
        const file = new File(
          [new Blob(chunksRef.current, { type })],
          `liveness.${getVideoExtension(type)}`,
          { type },
        );
        try {
          const duration = await getDuration(file, elapsed);
          if (duration < MIN_LIVENESS_SECONDS || duration > MAX_LIVENESS_SECONDS) {
            throw new Error("Video xác thực phải dài từ 4,5 đến 7 giây.");
          }
          await onCompleteRef.current(file);
        } catch (error) {
          onErrorRef.current(error);
        }
      };
      recorder.start(250);
      setRecording(true);
      timeoutRef.current = window.setTimeout(() => stop(true), LIVENESS_TOTAL_MS);
    } catch (error) {
      clearTimer();
      setRecording(false);
      onErrorRef.current(error);
    }
  }, [clearTimer, stop]);

  useEffect(() => {
    if (!recording || !startedAtRef.current) return;
    const timer = window.setInterval(() => {
      setElapsedMs(
        Math.min(Date.now() - (startedAtRef.current ?? Date.now()), LIVENESS_TOTAL_MS),
      );
    }, 100);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => stop(false), [stop]);

  const stepIndex = Math.min(
    LIVENESS_PROMPTS.length - 1,
    Math.floor(elapsedMs / LIVENESS_PHASE_MS),
  );

  return {
    recording,
    elapsedMs,
    stepIndex,
    progress: Math.min(100, (elapsedMs / LIVENESS_TOTAL_MS) * 100),
    start,
    cancel: () => stop(false),
  };
}
