
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

export function initAudio() {
  if (audioInitialized) return;

  audioElements.forEach((audio) => {
    audio.preload = 'auto';
    audio.load();
  });

  audioInitialized = true;
}

function playAudio(audio: HTMLAudioElement) {
  if (!audioInitialized) {
    console.warn('Audio non initialisé : une interaction utilisateur est nécessaire.');
    return;
  }

  audio.pause();
  audio.currentTime = 0;

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

// Exposer la fonction de test en développement
if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
