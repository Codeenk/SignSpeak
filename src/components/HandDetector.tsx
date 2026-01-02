import { useEffect, useRef, useState, useCallback } from "react";
import type { Results } from "@mediapipe/hands";
import { recognizeASLLetter, DetectionStabilizer } from "@/lib/aslRecognition";

// Declare global type for CDN loaded MediaPipe
declare global {
  interface Window {
    Hands: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

interface HandDetectorProps {
  onDetection: (letter: string | null, confidence: number) => void;
  isActive: boolean;
}

const HandDetector = ({ onDetection, isActive }: HandDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  // ...
  // Finding the part to replace is tricky with contiguous block.
  // I'll replace the top block imports and then the initialization block logic where `new Hands` is called.
  // Actually, I can do it in two chunks.
  // WAIT, I must use `multi_replace_file_content` if I want to edit two places.
  // Or just replace the imports now and `new Hands` later?
  // No, the tool replace_file_content is for SINGLE BLOCK. `multi_replace_file_content` is valid.

  // I will use multi_replace for imports + new Hands usage.
  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(4, 3));
  const lastFrameTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const onResults = useCallback((results: Results) => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    // FPS calculation
    const now = performance.now();
    if (lastFrameTimeRef.current) {
      const delta = now - lastFrameTimeRef.current;
      setFps(Math.round(1000 / delta));
    }
    lastFrameTimeRef.current = now;

    const ctx = canvasElement.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Canvas sizing is handled in the setupCamera function now to ensure sync

    ctx.save();

    // Mirror and draw video
    ctx.translate(canvasElement.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Mirror landmarks for drawing
        const mirroredLandmarks = landmarks.map(l => ({
          ...l,
          x: 1 - l.x
        }));

        // Draw connections with optimized style
        if (window.drawConnectors && window.HAND_CONNECTIONS) {
          window.drawConnectors(ctx, mirroredLandmarks, window.HAND_CONNECTIONS, {
            color: "hsl(38, 92%, 50%)",
            lineWidth: 2,
          });
        }

        // Draw landmarks
        if (window.drawLandmarks) {
          window.drawLandmarks(ctx, mirroredLandmarks, {
            color: "hsl(230, 70%, 60%)",
            fillColor: "hsl(38, 92%, 50%)",
            lineWidth: 1,
            radius: 3,
          });
        }

        // Recognize letter with stabilization
        const { letter, confidence } = recognizeASLLetter(landmarks);
        const stableLetter = stabilizerRef.current.addDetection(letter);

        if (stableLetter && confidence > 0.65) {
          onDetection(stableLetter, confidence);

          // Draw detected letter on canvas
          ctx.save();
          ctx.font = "bold 48px Inter";
          ctx.fillStyle = "hsl(38, 92%, 50%)";
          ctx.strokeStyle = "hsl(230, 20%, 10%)";
          ctx.lineWidth = 3;
          const text = stableLetter;
          ctx.strokeText(text, 20, 60);
          ctx.fillText(text, 20, 60);
          ctx.restore();
        } else {
          onDetection(null, 0);
        }
      }
    } else {
      stabilizerRef.current.reset();
      onDetection(null, 0);
    }
  }, [onDetection]);

  const detect = useCallback(async () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === 4 &&
      handsRef.current
    ) {
      await handsRef.current.send({ image: videoRef.current });
    }
    if (isActive) {
      requestRef.current = requestAnimationFrame(detect);
    }
  }, [isActive]);

  useEffect(() => {
    // If not active, cleanup and return
    if (!isActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      stabilizerRef.current.reset();
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Mediapipe Hands
        // Initialize Mediapipe Hands from global CDN
        if (typeof window.Hands === 'undefined') {
          throw new Error("MediaPipe Hands not loaded yet");
        }

        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        // Initialize Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load to set canvas size
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && canvasRef.current) {
              videoRef.current.play();
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              setIsLoading(false);
              detect();
            }
          };
        }

      } catch (err: any) {
        console.error("Error initializing:", err);
        setIsLoading(false);
        if (err.name === 'NotAllowedError') {
          setError("Permission to access camera was denied. Please allow camera access.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera found. Please connect a camera.");
        } else {
          setError("Failed to initialize camera. Please try again.");
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    }
  }, [isActive, onResults, detect]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass-card">
      {/* FPS Counter */}
      {!isLoading && !error && (
        <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded-md bg-black/60 text-xs font-mono text-success">
          {fps} FPS
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10 w-full h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10 w-full h-full">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default HandDetector;
