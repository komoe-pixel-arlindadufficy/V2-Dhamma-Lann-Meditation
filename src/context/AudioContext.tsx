
import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AudioGuide } from '../../types';

interface AudioState {
  activeRecord: AudioGuide | null;
  meditations: AudioGuide[];
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isBuffering: boolean;
  error: string | null;
  lang: 'my' | 'en';
}

interface AudioControls {
  playAudio: (guide: AudioGuide) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  togglePlay: () => void;
  stopAudio: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setMeditations: (meditations: AudioGuide[]) => void;
  setLang: (lang: 'my' | 'en') => void;
}

const AudioStateContext = createContext<AudioState | undefined>(undefined);
const AudioControlContext = createContext<AudioControls | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRecord, setActiveRecord] = useState<AudioGuide | null>(null);
  const [meditations, setMeditations] = useState<AudioGuide[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'my' | 'en'>(() => (localStorage.getItem('mindfulness_lang_pref') as 'my' | 'en') || 'my');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  
  // Use refs to keep track of state for stable callbacks
  const activeRecordRef = useRef(activeRecord);
  const meditationsRef = useRef(meditations);
  const isPlayingRef = useRef(isPlaying);
  const playNextRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeRecordRef.current = activeRecord;
  }, [activeRecord]);

  useEffect(() => {
    meditationsRef.current = meditations;
  }, [meditations]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('mindfulness_lang_pref', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const playAudio = useCallback((guide: AudioGuide) => {
    if (!audioRef.current || !guide.audioUrl) return;

    const current = activeRecordRef.current;
    const playing = isPlayingRef.current;

    if (current?.id === guide.id) {
      if (playing) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    setError(null);
    setActiveRecord(guide);
    audioRef.current.src = guide.audioUrl;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        // Pre-fetch next track metadata
        preloadNextTrack();
      })
      .catch(err => {
        console.error("Playback error:", err);
        setError("Failed to play audio. Please check your connection.");
      });
  }, []);

  const preloadNextTrack = useCallback(() => {
    const current = activeRecordRef.current;
    const list = meditationsRef.current;
    if (!current || list.length === 0) return;

    const currentIndex = list.findIndex(m => m.id === current.id);
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      const nextRecord = list[currentIndex + 1];
      if (nextRecord.audioUrl) {
        if (!preloadRef.current) {
          preloadRef.current = new Audio();
        }
        preloadRef.current.src = nextRecord.audioUrl;
        preloadRef.current.preload = "metadata";
        preloadRef.current.load();
      }
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current && activeRecordRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [pauseAudio, resumeAudio]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setActiveRecord(null);
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

  const seekTo = useCallback((newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  }, []);

  const playNext = useCallback(() => {
    const current = activeRecordRef.current;
    const list = meditationsRef.current;
    if (!current || list.length === 0) return;

    const currentIndex = list.findIndex(m => m.id === current.id);
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      const nextRecord = list[currentIndex + 1];
      if (nextRecord.audioUrl) {
        playAudio(nextRecord);
      }
    }
  }, [playAudio]);

  const playPrevious = useCallback(() => {
    const current = activeRecordRef.current;
    const list = meditationsRef.current;
    if (!current || list.length === 0) return;

    const currentIndex = list.findIndex(m => m.id === current.id);
    if (currentIndex > 0) {
      const prevRecord = list[currentIndex - 1];
      if (prevRecord.audioUrl) {
        playAudio(prevRecord);
      }
    }
  }, [playAudio]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
      
      // Update Media Session position state
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration || 0,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime || 0,
          });
        } catch (e) {
          // Ignore errors from setPositionState
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      
      // Update Media Session position state
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration || 0,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime || 0,
          });
        } catch (e) {
          // Ignore errors
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      // Auto-play next
      if (playNextRef.current) {
        playNextRef.current();
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = (e: any) => {
      console.error("Audio element error:", e);
      setError("Audio playback failed. Skipping to next track in 3 seconds...");
      setIsBuffering(false);
      setIsPlaying(false);

      // Automatically call playNext after 3 seconds
      setTimeout(() => {
        if (playNextRef.current) {
          setError(null);
          playNextRef.current();
        }
      }, 3000);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Media Session API integration
  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeRecord) return;

    const title = activeRecord.title || (lang === 'my' ? activeRecord.titleMy : activeRecord.titleEn) || `Day ${activeRecord.day_number || activeRecord.id}`;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: 'Dhamma Lann',
      album: '365 Days Journey',
      artwork: [
        { src: '/icon.svg', sizes: '96x96', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '128x128', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '256x256', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '384x384', type: 'image/svg+xml' },
        { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
      ]
    });

    const handlers: { [key: string]: MediaSessionActionHandler } = {
      play: resumeAudio,
      pause: pauseAudio,
      previoustrack: playPrevious,
      nexttrack: playNext,
      seekbackward: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
        }
      },
      seekforward: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
        }
      },
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch (error) {
        // Ignore unsupported actions
      }
    });

    return () => {
      Object.keys(handlers).forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action as MediaSessionAction, null);
        } catch (error) {
          // Ignore
        }
      });
    };
  }, [activeRecord, resumeAudio, pauseAudio, playPrevious, playNext, lang]);

  // Update playback state in Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const stateValue = useMemo(() => ({
    activeRecord,
    meditations,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isBuffering,
    error,
    lang,
  }), [activeRecord, meditations, isPlaying, progress, currentTime, duration, volume, isBuffering, error, lang]);

  const controlValue = useMemo(() => ({
    playAudio,
    pauseAudio,
    resumeAudio,
    togglePlay,
    stopAudio,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    setMeditations,
    setLang,
  }), [playAudio, pauseAudio, resumeAudio, togglePlay, stopAudio, seekTo, setVolume, playNext, playPrevious, setLang]);

  return (
    <AudioStateContext.Provider value={stateValue}>
      <AudioControlContext.Provider value={controlValue}>
        {children}
      </AudioControlContext.Provider>
    </AudioStateContext.Provider>
  );
};

export const useAudio = () => {
  const state = useContext(AudioStateContext);
  const controls = useContext(AudioControlContext);
  
  if (state === undefined || controls === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  
  return { ...state, ...controls };
};

export const useAudioControls = () => {
  const context = useContext(AudioControlContext);
  if (context === undefined) {
    throw new Error('useAudioControls must be used within an AudioProvider');
  }
  return context;
};

export const useAudioState = () => {
  const context = useContext(AudioStateContext);
  if (context === undefined) {
    throw new Error('useAudioState must be used within an AudioProvider');
  }
  return context;
};
