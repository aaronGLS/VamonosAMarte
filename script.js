import * as THREE from "three";
import { CAMERA, EXPERIENCE, PHRASES, SECRET_LETTER } from "./js/config.js";
import { createOrbitControls } from "./js/controls/createOrbitControls.js";
import { createSceneInteraction } from "./js/controls/createSceneInteraction.js";
import { createCinematicDirector } from "./js/experience/createCinematicDirector.js";
import { createDiscoveryTracker } from "./js/experience/createDiscoveryTracker.js";
import { createAmbientAudioHook } from "./js/integrations/createAmbientAudioHook.js";
import { createHeartConstellation } from "./js/scene/createHeartConstellation.js";
import { createMoons } from "./js/scene/createMoons.js";
import { createPhrases } from "./js/scene/createPhrases.js";
import { createReactionParticles } from "./js/scene/createReactionParticles.js";
import { createRenderer, warmUpRenderer } from "./js/scene/createRenderer.js";
import { createSaturn } from "./js/scene/createSaturn.js";
import { createShootingStars } from "./js/scene/createShootingStars.js";
import { createStars } from "./js/scene/createStars.js";
import { createWorld } from "./js/scene/createWorld.js";
import { createInterface } from "./js/ui/createInterface.js";

const sceneContainer = document.querySelector("#scene");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = matchMedia("(max-width: 680px), (pointer: coarse)").matches;
const options = { isMobile, reducedMotion };
const ui = createInterface();

try {
  const renderer = createRenderer(sceneContainer);
  const scene = createWorld();
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 140);
  const clock = new THREE.Clock();
  const center = new THREE.Vector3();
  const tracker = createDiscoveryTracker(PHRASES.length, EXPERIENCE.discoveryGoal);
  const audio = createAmbientAudioHook(
    document.querySelector("#ambient-audio"),
    document.querySelector("#audio-toggle"),
  );
  let animationFrame = 0;
  let prepared = false;
  let interaction;
  let currentPhase = "idle";
  let pendingFinale = false;
  let letterOpen = false;

  const portrait = camera.aspect < 0.8;
  camera.fov = portrait ? 60 : 48;
  camera.position.set(...(portrait ? CAMERA.portraitStart : CAMERA.start));
  camera.updateProjectionMatrix();
  camera.lookAt(center);

  const stars = createStars(scene, options);
  const saturn = createSaturn(scene, options);
  const moons = createMoons(scene, options);
  const shootingStars = createShootingStars(scene, options);
  const phrases = createPhrases(scene, camera, options);
  const reactions = createReactionParticles(scene, options);
  const heart = createHeartConstellation(scene, options);
  const orbit = createOrbitControls(camera, renderer.domElement, {
    reducedMotion,
    onInteract: () => ui.hideHint(),
  });

  const director = createCinematicDirector(camera, {
    reducedMotion,
    onPhaseChange(nextPhase) {
      const previousPhase = currentPhase;
      currentPhase = nextPhase;

      if (nextPhase === "tour") {
        orbit.suspend();
        interaction?.setEnabled(false);
        ui.startTour();
      }
      if (nextPhase === "finale") {
        orbit.suspend();
        interaction?.setEnabled(false);
        phrases.setDimmed(true);
        heart.start();
        ui.hideHint();
        setTimeout(() => {
          if (currentPhase === "finale") ui.showFinale();
        }, reducedMotion ? 50 : 2200);
      }
      if (nextPhase === "exploration") {
        orbit.activate();
        interaction?.setEnabled(true);
        if (previousPhase === "tour") ui.finishTour();
        if (previousPhase === "finale") phrases.setDimmed(false);
      }
    },
    onTourMoment: (text) => ui.setTourMoment(text),
    onFinaleComplete() {
      pendingFinale = false;
      heart.fadeOut(performance.now(), 3500);
      ui.completeFinale();
    },
  });

  function selectPhrase(sprite) {
    if (currentPhase !== "exploration" || pendingFinale || letterOpen) return;
    const selection = phrases.select(sprite);
    if (!selection) return;

    reactions.burstAt(selection.position);
    ui.hideHint();
    ui.showPhrase(selection.text);
    const discovery = tracker.discover(selection.index);
    ui.updateDiscovery(discovery.count, EXPERIENCE.discoveryGoal);

    if (discovery.reachedGoal) {
      pendingFinale = true;
      interaction.setEnabled(false);
      setTimeout(() => director.startFinale(), 1250);
    }
  }

  function openSecretLetter() {
    if (currentPhase !== "exploration" || pendingFinale) return;
    letterOpen = true;
    orbit.suspend();
    interaction.setEnabled(false);
    ui.openLetter(SECRET_LETTER, () => {
      letterOpen = false;
      if (currentPhase === "exploration" && !pendingFinale) {
        orbit.activate();
        interaction.setEnabled(true);
      }
    });
  }

  interaction = createSceneInteraction(renderer.domElement, camera, {
    phraseTargets: phrases.sprites,
    moonTargets: moons.interactiveTargets,
    onPhrase: selectPhrase,
    onMoon: openSecretLetter,
  });

  function animate() {
    const now = performance.now();
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    director.update(now);
    stars.update(elapsed);
    saturn.update(delta);
    moons.update(elapsed);
    shootingStars.update(delta, elapsed);
    phrases.update(elapsed);
    reactions.update(delta);
    heart.update(now);
    orbit.update();
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = camera.aspect < 0.8 ? 60 : 48;
    if (currentPhase === "idle") {
      camera.position.set(...(camera.aspect < 0.8 ? CAMERA.portraitStart : CAMERA.start));
      camera.lookAt(center);
    }
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    renderer.setSize(innerWidth, innerHeight);
  }

  addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (prepared && !animationFrame) {
      clock.getDelta();
      animate();
    }
  });

  ui.onStart(() => {
    audio.playFromGesture();
    director.start();
  });
  ui.onSkipTour(() => director.skipTour());
  ui.onReset(() => {
    if (currentPhase === "exploration" && !letterOpen) orbit.reset();
  });
  ui.updateDiscovery(0, EXPERIENCE.discoveryGoal);

  async function prepareExperience() {
    try {
      await warmUpRenderer(renderer, scene, camera);
      prepared = true;
      if (!document.hidden) animate();
      requestAnimationFrame(() => ui.setReady());
    } catch (error) {
      console.error("No se pudo preparar WebGL:", error);
      ui.showError("No se pudo preparar el universo. Recarga la página.");
    }
  }

  prepareExperience();
} catch (error) {
  console.error("No se pudo iniciar la experiencia 3D:", error);
  ui.showError();
}
