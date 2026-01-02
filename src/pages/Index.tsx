import { useState, useCallback } from "react";
import { Camera, CameraOff, Info, Zap, Hand, Type } from "lucide-react";
import Header from "@/components/Header";
import HandDetector from "@/components/HandDetector";
import ASLReference from "@/components/ASLReference";
import DetectionDisplay from "@/components/DetectionDisplay";
import WordBuilder from "@/components/WordBuilder";
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
      
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Hero Section */}
        {!isActive && (
          <div className="text-center py-12 animate-fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="gradient-text">Sign Language</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Use your camera to detect all 26 ASL letters in real-time. 
              Build complete words and sentences with our AI-powered recognition system.
            </p>
            
            <Button
              onClick={() => setIsActive(true)}
              size="lg"
              className="gap-2 px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary transition-all duration-300 hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              Start Detection
            </Button>

            <div className="mt-12 grid md:grid-cols-4 gap-6 text-left">
              {[
                {
                  title: "Full A-Z Support",
                  description: "Detect all 26 letters of the American Sign Language alphabet",
                  icon: <Type className="w-6 h-6" />,
                },
                {
                  title: "Word Building",
                  description: "Assemble detected letters into words and sentences automatically",
                  icon: <Hand className="w-6 h-6" />,
                },
                {
                  title: "Optimized Speed",
                  description: "Fast processing with real-time FPS display and minimal latency",
                  icon: <Zap className="w-6 h-6" />,
                },
                {
                  title: "Visual Guide",
                  description: "Real hand sign images to help you learn correct positions",
                  icon: <Info className="w-6 h-6" />,
                },
              ].map((feature, i) => (
                <div key={i} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
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
                  {detectedLetter ? `Detected: ${detectedLetter}` : "Waiting for hand..."}
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

            {/* Main Grid - 3 columns */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Camera View - 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                <div className={cn(
                  "transition-all duration-200",
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
                      Letters are detected automatically and added to the word builder. 
                      Hold each sign steady for best results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar - 5 cols */}
              <div className="lg:col-span-5 space-y-6">
                {/* Word Builder - Primary */}
                <WordBuilder
                  detectedLetter={detectedLetter}
                  isActive={isActive}
                />
                
                {/* Detection Display */}
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
        <p>Powered by MediaPipe Hands • Optimized for real-time ASL detection</p>
      </footer>
    </div>
  );
};

export default Index;
