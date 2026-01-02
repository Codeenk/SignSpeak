import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { aslAlphabet } from "@/lib/aslRecognition";

interface DetectionDisplayProps {
  detectedLetter: string | null;
  confidence: number;
}

const DetectionDisplay = ({ detectedLetter, confidence }: DetectionDisplayProps) => {
  const [history, setHistory] = useState<string[]>([]);
  const [stableDetection, setStableDetection] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const lastHistoryLetterRef = useRef<string | null>(null);

  useEffect(() => {
    if (detectedLetter) {
      if (detectedLetter === stableDetection) {
        setDetectionCount(prev => prev + 1);
      } else {
        setStableDetection(detectedLetter);
        setDetectionCount(1);
      }

      // Only add to history after stable detection (3 frames) and different from last
      if (detectionCount >= 3 && detectedLetter !== lastHistoryLetterRef.current) {
        lastHistoryLetterRef.current = detectedLetter;
        setHistory(prev => [...prev.slice(-11), detectedLetter]);
      }
    } else {
      setDetectionCount(0);
    }
  }, [detectedLetter, stableDetection, detectionCount]);

  const confidencePercent = Math.round(confidence * 100);
  const currentSign = aslAlphabet.find(s => s.letter === detectedLetter);

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Current Detection */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Detected Sign</p>
        <div className={cn(
          "w-28 h-28 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200",
          detectedLetter 
            ? "bg-gradient-to-br from-primary to-primary/50 glow-primary" 
            : "bg-secondary/50 border-2 border-dashed border-border"
        )}>
          {detectedLetter ? (
            <span className="font-display text-5xl font-bold text-primary-foreground animate-scale-in">
              {detectedLetter}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">Show a sign</span>
          )}
        </div>

        {/* Sign Description */}
        {currentSign && (
          <p className="mt-2 text-xs text-muted-foreground animate-fade-in">
            {currentSign.description}
          </p>
        )}

        {/* Confidence Bar */}
        {detectedLetter && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className={cn(
                "font-medium",
                confidencePercent >= 80 ? "text-success" : "text-accent"
              )}>
                {confidencePercent}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-200",
                  confidencePercent >= 80 
                    ? "bg-gradient-to-r from-success to-success/70"
                    : "bg-gradient-to-r from-accent to-accent/70"
                )}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Detection History */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Recent Letters</p>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {history.length > 0 ? (
            history.map((letter, index) => (
              <span
                key={`${letter}-${index}-${Date.now()}`}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold transition-all",
                  "bg-secondary text-foreground",
                  index === history.length - 1 && "bg-primary text-primary-foreground scale-110"
                )}
              >
                {letter}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">
              Letters appear here...
            </span>
          )}
        </div>
        
        {history.length > 0 && (
          <button
            onClick={() => {
              setHistory([]);
              lastHistoryLetterRef.current = null;
            }}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Tips */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">Quick Tips:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Good lighting = better detection</li>
          <li>• Keep hand steady and centered</li>
          <li>• Clear finger positions help</li>
        </ul>
      </div>
    </div>
  );
};

export default DetectionDisplay;
