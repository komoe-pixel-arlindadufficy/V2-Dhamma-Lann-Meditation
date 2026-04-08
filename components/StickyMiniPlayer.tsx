import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Play, Pause, X, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { AudioGuide } from '../types';

import { useAudio } from '../src/context/AudioContext';

interface StickyMiniPlayerProps {
  lang: 'my' | 'en';
}

const Marquee: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldScroll(textRef.current.offsetWidth > containerRef.current.offsetWidth);
    }
  }, [text]);

  if (!shouldScroll) {
    return (
      <div ref={containerRef} className={`overflow-hidden ${className}`}>
        <div ref={textRef} className="truncate">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
        className="inline-flex whitespace-nowrap gap-8"
      >
        <span ref={textRef}>{text}</span>
        <span>{text}</span>
      </motion.div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[#051a12] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[#051a12] to-transparent z-10" />
    </div>
  );
};

const StickyMiniPlayer: React.FC<StickyMiniPlayerProps> = ({ 
  lang 
}) => {
  const { 
    activeRecord, 
    isPlaying, 
    isBuffering, 
    progress,
    error, 
    togglePlay, 
    stopAudio,
    playAudio,
    playNext,
    playPrevious
  } = useAudio();

  if (!activeRecord) return null;

  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(activeRecord.id) : activeRecord.id;
  const dayLabel = lang === 'my' ? 'နေ့ရက်' : 'Day';
  const title = lang === 'my' ? activeRecord.titleMy : activeRecord.titleEn || activeRecord.fileName;

  return (
    <AnimatePresence>
      {activeRecord && (
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-md px-4 pb-[env(safe-area-inset-bottom)]"
          aria-label="Mini audio player"
        >
          <div className="relative overflow-hidden glass-card rounded-2xl border border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-[#051a12]/90">
            {/* Progress Bar Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <motion.div 
                className="h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              />
            </div>

            <div className="p-3 flex items-center gap-4 pt-4">
              {/* Audio Info */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-[0_4px_15px_rgba(184,134,11,0.4)]" 
                  aria-hidden="true"
                >
                  <span className="text-white font-bold text-sm">
                    {dayDisplay}
                  </span>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#D4AF37]/80 font-bold uppercase tracking-[0.2em] mb-0.5">
                    {dayLabel} {dayDisplay}
                  </p>
                  <Marquee 
                    text={title} 
                    className="text-white text-sm font-semibold"
                  />
                </div>
              </div>
      
              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={playPrevious}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                  aria-label="Previous audio"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {error ? (
                  <button
                    onClick={() => playAudio(activeRecord)}
                    className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all active:scale-90 text-red-400"
                    aria-label="Retry loading audio"
                  >
                    <RefreshCw className="w-5 h-5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    onClick={togglePlay}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 shadow-inner"
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                    disabled={isBuffering}
                  >
                    {isBuffering ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5 text-white fill-current" aria-hidden="true" />
                    ) : (
                      <Play className="w-5 h-5 text-white fill-current ml-0.5" aria-hidden="true" />
                    )}
                  </button>
                )}

                <button
                  onClick={playNext}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                  aria-label="Next audio"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                  onClick={stopAudio}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
                  aria-label="Close audio player"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Tooltip */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-2xl flex items-center gap-2 whitespace-nowrap border border-white/20"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default StickyMiniPlayer;
