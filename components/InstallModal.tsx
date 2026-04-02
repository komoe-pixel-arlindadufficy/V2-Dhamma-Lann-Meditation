
import React, { useMemo } from 'react';

interface InstallModalProps {
  type: 'ios' | 'android';
  t: any;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ type, t, onClose }) => {
  const isIosDevice = useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);

  const isIos = type === 'ios' || isIosDevice;
  
  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border-2 border-[#D4AF37]/40 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-[#B8860B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            {isIos ? (
              <span className="text-3xl" role="img" aria-label="Share icon">📤</span>
            ) : (
              <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            )}
          </div>
          <h3 id="install-modal-title" className="text-xl font-bold gold-text mb-4">
            {isIos ? 'Install on iPhone' : t.iosInstallTitle}
          </h3>
          <div className="text-white/80 text-sm leading-relaxed mb-8">
            {isIos ? (
              <div className="space-y-4">
                <p>To install on iPhone, tap the Share button below and select <strong>Add to Home Screen</strong>.</p>
                <div className="flex items-center justify-center gap-2 text-[#D4AF37] font-bold">
                  <span>Tap</span>
                  <span className="text-2xl" role="img" aria-label="Share">📤</span>
                  <span>then</span>
                  <span className="bg-white/10 px-2 py-1 rounded border border-white/20 text-xs">Add to Home Screen</span>
                </div>
              </div>
            ) : (
              <p>{t.androidInstallDesc}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#B8860B] text-white rounded-2xl font-bold shadow-lg hover:bg-[#9a700a] transition-all active-scale border border-[#FCF6BA]/30"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
