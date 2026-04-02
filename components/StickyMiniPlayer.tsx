import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Pause, X, RefreshCw, SkipBack, SkipForward } from 'lucide-react';

import { useAudio } from '../src/context/AudioContext';

interface StickyMiniPlayerProps {
  lang: 'my' | 'en';
}

const StickyMiniPlayer: React.FC<StickyMiniPlayerProps> = ({ 
  lang 
}) => {
  const { 
    activeRecord, 
    isPlaying, 
    isBuffering, 
    progress,
    currentTime,
    duration,
    error, 
    togglePlay, 
    stopAudio,
    playAudio,
    playNext,
    playPrevious,
    seekTo
  } = useAudio();

  if (!activeRecord) return null;

  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(activeRecord.id) : activeRecord.id;
  const dayLabel = lang === 'my' ? 'နေ့ရက်' : 'Day';

  return (
    <AnimatePresence>
      {activeRecord && (
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-lg px-4 pb-[env(safe-area-inset-bottom)]"
          aria-label="Premium audio player"
        >
          <div className="glass-card rounded-3xl p-4 md:p-6 border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-[#051a12]/90 flex flex-col gap-4">
            
            {/* Header: Info & Close */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#B8860B] to-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20" aria-hidden="true">
                  <span className="text-white font-black text-sm md:text-base">
                    {dayDisplay}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.2em]">
                    {dayLabel} {dayDisplay}
                  </p>
                  <h4 className="text-white text-sm md:text-base font-bold truncate">
                    {lang === 'my' ? activeRecord.titleMy : activeRecord.titleEn || activeRecord.fileName}
                  </h4>
                </div>
              </div>

              <button
                onClick={stopAudio}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Close audio player"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="relative group px-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#D4AF37] hover:accent-[#FCF6BA] transition-all"
                  aria-label="Seek audio position"
                />
                {/* Visual Progress Fill */}
                <div 
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] rounded-full pointer-events-none"
                  style={{ width: `calc(${progress}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between px-1">
                <span className="text-[10px] font-mono text-white/50">{formatTime(currentTime)}</span>
                <span className="text-[10px] font-mono text-white/50">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6 md:gap-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playPrevious}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Previous audio"
              >
                <SkipBack className="w-6 h-6 md:w-7 md:h-7 fill-current" aria-hidden="true" />
              </motion.button>

              <div className="relative">
                {isBuffering && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"
                  />
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={error ? () => playAudio(activeRecord) : togglePlay}
                  className={`w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(184,134,11,0.3)] relative z-10 ${
                    error 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                      : 'bg-gradient-to-br from-[#B8860B] to-[#D4AF37] text-white'
                  }`}
                  aria-label={error ? "Retry loading" : isPlaying ? "Pause" : "Play"}
                  disabled={isBuffering && !error}
                >
                  {error ? (
                    <RefreshCw className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
                  ) : isBuffering ? (
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" aria-hidden="true" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" aria-hidden="true" />
                  ) : (
                    <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" aria-hidden="true" />
                  )}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playNext}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Next audio"
              >
                <SkipForward className="w-6 h-6 md:w-7 md:h-7 fill-current" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default StickyMiniPlayer;
