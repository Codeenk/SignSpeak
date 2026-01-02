import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DetectionDisplayProps {
  detectedLetter: string | null;
  confidence: number;
}

const DetectionDisplay = ({ detectedLetter, confidence }: DetectionDisplayProps) => {
  const [history, setHistory] = useState<string[]>([]);
  const [stableDetection, setStableDetection] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);

  useEffect(() => {
    if (detectedLetter) {
      if (detectedLetter === stableDetection) {
        setDetectionCount(prev => prev + 1);
      } else {
        setStableDetection(detectedLetter);
        setDetectionCount(1);
      }

      // Only add to history after stable detection (5 frames)
      if (detectionCount >= 5 && detectedLetter !== history[history.length - 1]) {
        setHistory(prev => [...prev.slice(-9), detectedLetter]);
      }
    } else {
      setDetectionCount(0);
    }
  }, [detectedLetter, stableDetection, detectionCount, history]);

  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Current Detection */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Detected Sign</p>
        <div className={cn(
          "w-32 h-32 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300",
          detectedLetter 
            ? "bg-gradient-to-br from-primary to-primary/50 glow-primary" 
            : "bg-secondary/50 border-2 border-dashed border-border"
        )}>
          {detectedLetter ? (
            <span className="font-display text-6xl font-bold text-primary-foreground animate-scale-in">
              {detectedLetter}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">Show a sign</span>
          )}
        </div>

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
                  "h-full rounded-full transition-all duration-300",
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
        <p className="text-sm text-muted-foreground mb-3">History</p>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {history.length > 0 ? (
            history.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold",
                  "bg-secondary text-foreground",
                  index === history.length - 1 && "bg-primary text-primary-foreground"
                )}
              >
                {letter}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">
              Detected letters will appear here...
            </span>
          )}
        </div>
        
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-2">Tips for best results:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Good lighting helps detection</li>
          <li>• Keep your hand steady</li>
          <li>• Position hand in center of frame</li>
          <li>• Show clear finger positions</li>
        </ul>
      </div>
    </div>
  );
};

export default DetectionDisplay;