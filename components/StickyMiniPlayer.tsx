import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Pause, X, AlertCircle, RefreshCw } from 'lucide-react';
import { AudioGuide } from '../types';

import { useAudio } from '../src/context/AudioContext';

interface StickyMiniPlayerProps {
  lang: 'my' | 'en';
}

const StickyMiniPlayer: React.FC<StickyMiniPlayerProps> = ({ 
  lang 
}) => {
  const { 
    currentAudio, 
    isPlaying, 
    isBuffering, 
    error, 
    togglePlay, 
    stopAudio,
    playAudio
  } = useAudio();

  if (!currentAudio) return null;

  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(currentAudio.id) : currentAudio.id;
  const dayLabel = lang === 'my' ? 'နေ့ရက်' : 'Day';

  return (
    <AnimatePresence>
      {currentAudio && (
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-md px-4 pb-[env(safe-area-inset-bottom)]"
          aria-label="Mini audio player"
        >
          <div className="glass-card rounded-2xl p-3 border border-[#D4AF37]/40 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 backdrop-blur-xl bg-[#051a12]/80">
            {/* Audio Info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8860B] flex items-center justify-center flex-shrink-0 shadow-lg" aria-hidden="true">
                <span className="text-white font-bold text-xs">
                  {dayDisplay}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                  {dayLabel} {dayDisplay}
                </p>
                <h4 className="text-white text-xs font-medium truncate">
                  {lang === 'my' ? currentAudio.titleMy : currentAudio.titleEn || currentAudio.fileName}
                </h4>
              </div>
            </div>
    
            {/* Controls */}
            <div className="flex items-center gap-2">
              {error ? (
                <button
                  onClick={() => playAudio(currentAudio)}
                  className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all active:scale-90 text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12]"
                  aria-label="Retry loading audio"
                >
                  <RefreshCw className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12]"
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
                onClick={stopAudio}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12]"
                aria-label="Close audio player"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Error Tooltip */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <AlertCircle className="w-3 h-3" />
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
