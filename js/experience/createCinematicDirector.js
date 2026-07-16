import * as THREE from "three";
import { CAMERA, EXPERIENCE } from "../config.js";

const easeInOut = (value) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2;

export function createCinematicDirector(camera, {
  reducedMotion,
  onPhaseChange,
  onTourMoment,
  onFinaleComplete,
}) {
  const positions = EXPERIENCE.tourPositions.map((point) => new THREE.Vector3(...point));
  const targets = EXPERIENCE.tourTargets.map((point) => new THREE.Vector3(...point));
  const positionCurve = new THREE.CatmullRomCurve3(positions, false, "catmullrom", 0.55);
  const targetCurve = new THREE.CatmullRomCurve3(targets, false, "catmullrom", 0.55);
  const finaleCamera = new THREE.Vector3(...EXPERIENCE.finaleCamera);
  const home = new THREE.Vector3(...CAMERA.home);
  const start = new THREE.Vector3(...CAMERA.start);
  const center = new THREE.Vector3();
  const finaleOrigin = new THREE.Vector3();
  let phase = "idle";
  let phaseStartedAt = 0;
  let lastMoment = "";

  function setPhase(nextPhase, now) {
    phase = nextPhase;
    phaseStartedAt = now;
    onPhaseChange(nextPhase);
  }

  function finishTour(now) {
    camera.position.copy(home);
    camera.lookAt(center);
    setPhase("exploration", now);
  }

  function updateTour(now) {
    const duration = reducedMotion ? 700 : EXPERIENCE.tourDuration;
    const progress = Math.min((now - phaseStartedAt) / duration, 1);
    const eased = easeInOut(progress);

    if (reducedMotion) {
      camera.position.lerpVectors(start, home, eased);
      camera.lookAt(center);
    } else {
      camera.position.copy(positionCurve.getPoint(eased));
      camera.lookAt(targetCurve.getPoint(eased));
    }

    const moment = progress < 0.24
      ? "Acercándonos a nuestro pequeño universo"
      : progress < 0.49
        ? "Los anillos guardan cada recuerdo"
        : progress < 0.74
          ? "Una luna conserva un secreto para ti"
          : "Hay palabras bonitas esperando ser descubiertas";

    if (moment !== lastMoment) {
      lastMoment = moment;
      onTourMoment(moment);
    }
    if (progress === 1) finishTour(now);
  }

  function updateFinale(now) {
    const duration = reducedMotion ? 700 : EXPERIENCE.finaleDuration;
    const progress = Math.min((now - phaseStartedAt) / duration, 1);
    camera.position.lerpVectors(finaleOrigin, finaleCamera, easeInOut(Math.min(progress * 1.5, 1)));
    camera.lookAt(center);

    if (progress === 1) {
      setPhase("exploration", now);
      onFinaleComplete();
    }
  }

  return {
    start(now = performance.now()) {
      lastMoment = "";
      setPhase("tour", now);
    },
    skipTour(now = performance.now()) {
      if (phase === "tour") finishTour(now);
    },
    startFinale(now = performance.now()) {
      if (phase !== "exploration") return false;
      finaleOrigin.copy(camera.position);
      setPhase("finale", now);
      return true;
    },
    update(now = performance.now()) {
      if (phase === "tour") updateTour(now);
      if (phase === "finale") updateFinale(now);
    },
    getPhase() {
      return phase;
    },
  };
}
