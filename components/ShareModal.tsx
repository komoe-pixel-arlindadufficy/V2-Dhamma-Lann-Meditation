
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: {
    share: string;
    copyLink: string;
    copied: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, t }) => {
  const [copied, setCopied] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-[#041a13] border border-[#D4AF37]/30 rounded-[2.5rem] overflow-hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <Share2 className="text-[#D4AF37] w-5 h-5" />
                </div>
                <h2 id="share-title" className="text-xl font-bold gold-text">
                  {t.share}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors"
                aria-label="Close share modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-8">
              {/* QR Code Container */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#D4AF37]/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                  <img 
                    src="/qr-code.svg" 
                    alt="QR Code to share website" 
                    className="w-48 h-48"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if image doesn't exist yet
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/seed/qr/200/200';
                      target.className = 'w-48 h-48 rounded-lg opacity-20';
                    }}
                  />
                </div>
              </div>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#D4AF37] text-black hover:bg-[#B8860B]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    {t.copyLink}
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                Share the journey with others
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
