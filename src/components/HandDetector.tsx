import { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results, NormalizedLandmarkList } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

interface HandDetectorProps {
  onDetection: (letter: string | null, confidence: number) => void;
  isActive: boolean;
}

// ASL letter recognition based on hand landmarks
const recognizeASLLetter = (landmarks: NormalizedLandmarkList): { letter: string; confidence: number } => {
  if (!landmarks || landmarks.length < 21) {
    return { letter: "", confidence: 0 };
  }

  // Get key landmark positions
  const thumb_tip = landmarks[4];
  const index_tip = landmarks[8];
  const middle_tip = landmarks[12];
  const ring_tip = landmarks[16];
  const pinky_tip = landmarks[20];

  const thumb_ip = landmarks[3];
  const index_pip = landmarks[6];
  const middle_pip = landmarks[10];
  const ring_pip = landmarks[14];
  const pinky_pip = landmarks[18];

  const wrist = landmarks[0];

  // Helper functions
  const isFingerExtended = (tip: typeof thumb_tip, pip: typeof thumb_ip, base: typeof wrist): boolean => {
    return tip.y < pip.y;
  };

  const isThumbExtended = (): boolean => {
    return thumb_tip.x < thumb_ip.x || thumb_tip.y < wrist.y - 0.1;
  };

  const fingersExtended = {
    thumb: isThumbExtended(),
    index: isFingerExtended(index_tip, index_pip, wrist),
    middle: isFingerExtended(middle_tip, middle_pip, wrist),
    ring: isFingerExtended(ring_tip, ring_pip, wrist),
    pinky: isFingerExtended(pinky_tip, pinky_pip, wrist),
  };

  const extendedCount = Object.values(fingersExtended).filter(Boolean).length;

  // Simple ASL recognition patterns
  // A - Fist with thumb to the side
  if (!fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && !fingersExtended.pinky && fingersExtended.thumb) {
    return { letter: "A", confidence: 0.85 };
  }

  // B - All fingers extended, thumb across palm
  if (fingersExtended.index && fingersExtended.middle && fingersExtended.ring && fingersExtended.pinky && !fingersExtended.thumb) {
    return { letter: "B", confidence: 0.85 };
  }

  // C - Curved hand (approximation)
  if (extendedCount >= 3 && Math.abs(thumb_tip.x - pinky_tip.x) < 0.15) {
    return { letter: "C", confidence: 0.75 };
  }

  // D - Index up, others touching thumb
  if (fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && !fingersExtended.pinky) {
    return { letter: "D", confidence: 0.8 };
  }

  // E - All fingers curled
  if (!fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && !fingersExtended.pinky && !fingersExtended.thumb) {
    return { letter: "E", confidence: 0.8 };
  }

  // F - Index and thumb touching, others extended
  if (!fingersExtended.index && fingersExtended.middle && fingersExtended.ring && fingersExtended.pinky) {
    return { letter: "F", confidence: 0.75 };
  }

  // I - Pinky up only
  if (!fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && fingersExtended.pinky) {
    return { letter: "I", confidence: 0.85 };
  }

  // L - L shape with thumb and index
  if (fingersExtended.thumb && fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && !fingersExtended.pinky) {
    if (Math.abs(thumb_tip.x - wrist.x) > 0.1) {
      return { letter: "L", confidence: 0.85 };
    }
  }

  // O - All fingers curved to meet thumb
  if (extendedCount === 0 || (extendedCount === 1 && fingersExtended.thumb)) {
    const distance = Math.sqrt(
      Math.pow(thumb_tip.x - index_tip.x, 2) + Math.pow(thumb_tip.y - index_tip.y, 2)
    );
    if (distance < 0.08) {
      return { letter: "O", confidence: 0.75 };
    }
  }

  // V - Peace sign (index and middle up)
  if (fingersExtended.index && fingersExtended.middle && !fingersExtended.ring && !fingersExtended.pinky) {
    return { letter: "V", confidence: 0.85 };
  }

  // W - Three fingers up
  if (fingersExtended.index && fingersExtended.middle && fingersExtended.ring && !fingersExtended.pinky) {
    return { letter: "W", confidence: 0.85 };
  }

  // Y - Thumb and pinky out
  if (fingersExtended.thumb && !fingersExtended.index && !fingersExtended.middle && !fingersExtended.ring && fingersExtended.pinky) {
    return { letter: "Y", confidence: 0.85 };
  }

  // 5 / Open palm - All fingers extended
  if (extendedCount === 5) {
    return { letter: "5", confidence: 0.9 };
  }

  return { letter: "", confidence: 0 };
};

const HandDetector = ({ onDetection, isActive }: HandDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onResults = useCallback((results: Results) => {
    const canvasElement = canvasRef.current;
    const videoElement = videoRef.current;
    
    if (!canvasElement || !videoElement) return;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Mirror the video
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

        // Draw connections with custom style
        drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, {
          color: "hsl(38, 92%, 50%)",
          lineWidth: 3,
        });
        
        // Draw landmarks
        drawLandmarks(ctx, mirroredLandmarks, {
          color: "hsl(230, 70%, 60%)",
          fillColor: "hsl(38, 92%, 50%)",
          lineWidth: 1,
          radius: 4,
        });

        // Recognize letter
        const { letter, confidence } = recognizeASLLetter(landmarks);
        if (letter && confidence > 0.7) {
          onDetection(letter, confidence);
        } else {
          onDetection(null, 0);
        }
      }
    } else {
      onDetection(null, 0);
    }
  }, [onDetection]);

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
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

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
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