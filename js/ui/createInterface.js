export function createInterface() {
  const intro = document.querySelector("#intro");
  const startButton = document.querySelector("#start-button");
  const loadingLabel = document.querySelector("#loading-label");
  const hud = document.querySelector("#hud");
  const resetButton = document.querySelector("#reset-view");
  const hint = document.querySelector("#controls-hint");
  const phraseCard = document.querySelector("#phrase-card");
  const phraseText = document.querySelector("#selected-phrase");
  const progress = document.querySelector("#discovery-progress");
  const tourGuide = document.querySelector("#tour-guide");
  const tourMoment = document.querySelector("#tour-moment");
  const skipTourButton = document.querySelector("#skip-tour");
  const moonWhisper = document.querySelector("#moon-whisper");
  const finaleMessage = document.querySelector("#finale-message");
  const letterDialog = document.querySelector("#secret-letter");
  const letterEyebrow = document.querySelector("#letter-eyebrow");
  const letterTitle = document.querySelector("#letter-title");
  const letterBody = document.querySelector("#letter-body");
  const letterSignature = document.querySelector("#letter-signature");
  const closeLetterButton = document.querySelector("#close-letter");
  let phraseTimer;
  let hintTimer;
  let moonTimer;
  let finaleTimer;
  let progressTimer;
  let letterCloseCallback = null;

  startButton.disabled = true;

  const api = {
    setReady() {
      startButton.disabled = false;
      loadingLabel.classList.add("is-ready");
      loadingLabel.textContent = "Universo listo";
    },
    onStart(callback) {
      startButton.addEventListener("click", () => {
        startButton.disabled = true;
        intro.classList.add("is-leaving");
        intro.setAttribute("aria-hidden", "true");
        hud.classList.add("is-visible");
        hud.setAttribute("aria-hidden", "false");
        callback();
      }, { once: true });
    },
    onReset(callback) {
      resetButton.addEventListener("click", callback);
    },
    onSkipTour(callback) {
      skipTourButton.addEventListener("click", callback);
    },
    startTour() {
      this.hideHint();
      moonWhisper.classList.remove("is-visible");
      tourGuide.classList.add("is-visible");
      tourGuide.setAttribute("aria-hidden", "false");
    },
    setTourMoment(text) {
      tourMoment.textContent = text;
    },
    finishTour() {
      tourGuide.classList.remove("is-visible");
      tourGuide.setAttribute("aria-hidden", "true");
      hint.classList.add("is-visible");
      hint.setAttribute("aria-hidden", "false");
      hintTimer = setTimeout(() => this.hideHint(), 6500);
      clearTimeout(moonTimer);
      moonTimer = setTimeout(() => {
        moonWhisper.classList.add("is-visible");
        moonWhisper.setAttribute("aria-hidden", "false");
        moonTimer = setTimeout(() => {
          moonWhisper.classList.remove("is-visible");
          moonWhisper.setAttribute("aria-hidden", "true");
        }, 6200);
      }, 1900);
    },
    hideHint() {
      clearTimeout(hintTimer);
      hint.classList.remove("is-visible");
      hint.setAttribute("aria-hidden", "true");
    },
    showPhrase(text) {
      clearTimeout(phraseTimer);
      phraseText.textContent = text;
      phraseCard.classList.add("is-visible");
      phraseCard.setAttribute("aria-hidden", "false");
      phraseTimer = setTimeout(() => {
        phraseCard.classList.remove("is-visible");
        phraseCard.setAttribute("aria-hidden", "true");
      }, 2600);
    },
    updateDiscovery(count, goal) {
      progress.textContent = `${count} de ${goal} mensajes descubiertos`;
      progress.classList.add("has-changed");
      clearTimeout(progressTimer);
      progressTimer = setTimeout(() => progress.classList.remove("has-changed"), 700);
    },
    openLetter(content, onClose) {
      this.hideHint();
      clearTimeout(moonTimer);
      moonWhisper.classList.remove("is-visible");
      letterEyebrow.textContent = content.eyebrow;
      letterTitle.textContent = content.title;
      letterBody.replaceChildren(...content.paragraphs.map((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
      }));
      letterSignature.textContent = content.signature;
      letterCloseCallback = onClose;
      letterDialog.showModal();
      closeLetterButton.focus();
    },
    showFinale() {
      this.hideHint();
      clearTimeout(moonTimer);
      moonWhisper.classList.remove("is-visible");
      phraseCard.classList.remove("is-visible");
      finaleMessage.classList.add("is-visible");
      finaleMessage.setAttribute("aria-hidden", "false");
    },
    completeFinale() {
      clearTimeout(finaleTimer);
      finaleTimer = setTimeout(() => {
        finaleMessage.classList.remove("is-visible");
        finaleMessage.setAttribute("aria-hidden", "true");
      }, 5200);
    },
    showError(message = "No se pudo crear el universo. Revisa tu conexión.") {
      loadingLabel.classList.remove("is-ready");
      loadingLabel.textContent = message;
    },
  };

  closeLetterButton.addEventListener("click", () => letterDialog.close());
  letterDialog.addEventListener("click", (event) => {
    if (event.target === letterDialog) letterDialog.close();
  });
  letterDialog.addEventListener("close", () => {
    const callback = letterCloseCallback;
    letterCloseCallback = null;
    callback?.();
  });
  return api;
}
