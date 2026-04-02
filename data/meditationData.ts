
import { AudioGuide } from '../types';

export const meditationItems: AudioGuide[] = Array.from({ length: 365 }, (_, i) => {
  const day = i + 1;
  return {
    id: day,
    titleEn: `Day ${day}`,
    titleMy: `နေ့ရက် (${day})`,
    isCompleted: false,
  };
});
