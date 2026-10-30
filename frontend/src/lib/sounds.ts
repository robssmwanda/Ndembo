
const goalAudio = new Audio('/sounds/but.mp3');
const varAudio = new Audio('/sounds/var.mp3');
const yellowCardAudio = new Audio('/sounds/yellow_card.mp3');
const substitutionAudio = new Audio('/sounds/substitution.mp3');
const redCardAudio = new Audio('/sounds/red_card.mp3');

export function playGoalSound() {
  goalAudio.currentTime = 0;
  void goalAudio.play().catch(console.error);
}

export function playVarSound() {
  varAudio.currentTime = 0;
  void varAudio.play().catch(console.error);
}

// Fonction de test du son de but
export function testGoalSound() {
  playGoalSound();
}

export function playYellowCardSound() {
  yellowCardAudio.currentTime = 0;
  void yellowCardAudio.play().catch(console.error);
}

// Son remplacement
export function playSubstitutionSound() {
  substitutionAudio.currentTime = 0;
  void substitutionAudio.play().catch(console.error);
}

export function playRedCardSound() {
  redCardAudio.currentTime = 0;
  void redCardAudio.play().catch(console.error);
}

// Exposer la fonction dans Chrome uniquement en développement
if (import.meta.env.DEV) {
  (window as any).testGoalSound = testGoalSound;
}
