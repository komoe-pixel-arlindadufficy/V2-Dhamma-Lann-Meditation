import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAudio, Play, Download, X } from 'lucide-react';
import { AudioGuide } from '../types';

interface ActionModalProps {
  guide: AudioGuide;
  t: any;
  onClose: () => void;
  onPlay: (guide: AudioGuide) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ guide, t, onClose, onPlay }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-2 border-[#D4AF37]/40 bg-[#051a12]/90 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#B8860B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/20">
            <FileAudio className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {guide.fileName || `${t.dayLabel} ${guide.id}`}
          </h3>
          <p className="text-teal-100/60 text-xs uppercase tracking-widest font-bold">
            {t.dayLabel} {guide.id}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(guide);
              onClose();
            }}
            className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white rounded-2xl font-bold shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Now
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = guide.audioUrl || '';
              link.download = guide.fileName || `Day_${guide.id}.mp3`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onClose();
            }}
            className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center justify-center gap-3 w-full py-4 text-white/40 font-bold hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActionModal;
