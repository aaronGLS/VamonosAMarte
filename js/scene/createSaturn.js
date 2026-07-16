import * as THREE from "three";
import { COLORS, PERFORMANCE } from "../config.js";
import { createPlanetTexture, createRingTexture, createSoftParticleTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

function createAtmosphere() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(COLORS.violet) },
      glowStrength: { value: 0.62 },
    },
    vertexShader: `
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      void main() {
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float glowStrength;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float rim = pow(1.0 - max(dot(vWorldNormal, viewDirection), 0.0), 2.35);
        gl_FragColor = vec4(glowColor, rim * glowStrength);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    transparent: true,
  });

  return new THREE.Mesh(new THREE.SphereGeometry(4.18, 64, 48), material);
}

function createRingDust(isMobile) {
  const random = createRandom(7142);
  const count = isMobile ? PERFORMANCE.mobileDust : PERFORMANCE.desktopDust;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = randomBetween(random, 5.15, 8.45);
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = randomBetween(random, -0.055, 0.055);
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: COLORS.gold,
    map: createSoftParticleTexture(),
    size: 0.075,
    opacity: 0.48,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

export function createSaturn(scene, { isMobile, reducedMotion }) {
  const system = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: createPlanetTexture(),
    metalness: 0.05,
    roughness: 0.74,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(4, 80, 56), bodyMaterial);
  const atmosphere = createAtmosphere();
  const ringMaterial = new THREE.MeshStandardMaterial({
    map: createRingTexture(),
    alphaTest: 0.025,
    opacity: 0.9,
    roughness: 0.68,
    metalness: 0.08,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
  const rings = new THREE.Mesh(new THREE.RingGeometry(5.2, 8.35, 256), ringMaterial);
  const ringDust = createRingDust(isMobile);

  rings.rotation.x = Math.PI / 2;
  system.rotation.z = -0.18;
  system.add(body, atmosphere, rings, ringDust);
  scene.add(system);

  return {
    group: system,
    update(delta) {
      const factor = reducedMotion ? 0.22 : 1;
      body.rotation.y += delta * 0.055 * factor;
      ringDust.rotation.y -= delta * 0.018 * factor;
      atmosphere.material.uniforms.glowStrength.value = 0.58 + Math.sin(performance.now() * 0.00045) * 0.055 * factor;
    },
  };
}
