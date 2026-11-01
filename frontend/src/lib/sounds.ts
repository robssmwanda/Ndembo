
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
const pendingSounds: SoundName[] = [];

let audioLoading = false;
let audioReady = false;

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

  if (!AudioContextClass) {
    console.error('Web Audio API non disponible');
    return null;
  }

  audioContext = new AudioContextClass();
  return audioContext;
}

function playAudioNow(name: SoundName) {
  if (!audioContext || audioContext.state !== 'running') {
    return false;
  }

  const buffer = audioBuffers.get(name);

  if (!buffer) {
    return false;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);

  return true;
}

function playPendingSounds() {
  if (!audioReady || !audioContext || audioContext.state !== 'running') {
    return;
  }

  while (pendingSounds.length > 0) {
    const name = pendingSounds.shift()!;

    if (!playAudioNow(name)) {
      pendingSounds.unshift(name);
      break;
    }
  }
}

export async function initAudio() {
  try {
    const context = getAudioContext();

    if (!context) return;

    // Cette instruction doit être appelée directement pendant
    // une interaction utilisateur pour respecter les restrictions mobiles.
    const resumePromise = context.resume();

    if (!audioLoading && !audioReady) {
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
        console.log('Tous les sons NDEMBO sont chargés');

      } catch (error) {
        console.error('Erreur de chargement des sons :', error);
      } finally {
        audioLoading = false;
      }
    }

    await resumePromise;

    playPendingSounds();

  } catch (error) {
    console.error('Initialisation audio impossible :', error);
  }
}

function playAudio(name: SoundName) {
  // Si le son n'est pas encore chargé, on le met en attente.
  if (!audioReady || !audioContext || audioContext.state !== 'running') {
    pendingSounds.push(name);
    return;
  }

  if (!playAudioNow(name)) {
    pendingSounds.push(name);
  }
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
