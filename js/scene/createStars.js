import * as THREE from "three";
import { COLORS, PERFORMANCE } from "../config.js";
import { createNebulaTexture, createSoftParticleTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

function createStarLayer(count, radiusRange, size, seed) {
  const random = createRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(0xffffff), new THREE.Color(0xcbb8ff), new THREE.Color(0xffe4ba), new THREE.Color(0x9ebfff)];

  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = randomBetween(random, radiusRange[0], radiusRange[1]);
    const color = palette[Math.floor(random() * palette.length)];
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    map: createSoftParticleTexture(),
    size,
    opacity: 0.86,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

function createNebulas(scene) {
  const texture = createNebulaTexture();
  const definitions = [
    { position: [-22, 13, -38], scale: 32, color: COLORS.violet, opacity: 0.13 },
    { position: [27, -10, -46], scale: 42, color: COLORS.blue, opacity: 0.08 },
    { position: [5, 25, -54], scale: 30, color: 0xc37bc4, opacity: 0.07 },
  ];

  return definitions.map((definition) => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: definition.color,
      opacity: definition.opacity,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(...definition.position);
    sprite.scale.setScalar(definition.scale);
    scene.add(sprite);
    return sprite;
  });
}

export function createStars(scene, { isMobile, reducedMotion }) {
  const count = isMobile ? PERFORMANCE.mobileStars : PERFORMANCE.desktopStars;
  const farLayer = createStarLayer(Math.floor(count * 0.72), [34, 78], isMobile ? 0.28 : 0.23, 3381);
  const nearLayer = createStarLayer(Math.floor(count * 0.28), [22, 44], isMobile ? 0.18 : 0.14, 9128);
  const nebulas = createNebulas(scene);
  scene.add(farLayer, nearLayer);

  return {
    update(elapsed) {
      const factor = reducedMotion ? 0.15 : 1;
      farLayer.rotation.y = elapsed * 0.0014 * factor;
      nearLayer.rotation.y = -elapsed * 0.0028 * factor;
      farLayer.material.opacity = 0.82 + Math.sin(elapsed * 0.7) * 0.06 * factor;
      nearLayer.material.opacity = 0.72 + Math.sin(elapsed * 1.15 + 1) * 0.1 * factor;
      nebulas.forEach((nebula, index) => {
        nebula.material.opacity += (0.08 + Math.sin(elapsed * 0.18 + index) * 0.018 - nebula.material.opacity) * 0.02;
      });
    },
  };
}
