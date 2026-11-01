
const soundFiles = {
  goal: '/sounds/but.mp3',
  var: '/sounds/var.mp3',
  yellowCard: '/sounds/yellow_card.mp3',
  substitution: '/sounds/substitution.mp3',
  redCard: '/sounds/red_card.mp3',
} as const;

type SoundName = keyof typeof soundFiles;

let audioContext: AudioContext | null = null;
const audioBuffers = new Map<SoundName, AudioBuffer>();
let audioLoading = false;

export function initAudio() {
  try {
    if (!audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) {
        console.error('Web Audio API non disponible');
        return;
      }

      audioContext = new AudioContextClass();
    }

    // Appelé directement pendant l'interaction utilisateur.
    const resumePromise = audioContext.resume();

    if (!audioLoading) {
      audioLoading = true;

      void Promise.all(
        Object.entries(soundFiles).map(async ([name, url]) => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Impossible de charger ${url}`);
          }

          const data = await response.arrayBuffer();
          const buffer = await audioContext!.decodeAudioData(data);

          audioBuffers.set(name as SoundName, buffer);
        })
      )
        .then(() => {
          console.log('Tous les sons NDEMBO sont chargés');
        })
        .catch((error) => {
          audioLoading = false;
          console.error('Erreur de chargement des sons :', error);
        });
    }

    void resumePromise.catch((error) => {
      console.error('Impossible de démarrer AudioContext :', error);
    });
  } catch (error) {
    console.error('Initialisation audio impossible :', error);
  }
}

function playAudio(name: SoundName) {
  if (!audioContext || audioContext.state !== 'running') {
    console.warn('Audio non activé :', name);
    return;
  }

  const buffer = audioBuffers.get(name);

  if (!buffer) {
    console.warn('Son pas encore chargé :', name);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

export function playGoalSound() {
  playAudio('goal');
}

export function playVarSound() {
  playAudio('var');
}

export function testGoalSound() {
  playGoalSound();
}

export function playYellowCardSound() {
  playAudio('yellowCard');
}

export function playSubstitutionSound() {
  playAudio('substitution');
}

export function playRedCardSound() {
  playAudio('redCard');
}

if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
