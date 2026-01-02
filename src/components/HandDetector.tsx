import { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { recognizeASLLetter, DetectionStabilizer } from "@/lib/aslRecognition";

interface HandDetectorProps {
  onDetection: (letter: string | null, confidence: number) => void;
  isActive: boolean;
}

const HandDetector = ({ onDetection, isActive }: HandDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const stabilizerRef = useRef<DetectionStabilizer>(new DetectionStabilizer(4, 3));
  const lastFrameTimeRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const onResults = useCallback((results: Results) => {
    const canvasElement = canvasRef.current;
    const videoElement = videoRef.current;
    
    if (!canvasElement || !videoElement) return;

    // FPS calculation
    const now = performance.now();
    if (lastFrameTimeRef.current) {
      const delta = now - lastFrameTimeRef.current;
      setFps(Math.round(1000 / delta));
    }
    lastFrameTimeRef.current = now;

    const ctx = canvasElement.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Set canvas size once or when video size changes
    if (canvasElement.width !== videoElement.videoWidth) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
    }

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
        drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, {
          color: "hsl(38, 92%, 50%)",
          lineWidth: 2,
        });
        
        // Draw landmarks
        drawLandmarks(ctx, mirroredLandmarks, {
          color: "hsl(230, 70%, 60%)",
          fillColor: "hsl(38, 92%, 50%)",
          lineWidth: 1,
          radius: 3,
        });

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

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      stabilizerRef.current.reset();
      return;
    }

    const initializeHands = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        // Optimized settings for speed
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Use lite model for speed
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          await camera.start();
          cameraRef.current = camera;
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing hand detection:", err);
        setError("Failed to initialize camera. Please ensure camera permissions are granted.");
        setIsLoading(false);
      }
    };

    initializeHands();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [isActive, onResults]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass-card">
      {/* FPS Counter */}
      {!isLoading && !error && (
        <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded-md bg-black/60 text-xs font-mono text-success">
          {fps} FPS
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading hand detection model...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default HandDetector;
