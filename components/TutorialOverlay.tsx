import React, { useState, useEffect } from 'react';
import { Info, Play, ShieldCheck, Zap } from 'lucide-react';

interface TutorialStep {
  text: string;
  highlight?: string; // CSS selector or logical position
}

interface TutorialOverlayProps {
  gameTitle: string;
  steps: string[];
  onComplete: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ gameTitle, steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const fullText = steps[currentStep];
    const timer = setInterval(() => {
      setDisplayedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [currentStep, steps]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-scifi-bg/95 backdrop-blur-md flex items-center justify-center p-6 overflow-hidden">
      {/* Background Tech Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full border-[20px] border-scifi-primary/10 rounded-full scale-150 animate-pulse-slow"></div>
        <div className="grid grid-cols-12 h-full w-full">
           {Array.from({length: 12}).map((_, i) => <div key={i} className="border-r border-scifi-primary/10 h-full"></div>)}
        </div>
      </div>

      <div className="relative w-full max-w-md bg-scifi-card border border-scifi-primary/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-in zoom-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-scifi-primary/20 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-scifi-primary" />
          </div>
          <div>
            <h3 className="text-xs font-mono text-scifi-muted uppercase tracking-widest">系统校准序列</h3>
            <h2 className="text-xl font-display font-bold text-white">{gameTitle}</h2>
          </div>
        </div>

        <div className="min-h-[120px] mb-8">
          <p className="text-lg leading-relaxed text-scifi-text font-medium">
            <span className="text-scifi-primary mr-2 font-mono">&gt;&gt;</span>
            {displayedText}
            <span className="inline-block w-2 h-5 bg-scifi-primary ml-1 animate-pulse"></span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 w-6 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-scifi-primary' : 'bg-white/10'}`}
              ></div>
            ))}
          </div>

          <button 
            onClick={next}
            className="flex items-center gap-2 bg-scifi-primary hover:bg-cyan-400 text-black px-6 py-2 rounded-full font-bold transition-all active:scale-95 group"
          >
            <span>{currentStep === steps.length - 1 ? '开始初始化' : '下一步'}</span>
            <Zap size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-2 border-l-2 border-scifi-primary rounded-tl-3xl"></div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-2 border-r-2 border-scifi-primary rounded-br-3xl"></div>
      </div>
    </div>
  );
};

export default TutorialOverlay;