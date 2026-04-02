import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Play, Check, FileAudio } from 'lucide-react';
import { AudioGuide } from '../types';
import { useAudio } from '../src/context/AudioContext';

interface AudioCardProps {
  guide: AudioGuide;
  onToggleDone: (id: number) => void;
  isHighlighted: boolean;
  t: {
    play: string;
    dayLabel: string;
  };
}

const AudioCard = React.memo(React.forwardRef<HTMLDivElement, AudioCardProps>(({ 
  guide, 
  onToggleDone, 
  isHighlighted,
  t 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { playAudio, activeRecord, isPlaying } = useAudio();
  const isActive = activeRecord?.id === guide.id;

  return (
    <motion.div 
      ref={ref}
      className="relative flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative group">
        {/* Main Action: Play Audio */}
        <motion.button 
          onClick={() => playAudio(guide)} 
          whileTap={{ scale: 0.96 }}
          className={`w-full flex flex-col items-center justify-center pt-7 pb-4 rounded-2xl transition-all border-2 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12] ${
            isActive
              ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
              : guide.isCompleted 
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' 
                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
          } ${isHighlighted ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#051a12]' : ''}`}
          aria-label={`${t.play} ${t.dayLabel} ${guide.id}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
            isActive
              ? 'bg-[#D4AF37] text-white shadow-xl scale-110'
              : guide.audioUrl 
                ? 'bg-[#B8860B] text-white shadow-xl group-hover:scale-110' 
                : 'bg-white/10 text-white/40'
          }`}>
            {isActive && isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className="flex items-end gap-0.5 h-4">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
                  <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                  <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.1 }} className="w-1 bg-white rounded-full" />
                </div>
              </motion.div>
            ) : guide.audioUrl ? (
              <Play className="w-6 h-6 fill-current ml-1" />
            ) : (
              <FileAudio className="w-6 h-6" />
            )}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-[#D4AF37]' : 'text-white/90'}`}>
            {t.dayLabel} {guide.id}
          </span>
          
          {isActive && (
            <motion.div 
              layoutId="playing-indicator"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D4AF37] rounded-full"
            />
          )}
        </motion.button>

        {/* Info Toggle Button */}
        {(guide.fileName || guide.date) && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            whileTap={{ scale: 0.9 }}
            className={`absolute -bottom-2 -left-2 w-11 h-11 rounded-full shadow-lg transition-all z-20 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12] ${
              isExpanded ? 'bg-[#D4AF37] text-white' : 'bg-teal-900/80 text-white/60 hover:text-white'
            }`}
            aria-label={isExpanded ? "Hide audio information" : "Show audio information"}
            aria-expanded={isExpanded}
          >
            <Info className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        )}

        {/* Secondary Action: Toggle Done - Redesigned for 44x44px touch target */}
        <motion.button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleDone(guide.id); 
          }}
          whileTap={{ scale: 0.9 }}
          className={`absolute -top-3 -right-3 w-11 h-11 rounded-full shadow-lg transition-all z-20 flex items-center justify-center group/toggle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051a12] ${
            guide.isCompleted 
              ? 'text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          title={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
          aria-label={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all relative ${
            guide.isCompleted 
              ? 'bg-[#B8860B] border-[#FCF6BA]/50' 
              : 'bg-[#051a12] border-white/40 group-hover/toggle:border-white/60'
          }`} aria-hidden="true">
            <AnimatePresence mode="wait">
              {guide.isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </motion.div>
              ) : (
                <motion.span 
                  key="id"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold"
                >
                  {guide.id}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Ripple Effect when completed */}
            <AnimatePresence>
              {guide.isCompleted && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-[#D4AF37] pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>

      {/* Inline Expansion for Info */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-teal-900/40 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs shadow-xl">
              {guide.fileName && <div className="font-bold mb-1 gold-text">{guide.fileName}</div>}
              {guide.date && <div className="opacity-60">{guide.date}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}));

export default AudioCard;
