import * as THREE from "three";
import { COLORS } from "../config.js";
import { createSoftParticleTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

export function createShootingStars(scene, { reducedMotion }) {
  const random = createRandom(5219);
  const material = new THREE.SpriteMaterial({
    map: createSoftParticleTexture(),
    color: COLORS.lavender,
    opacity: 0,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    rotation: -0.65,
  });
  const star = new THREE.Sprite(material);
  let age = 0;
  let nextAppearance = reducedMotion ? Infinity : 5.5;
  let duration = 0.9;
  const direction = new THREE.Vector3();

  star.scale.set(5.8, 0.12, 1);
  scene.add(star);

  function launch() {
    star.position.set(randomBetween(random, -18, 8), randomBetween(random, 8, 17), randomBetween(random, -18, -7));
    direction.set(randomBetween(random, 9, 14), randomBetween(random, -6, -3), 0);
    duration = randomBetween(random, 0.65, 1.05);
    age = 0;
  }

  return {
    update(delta, elapsed) {
      if (elapsed < nextAppearance || reducedMotion) return;
      if (age === 0) launch();
      age += delta;
      star.position.addScaledVector(direction, delta);
      const progress = age / duration;
      star.material.opacity = Math.sin(Math.min(progress, 1) * Math.PI) * 0.52;
      if (progress >= 1) {
        star.material.opacity = 0;
        age = 0;
        nextAppearance = elapsed + randomBetween(random, 7, 14);
      }
    },
  };
}
