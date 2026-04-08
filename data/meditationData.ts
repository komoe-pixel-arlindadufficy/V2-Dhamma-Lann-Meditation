
import { AudioGuide } from '../types';

export const meditationItems: AudioGuide[] = Array.from({ length: 365 }, (_, i) => {
  const day = i + 1;
  const titles = [
    "Mindfulness of Breath and Body Awareness",
    "Loving-Kindness Meditation for Inner Peace",
    "Deep Relaxation and Stress Relief Session",
    "Focus and Concentration Enhancement",
    "Gratitude and Positive Thinking Practice",
    "Emotional Balance and Resilience Training",
    "Self-Compassion and Healing Meditation",
    "Walking Meditation for Grounding",
    "Body Scan for Physical Awareness",
    "Sleep and Restorative Rest Meditation"
  ];
  return {
    id: day,
    titleEn: titles[i % titles.length],
    titleMy: `နေ့ရက် (${day}) - ${titles[i % titles.length]}`,
    isCompleted: false,
  };
});
