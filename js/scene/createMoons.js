import * as THREE from "three";
import { COLORS } from "../config.js";
import { createSoftParticleTexture } from "../utils/textures.js";

function createMoon(radius, color, isSecret = false) {
  const moon = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 3),
    new THREE.MeshStandardMaterial({ color, roughness: 0.93, metalness: 0.02 }),
  );
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: createSoftParticleTexture(),
    color: isSecret ? COLORS.gold : color,
    opacity: isSecret ? 0.46 : 0.2,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  glow.scale.setScalar(radius * 4.2);
  moon.add(glow);

  let hitTarget = null;
  if (isSecret) {
    hitTarget = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 2.4, 16, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitTarget.userData.interactionType = "secret-moon";
    moon.add(hitTarget);
    moon.userData.glow = glow;
  }
  return { moon, hitTarget };
}

export function createMoons(scene, { reducedMotion }) {
  const { moon: first, hitTarget } = createMoon(0.36, COLORS.moon, true);
  const { moon: second } = createMoon(0.22, 0xc8a9dc);
  scene.add(first, second);

  return {
    update(elapsed) {
      const factor = reducedMotion ? 0.25 : 1;
      const firstAngle = elapsed * 0.14 * factor + 0.8;
      const secondAngle = -elapsed * 0.19 * factor + 2.5;
      first.position.set(Math.cos(firstAngle) * 9.4, Math.sin(firstAngle * 0.62) * 2.2, Math.sin(firstAngle) * 7.6);
      second.position.set(Math.cos(secondAngle) * 11.4, Math.sin(secondAngle * 0.76) * 3.5, Math.sin(secondAngle) * 9.2);
      first.rotation.y += 0.004 * factor;
      second.rotation.y -= 0.005 * factor;
      first.userData.glow.material.opacity = 0.4 + Math.sin(elapsed * 2.1) * 0.1;
    },
    interactiveTargets: [hitTarget],
    secretMoon: first,
  };
}
