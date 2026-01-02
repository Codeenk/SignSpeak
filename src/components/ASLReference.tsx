import { useState } from "react";
import { cn } from "@/lib/utils";
import { aslAlphabet, ASLSign } from "@/lib/aslRecognition";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

interface ASLReferenceProps {
  highlightedLetter: string | null;
}

const ASLReference = ({ highlightedLetter }: ASLReferenceProps) => {
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<Set<string>>(new Set());

  const handleImageError = (letter: string) => {
    setImageLoadError(prev => new Set(prev).add(letter));
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold gradient-text">
            ASL Alphabet Guide (A-Z)
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Click any letter to see detailed instructions and hand position
          </p>

          {/* Letter Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {aslAlphabet.map((sign) => (
              <button
                key={sign.letter}
                onClick={() => setExpandedLetter(expandedLetter === sign.letter ? null : sign.letter)}
                className={cn(
                  "relative p-4 rounded-2xl transition-all duration-200 border-2 flex flex-col items-center gap-3",
                  "hover:scale-[1.02] active:scale-95 group shadow-sm hover:shadow-md",
                  highlightedLetter === sign.letter
                    ? "border-accent bg-accent/10 glow-accent"
                    : expandedLetter === sign.letter
                      ? "border-primary bg-primary/5"
                      : "border-border/40 bg-card hover:border-primary/50 hover:bg-secondary/30"
                )}
              >
                {/* Large Image */}
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/50 border border-border/20 p-2">
                  {!imageLoadError.has(sign.letter) ? (
                    <img
                      src={sign.imageUrl}
                      alt={`ASL ${sign.letter}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={() => handleImageError(sign.letter)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                      ✋
                    </div>
                  )}
                </div>

                <div className={cn(
                  "font-display font-bold text-2xl",
                  highlightedLetter === sign.letter ? "gradient-accent-text" : "text-foreground group-hover:text-primary transition-colors"
                )}>
                  {sign.letter}
                </div>

                {highlightedLetter === sign.letter && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full animate-pulse shadow-glow-accent" />
                )}
              </button>
            ))}
          </div>

          {/* Expanded Detail View */}
          {expandedLetter && (
            <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 animate-scale-in">
              {(() => {
                const sign = aslAlphabet.find(s => s.letter === expandedLetter);
                if (!sign) return null;

                return (
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Large Image */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-background/80 border-2 border-primary/30">
                        {!imageLoadError.has(sign.letter) ? (
                          <img
                            src={sign.imageUrl}
                            alt={`ASL ${sign.letter} hand sign`}
                            className="w-full h-full object-contain"
                            onError={() => handleImageError(sign.letter)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            ✋
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-display font-bold text-2xl gradient-text">
                          Letter {sign.letter}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {sign.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm font-medium text-primary mb-1">How to sign:</p>
                        <p className="text-sm text-foreground">
                          {sign.instruction}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded bg-secondary">
                          Practice in front of camera
                        </span>
                        <span className="px-2 py-1 rounded bg-secondary">
                          Hold steady for detection
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ASLReference;
