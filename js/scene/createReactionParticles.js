import * as THREE from "three";
import { COLORS } from "../config.js";
import { createSymbolTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

function createLayer(count, texture, color) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  const material = new THREE.PointsMaterial({
    map: texture,
    color,
    size: 0.32,
    opacity: 0,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return { points: new THREE.Points(geometry, material), positions, velocities, material };
}

function createBurst(scene, count, textures) {
  const group = new THREE.Group();
  const hearts = createLayer(Math.ceil(count * 0.55), textures.heart, 0xff83b5);
  const sparks = createLayer(Math.floor(count * 0.45), textures.star, COLORS.gold);
  group.visible = false;
  group.add(hearts.points, sparks.points);
  scene.add(group);
  return { group, layers: [hearts, sparks], active: false, age: 0, duration: 1.35 };
}

export function createReactionParticles(scene, { isMobile, reducedMotion }) {
  const random = createRandom(7732);
  const textures = {
    heart: createSymbolTexture("heart"),
    star: createSymbolTexture("star"),
  };
  const particleCount = isMobile ? 18 : 28;
  const bursts = Array.from({ length: isMobile ? 3 : 5 }, () => createBurst(scene, particleCount, textures));
  let cursor = 0;

  function resetLayer(layer) {
    for (let index = 0; index < layer.positions.length; index += 3) {
      const angle = random() * Math.PI * 2;
      const speed = reducedMotion ? 0.12 : randomBetween(random, 0.8, 2.25);
      layer.positions[index] = 0;
      layer.positions[index + 1] = 0;
      layer.positions[index + 2] = 0;
      layer.velocities[index] = Math.cos(angle) * speed;
      layer.velocities[index + 1] = Math.sin(angle) * speed + randomBetween(random, 0.25, 1.15);
      layer.velocities[index + 2] = randomBetween(random, -0.65, 0.65) * speed;
    }
    layer.points.geometry.attributes.position.needsUpdate = true;
  }

  return {
    burstAt(position) {
      const burst = bursts[cursor];
      cursor = (cursor + 1) % bursts.length;
      burst.group.position.copy(position);
      burst.group.visible = true;
      burst.active = true;
      burst.age = 0;
      burst.duration = reducedMotion ? 0.55 : 1.35;
      burst.layers.forEach(resetLayer);
    },
    update(delta) {
      bursts.forEach((burst) => {
        if (!burst.active) return;
        burst.age += delta;
        const progress = Math.min(burst.age / burst.duration, 1);

        burst.layers.forEach((layer, layerIndex) => {
          layer.material.opacity = Math.sin(progress * Math.PI) * (layerIndex ? 0.95 : 0.78);
          layer.material.size = (layerIndex ? 0.24 : 0.34) * (1 + progress * 0.28);
          for (let index = 0; index < layer.positions.length; index += 3) {
            layer.positions[index] += layer.velocities[index] * delta;
            layer.positions[index + 1] += layer.velocities[index + 1] * delta;
            layer.positions[index + 2] += layer.velocities[index + 2] * delta;
            layer.velocities[index + 1] -= delta * (reducedMotion ? 0 : 0.34);
          }
          layer.points.geometry.attributes.position.needsUpdate = true;
        });

        if (progress === 1) {
          burst.active = false;
          burst.group.visible = false;
        }
      });
    },
  };
}
