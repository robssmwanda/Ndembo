
const goalAudio = new Audio('/sounds/but.mp3');
const varAudio = new Audio('/sounds/var.mp3');
const yellowCardAudio = new Audio('/sounds/yellow_card.mp3');
const substitutionAudio = new Audio('/sounds/substitution.mp3');
const redCardAudio = new Audio('/sounds/red_card.mp3');

const audioElements = [
  goalAudio,
  varAudio,
  yellowCardAudio,
  substitutionAudio,
  redCardAudio,
];

let audioInitialized = false;

export async function initAudio() {
  if (audioInitialized) return;

  try {
    for (const audio of audioElements) {
      audio.preload = 'auto';
      audio.muted = true;
      audio.currentTime = 0;

      await audio.play();

      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }

    audioInitialized = true;
    console.log('Audio initialisé avec succès');
  } catch (error) {
    audioElements.forEach((audio) => {
      audio.pause();
      audio.muted = false;
      audio.currentTime = 0;
    });

    console.error('Initialisation audio impossible :', error);
  }
}

function playAudio(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;

  void audio.play().catch((error) => {
    console.error('Erreur de lecture audio :', error);
  });
}

export function playGoalSound() {
  playAudio(goalAudio);
}

export function playVarSound() {
  playAudio(varAudio);
}

export function testGoalSound() {
  playGoalSound();
}

export function playYellowCardSound() {
  playAudio(yellowCardAudio);
}

export function playSubstitutionSound() {
  playAudio(substitutionAudio);
}

export function playRedCardSound() {
  playAudio(redCardAudio);
}

if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
