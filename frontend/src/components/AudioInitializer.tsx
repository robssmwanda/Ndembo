
import { useEffect } from 'react';
import { initAudio } from '@/lib/sounds';

export function AudioInitializer() {
  useEffect(() => {
    const enableAudio = () => {
      void initAudio();
    };

    window.addEventListener('pointerdown', enableAudio);
    window.addEventListener('touchstart', enableAudio);

    return () => {
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  return null;
}
