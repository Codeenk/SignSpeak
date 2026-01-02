import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Volume2, Copy, Space, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WordBuilderProps {
  detectedLetter: string | null;
  isActive: boolean;
}

const WordBuilder = ({ detectedLetter, isActive }: WordBuilderProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [lastAddedLetter, setLastAddedLetter] = useState<string | null>(null);
  const [letterCooldown, setLetterCooldown] = useState(false);

  // Auto-add detected letters with cooldown to prevent duplicates
  useEffect(() => {
    if (!isActive || !detectedLetter || letterCooldown) return;
    
    // Only add if it's different from the last added letter or cooldown passed
    if (detectedLetter !== lastAddedLetter || !letterCooldown) {
      // Don't add numbers to words
      if (detectedLetter.match(/[A-Z]/)) {
        setCurrentWord(prev => prev + detectedLetter);
        setLastAddedLetter(detectedLetter);
        setLetterCooldown(true);
        
        // Reset cooldown after 800ms
        setTimeout(() => setLetterCooldown(false), 800);
      }
    }
  }, [detectedLetter, isActive, lastAddedLetter, letterCooldown]);

  // Reset last added when detection changes
  useEffect(() => {
    if (!detectedLetter) {
      setTimeout(() => setLastAddedLetter(null), 500);
    }
  }, [detectedLetter]);

  const addSpace = useCallback(() => {
    if (currentWord.trim()) {
      setCompletedWords(prev => [...prev, currentWord.trim()]);
      setCurrentWord("");
    }
  }, [currentWord]);

  const undoLetter = useCallback(() => {
    setCurrentWord(prev => prev.slice(0, -1));
  }, []);

  const clearAll = useCallback(() => {
    setCurrentWord("");
    setCompletedWords([]);
    setLastAddedLetter(null);
  }, []);

  const speakText = useCallback(() => {
    const fullText = [...completedWords, currentWord].join(" ").trim();
    if (fullText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      toast.success("Speaking text...");
    }
  }, [completedWords, currentWord]);

  const copyText = useCallback(() => {
    const fullText = [...completedWords, currentWord].join(" ").trim();
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      toast.success("Copied to clipboard!");
    }
  }, [completedWords, currentWord]);

  const fullSentence = [...completedWords, currentWord].join(" ");

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold gradient-text">Word Builder</h3>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            letterCooldown ? "bg-accent animate-pulse" : "bg-success"
          )} />
          <span className="text-xs text-muted-foreground">
            {letterCooldown ? "Processing..." : "Ready"}
          </span>
        </div>
      </div>

      {/* Current Word Display */}
      <div className="min-h-[80px] p-4 rounded-xl bg-secondary/70 border-2 border-dashed border-border/50">
        {fullSentence ? (
          <div className="flex flex-wrap gap-1">
            {completedWords.map((word, i) => (
              <span key={i} className="px-2 py-1 bg-primary/20 rounded text-primary font-medium">
                {word}
              </span>
            ))}
            {currentWord && (
              <span className="px-2 py-1 bg-accent/20 rounded text-accent font-bold animate-pulse">
                {currentWord}
                <span className="animate-blink">|</span>
              </span>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center">
            Start signing letters to build words...
          </p>
        )}
      </div>

      {/* Letter Preview */}
      {detectedLetter && (
        <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
          <span className="text-xs text-muted-foreground">Next letter:</span>
          <span className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-xl",
            letterCooldown ? "bg-accent/50 text-accent-foreground" : "bg-primary text-primary-foreground"
          )}>
            {detectedLetter}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addSpace}
          disabled={!currentWord}
          className="gap-1"
        >
          <Space className="w-4 h-4" />
          Space
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={undoLetter}
          disabled={!currentWord}
          className="gap-1"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={speakText}
          disabled={!fullSentence}
          className="gap-1"
        >
          <Volume2 className="w-4 h-4" />
          Speak
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyText}
          disabled={!fullSentence}
          className="gap-1"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={!fullSentence}
          className="gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span>Words: {completedWords.length + (currentWord ? 1 : 0)}</span>
        <span>Characters: {fullSentence.replace(/\s/g, '').length}</span>
      </div>
    </div>
  );
};

export default WordBuilder;
