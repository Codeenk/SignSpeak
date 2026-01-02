import { useState, useCallback } from "react";
import { Camera, CameraOff, Info, Zap, Hand, Type, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pb-20 pt-10">
        {/* Hero Section */}
        {!isActive && (
          <div className="text-center py-20 animate-fade-in space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4 animate-scale-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Now with AI-powered Real-time Detection
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Break Barriers with <br className="hidden md:block" />
              <span className="gradient-text">SignSpeak</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of communication. Translate American Sign Language into text instantly using just your camera and artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setIsActive(true)}
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto gap-2"
              >
                <Camera className="w-5 h-5" />
                Start Translating Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 transition-all duration-300 w-full sm:w-auto gap-2"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
              {[
                {
                  title: "Real-time Translation",
                  description: "Instant recognition of ASL alphabet with high accuracy using advanced computer vision.",
                  icon: <Zap className="w-6 h-6" />,
                  color: "text-amber-500",
                  bg: "bg-amber-50"
                },
                {
                  title: "Smart Word Building",
                  description: "Automatically assembles detected letters into coherent words and sentences.",
                  icon: <Type className="w-6 h-6" />,
                  color: "text-blue-500",
                  bg: "bg-blue-50"
                },
                {
                  title: "Interactive Learning",
                  description: "Visual guides and instant feedback help you master sign language faster.",
                  icon: <BookOpen className="w-6 h-6" />,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50"
                },
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 animate-slide-up hover:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors", feature.bg, feature.color)}>
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* How it Works Section */}
            <div className="mt-32 pt-16 border-t border-border/50">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-16">How SignSpeak Works</h2>
              <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 hidden md:block" />

                {[
                  { step: "01", title: "Enable Camera", desc: "Allow access to your webcam to start the detection engine." },
                  { step: "02", title: "Sign Clearly", desc: "Position your hand in the frame and sign ASL letters clearly." },
                  { step: "03", title: "See Translation", desc: "Watch as AI instantly converts your signs into text." }
                ].map((item, i) => (
                  <div key={i} className="relative z-10 bg-background p-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-lg shadow-primary/20">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Detection View */}
        {isActive && (
          <div className="animate-fade-in space-y-8">
            {/* Top Bar controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border shadow-sm">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  detectedLetter
                    ? "bg-accent/10 text-accent-foreground border border-accent/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    detectedLetter ? "bg-accent animate-pulse" : "bg-muted-foreground/30"
                  )} />
                  {detectedLetter ? "Sign Detected" : "Ready for input"}
                </div>
                <div className="h-6 w-px bg-border/60 hidden sm:block" />
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  Is hand visible? {detectedLetter ? "Yes" : "No"}
                </span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsActive(false)}
                className="gap-2 rounded-full hover:bg-destructive/90 shadow-sm"
              >
                <CameraOff className="w-4 h-4" />
                Stop Session
              </Button>
            </div>

            {/* Main Application Grid */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Camera & Visual Feedback - 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                <div className={cn(
                  "relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ring-1 ring-black/5",
                  detectedLetter ? "ring-4 ring-accent/20 scale-[1.01]" : ""
                )}>
                  <HandDetector
                    onDetection={handleDetection}
                    isActive={isActive}
                  />

                  {/* Overlay Helper */}
                  {!detectedLetter && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none animate-bounce">
                      Raise your hand to start
                    </div>
                  )}
                </div>

                {/* Instructions Card */}
                <div className="bg-card rounded-2xl p-6 border shadow-sm flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        Ensure good lighting on your hands
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        Keep hand steady for accurate detection
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        Face the camera directly
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar Tools - 5 cols */}
              <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
                {/* Live Translation Output */}
                <div className="flex-1">
                  <WordBuilder
                    detectedLetter={detectedLetter}
                    isActive={isActive}
                  />
                </div>

                {/* Confidence Meter */}
                <DetectionDisplay
                  detectedLetter={detectedLetter}
                  confidence={confidence}
                />
              </div>
            </div>

            {/* Visual Dictionary */}
            <div className="pt-8 border-t">
              <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Sign Dictionary
              </h3>
              <ASLReference highlightedLetter={detectedLetter} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-card border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2024 SignSpeak AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
