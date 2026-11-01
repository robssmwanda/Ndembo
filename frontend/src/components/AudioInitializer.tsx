
import { useEffect } from 'react';
import { initAudio } from '@/lib/sounds';

export function AudioInitializer() {
  useEffect(() => {
    let initialized = false;

    const enableAudio = () => {
      if (initialized) return;

      initialized = true;

      void initAudio();

      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
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
