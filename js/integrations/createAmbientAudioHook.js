function hasAudioSource(audio) {
  return Boolean(audio.getAttribute("src") || audio.querySelector("source[src]"));
}

export function createAmbientAudioHook(audio, toggleButton) {
  const available = hasAudioSource(audio);
  let playing = false;

  toggleButton.hidden = !available;
  toggleButton.disabled = !available;

  function reflectState() {
    toggleButton.classList.toggle("is-playing", playing);
    toggleButton.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    toggleButton.setAttribute("title", playing ? "Pausar música" : "Reproducir música");
  }

  async function play() {
    if (!available) return;
    audio.volume = 0.34;
    try {
      await audio.play();
      playing = true;
      reflectState();
    } catch (error) {
      playing = false;
      reflectState();
      console.warn("La música no pudo reproducirse:", error);
    }
  }

  toggleButton.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      playing = false;
      reflectState();
    } else {
      play();
    }
  });
  audio.addEventListener("ended", () => {
    playing = false;
    reflectState();
  });
  audio.addEventListener("error", () => {
    playing = false;
    toggleButton.classList.add("has-error");
    toggleButton.setAttribute("aria-label", "Añade el archivo musica.mp3");
    toggleButton.setAttribute("title", "Añade assets/audio/musica.mp3");
  }, true);
  reflectState();

  return { playFromGesture: play };
}
