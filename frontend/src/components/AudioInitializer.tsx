
import { useEffect } from 'react';
import { initAudio } from '@/lib/sounds';

export function AudioInitializer() {
  useEffect(() => {
    const enableAudio = () => {
      initAudio();

      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('click', enableAudio);
    };

    window.addEventListener('pointerdown', enableAudio);
    window.addEventListener('touchstart', enableAudio);
    window.addEventListener('click', enableAudio);

    return () => {
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('click', enableAudio);
    };
  }, []);

  return null;
}
