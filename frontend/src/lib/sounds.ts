
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

export function initAudio() {
  audioElements.forEach((audio) => {
    audio.preload = 'auto';
    audio.load();
  });
}

function playAudio(audio: HTMLAudioElement) {
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

if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
