
const soundFiles = {
  goal: '/sounds/but.mp3',
  var: '/sounds/var.mp3',
  yellowCard: '/sounds/yellow_card.mp3',
  substitution: '/sounds/substitution.mp3',
  redCard: '/sounds/red_card.mp3',
  start: '/sounds/start.mp3',
  end: '/sounds/end.mp3',
} as const;


type SoundName = keyof typeof soundFiles;

let audioContext: AudioContext | null = null;

const audioBuffers = new Map<SoundName, AudioBuffer>();
const htmlAudio = new Map<SoundName, HTMLAudioElement>();

const pendingSounds: SoundName[] = [];

let audioReady = false;
let audioLoading = false;
let htmlAudioReady = false;

function getAudioContext(): AudioContext | null {
  try {
    if (audioContext) return audioContext;

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
    return audioContext;
  } catch (error) {
    console.warn('AudioContext indisponible :', error);
    return null;
  }
}

// Méthode 1 : Web Audio API
function playWithWebAudio(name: SoundName): boolean {
  try {
    if (!audioContext || audioContext.state !== 'running') {
      return false;
    }

    const buffer = audioBuffers.get(name);
    if (!buffer) return false;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);

    return true;
  } catch (error) {
    console.warn('Web Audio a échoué :', error);
    return false;
  }
}

// Méthode 2 : HTML Audio
function playWithHtmlAudio(name: SoundName): boolean {
  try {
    const template = htmlAudio.get(name);
    if (!template) return false;

    const audio = template.cloneNode(true) as HTMLAudioElement;
    audio.volume = 1;
    audio.currentTime = 0;

    const promise = audio.play();

    if (promise) {
      promise.catch((error) => {
        console.warn('Lecture HTML Audio bloquée :', error);

        if (!pendingSounds.includes(name)) {
          pendingSounds.push(name);
        }
      });
    }

    return true;
  } catch (error) {
    console.warn('HTML Audio a échoué :', error);
    return false;
  }
}

// Préparation des fichiers MP3
function prepareHtmlAudio() {
  try {
    Object.entries(soundFiles).forEach(([name, url]) => {
      const soundName = name as SoundName;

      const audio = new Audio(url);
      audio.preload = 'auto';

      htmlAudio.set(soundName, audio);
    });

    htmlAudioReady = true;
  } catch (error) {
    console.error('Préparation HTML Audio impossible :', error);
  }
}

// Lecture avec système de secours
function playAudio(name: SoundName) {
  if (playWithWebAudio(name)) return;

  if (playWithHtmlAudio(name)) return;

  if (!pendingSounds.includes(name)) {
    pendingSounds.push(name);
  }
}

// Rejouer les sons en attente
function playPendingSounds() {
  if (!pendingSounds.length) return;

  const sounds = [...pendingSounds];
  pendingSounds.length = 0;

  sounds.forEach((name) => {
    if (!playWithWebAudio(name) && !playWithHtmlAudio(name)) {
      pendingSounds.push(name);
    }
  });
}

// Initialisation à déclencher après une interaction utilisateur
export async function initAudio() {
  prepareHtmlAudio();

  try {
    const context = getAudioContext();

    // Appel immédiat pendant l'interaction utilisateur
    const resumePromise = context?.resume();

    if (context && !audioLoading && !audioReady) {
      audioLoading = true;

      try {
        await Promise.all(
          Object.entries(soundFiles).map(async ([name, url]) => {
            const soundName = name as SoundName;

            if (audioBuffers.has(soundName)) return;

            const response = await fetch(url);

            if (!response.ok) {
              throw new Error(`Impossible de charger ${url}`);
            }

            const data = await response.arrayBuffer();
            const buffer = await context.decodeAudioData(data);

            audioBuffers.set(soundName, buffer);
          })
        );

        audioReady = true;
        console.log('NDEMBO : sons Web Audio chargés');
      } catch (error) {
        console.warn('Web Audio non disponible, HTML Audio sera utilisé :', error);
      } finally {
        audioLoading = false;
      }
    }

    if (resumePromise) {
      await resumePromise;
    }

    playPendingSounds();
  } catch (error) {
    console.warn('Initialisation audio :', error);
  }
}

export function playGoalSound() {
  playAudio('goal');
}

export function playVarSound() {
  playAudio('var');
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

export function playStartMatchSound() {
  playAudio('start');
}

export function playEndMatchSound() {
  playAudio('end');
}

export function testGoalSound() {
  playGoalSound();
}

if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
