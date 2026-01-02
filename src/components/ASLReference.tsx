import { useState } from "react";
import { cn } from "@/lib/utils";

interface ASLSign {
  letter: string;
  description: string;
  fingers: string;
}

const aslSigns: ASLSign[] = [
  { letter: "A", description: "Fist with thumb beside", fingers: "👊" },
  { letter: "B", description: "Flat hand, fingers up", fingers: "🖐" },
  { letter: "C", description: "Curved hand shape", fingers: "🤏" },
  { letter: "D", description: "Index up, others curved", fingers: "☝️" },
  { letter: "E", description: "All fingers curled in", fingers: "✊" },
  { letter: "F", description: "OK sign position", fingers: "👌" },
  { letter: "I", description: "Pinky finger up only", fingers: "🤙" },
  { letter: "L", description: "L shape with thumb/index", fingers: "🤟" },
  { letter: "O", description: "Fingers meet thumb", fingers: "👌" },
  { letter: "V", description: "Peace sign", fingers: "✌️" },
  { letter: "W", description: "Three fingers up", fingers: "🤟" },
  { letter: "Y", description: "Thumb and pinky out", fingers: "🤙" },
  { letter: "5", description: "Open palm, all fingers", fingers: "🖐" },
];

interface ASLReferenceProps {
  highlightedLetter: string | null;
}

const ASLReference = ({ highlightedLetter }: ASLReferenceProps) => {
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);

  return (
    <div className="glass-card p-6">
      <h2 className="font-display text-xl font-bold mb-4 gradient-text">
        ASL Reference Guide
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Try these signs in front of the camera
      </p>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {aslSigns.map((sign) => (
          <button
            key={sign.letter}
            onClick={() => setExpandedLetter(expandedLetter === sign.letter ? null : sign.letter)}
            className={cn(
              "relative p-3 rounded-xl transition-all duration-300 border-2",
              "hover:scale-105 active:scale-95",
              highlightedLetter === sign.letter
                ? "border-accent bg-accent/20 glow-accent"
                : "border-border/50 bg-secondary/50 hover:border-primary/50",
              expandedLetter === sign.letter && "ring-2 ring-primary"
            )}
          >
            <div className="text-2xl mb-1">{sign.fingers}</div>
            <div className={cn(
              "font-display font-bold text-lg",
              highlightedLetter === sign.letter ? "gradient-accent-text" : "text-foreground"
            )}>
              {sign.letter}
            </div>
            
            {highlightedLetter === sign.letter && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {expandedLetter && (
        <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="text-4xl">
              {aslSigns.find(s => s.letter === expandedLetter)?.fingers}
            </span>
            <div>
              <h3 className="font-display font-bold text-lg">{expandedLetter}</h3>
              <p className="text-sm text-muted-foreground">
                {aslSigns.find(s => s.letter === expandedLetter)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ASLReference;