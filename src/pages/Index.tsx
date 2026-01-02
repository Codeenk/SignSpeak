import { useState, useCallback } from "react";
import { Camera, CameraOff, Info } from "lucide-react";
import Header from "@/components/Header";
import HandDetector from "@/components/HandDetector";
import ASLReference from "@/components/ASLReference";
import DetectionDisplay from "@/components/DetectionDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  const handleDetection = useCallback((letter: string | null, conf: number) => {
    setDetectedLetter(letter);
    setConfidence(conf);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Hero Section */}
        {!isActive && (
          <div className="text-center py-12 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="gradient-text">Sign Language</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Use your camera to detect ASL hand signs in real-time. 
              Our AI-powered system recognizes gestures and helps you learn American Sign Language.
            </p>
            
            <Button
              onClick={() => setIsActive(true)}
              size="lg"
              className="gap-2 px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary transition-all duration-300 hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              Start Detection
            </Button>

            <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "Real-time Detection",
                  description: "Instant recognition of ASL hand signs using advanced computer vision",
                  icon: "⚡",
                },
                {
                  title: "Hand Tracking",
                  description: "Precise 21-point hand landmark detection for accurate sign recognition",
                  icon: "✋",
                },
                {
                  title: "Learn & Practice",
                  description: "Reference guide included to help you learn and practice ASL signs",
                  icon: "📚",
                },
              ].map((feature, i) => (
                <div key={i} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Detection View */}
        {isActive && (
          <div className="animate-fade-in">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  detectedLetter ? "bg-accent animate-pulse" : "bg-success animate-pulse"
                )} />
                <span className="text-sm text-muted-foreground">
                  {detectedLetter ? "Sign detected" : "Waiting for hand..."}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsActive(false)}
                className="gap-2"
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </Button>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Camera View */}
              <div className="lg:col-span-2 space-y-4">
                <div className={cn(
                  "transition-all duration-300",
                  detectedLetter && "detection-active rounded-2xl"
                )}>
                  <HandDetector
                    onDetection={handleDetection}
                    isActive={isActive}
                  />
                </div>
                
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">How to use</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Position your hand in front of the camera and make ASL signs. 
                      The system will detect and display the corresponding letter.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <DetectionDisplay
                  detectedLetter={detectedLetter}
                  confidence={confidence}
                />
              </div>
            </div>

            {/* Reference Section */}
            <div className="mt-8">
              <ASLReference highlightedLetter={detectedLetter} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>Built with MediaPipe Hands for accurate hand landmark detection</p>
      </footer>
    </div>
  );
};

export default Index;