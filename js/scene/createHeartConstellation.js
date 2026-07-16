import * as THREE from "three";
import { createSoftParticleTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

const easeOut = (value) => 1 - Math.pow(1 - value, 4);

export function createHeartConstellation(scene, { isMobile, reducedMotion }) {
  const random = createRandom(2414);
  const count = isMobile ? 130 : 230;
  const positions = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const gold = new THREE.Color(0xffdca2);
  const rose = new THREE.Color(0xff8fbd);
  const geometry = new THREE.BufferGeometry();

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    const fill = index % 4 === 0 ? randomBetween(random, 0.4, 0.92) : randomBetween(random, 0.9, 1.04);
    const x = 16 * Math.pow(Math.sin(angle), 3) * 0.32 * fill;
    const y = (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * 0.32 * fill;
    const color = index % 3 === 0 ? rose : gold;

    targets[index * 3] = x;
    targets[index * 3 + 1] = y + 0.55;
    targets[index * 3 + 2] = 4.8 + randomBetween(random, -0.22, 0.22);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: createSoftParticleTexture(),
    size: isMobile ? 0.22 : 0.18,
    opacity: 0,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const heart = new THREE.Points(geometry, material);
  heart.visible = false;
  heart.renderOrder = 12;
  scene.add(heart);
  let startedAt = 0;
  let active = false;
  let fadeStartedAt = 0;
  let fadeDelay = 0;

  function scatterOrigins() {
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      origins[offset] = targets[offset] + randomBetween(random, -13, 13);
      origins[offset + 1] = targets[offset + 1] + randomBetween(random, -9, 9);
      origins[offset + 2] = targets[offset + 2] + randomBetween(random, -8, 4);
      positions[offset] = origins[offset];
      positions[offset + 1] = origins[offset + 1];
      positions[offset + 2] = origins[offset + 2];
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return {
    start(now = performance.now()) {
      scatterOrigins();
      startedAt = now;
      active = true;
      fadeStartedAt = 0;
      heart.visible = true;
    },
    update(now = performance.now()) {
      if (!heart.visible) return;
      const duration = reducedMotion ? 1 : 3900;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = easeOut(progress);

      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        const shimmer = progress === 1 ? Math.sin(now * 0.0025 + index) * 0.018 : 0;
        positions[offset] = THREE.MathUtils.lerp(origins[offset], targets[offset], eased) + shimmer;
        positions[offset + 1] = THREE.MathUtils.lerp(origins[offset + 1], targets[offset + 1], eased) + shimmer;
        positions[offset + 2] = THREE.MathUtils.lerp(origins[offset + 2], targets[offset + 2], eased);
      }
      const fadeProgress = fadeStartedAt
        ? THREE.MathUtils.clamp((now - fadeStartedAt - fadeDelay) / 1700, 0, 1)
        : 0;
      material.opacity = Math.min(progress * 3, 1) * (0.86 + Math.sin(now * 0.0018) * 0.09) * (1 - fadeProgress);
      geometry.attributes.position.needsUpdate = true;
      if (progress === 1) active = false;
      if (fadeProgress === 1) heart.visible = false;
    },
    fadeOut(now = performance.now(), delay = 0) {
      fadeStartedAt = now;
      fadeDelay = delay;
    },
    isActive() {
      return active;
    },
  };
}
