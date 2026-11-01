
import { useEffect } from 'react';
import { initAudio } from '@/lib/sounds';

export function AudioInitializer() {
  useEffect(() => {
    let initialized = false;

    const enableAudio = async () => {
      if (initialized) return;

      try {
        await initAudio();

        // On ne considère l'initialisation terminée
        // que si le navigateur autorise réellement le son.
        initialized = true;

        window.removeEventListener('pointerdown', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
        window.removeEventListener('keydown', enableAudio);
      } catch (error) {
        console.warn('Nouvelle tentative audio nécessaire :', error);
      }
    };

    window.addEventListener('pointerdown', enableAudio);
    window.addEventListener('touchstart', enableAudio);
    window.addEventListener('keydown', enableAudio);

    return () => {
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

  return null;
}
