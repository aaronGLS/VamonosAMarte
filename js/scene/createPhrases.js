import * as THREE from "three";
import { ORBIT_BANDS, PHRASES } from "../config.js";
import { createPhraseTexture } from "../utils/textures.js";
import { createRandom, randomBetween } from "../utils/random.js";

const worldPosition = new THREE.Vector3();

function createPhraseSprite(text, index, random) {
  const { texture, aspect } = createPhraseTexture(text);
  const material = new THREE.SpriteMaterial({
    map: texture,
    opacity: 0.88,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);

  sprite.renderOrder = 4;
  sprite.userData = {
    text,
    index,
    aspect,
    phase: 0,
    wavePhase: random() * Math.PI * 2,
    waveFrequency: randomBetween(random, 0.72, 1.35),
    selectedUntil: 0,
  };
  return sprite;
}

export function createPhrases(scene, camera, { isMobile, reducedMotion }) {
  const random = createRandom(1989);
  const bands = ORBIT_BANDS.map((definition) => {
    const group = new THREE.Group();
    group.rotation.set(definition.tiltX, 0, definition.tiltZ);
    scene.add(group);
    return { definition, group, sprites: [] };
  });
  const sprites = PHRASES.map((text, index) => {
    const band = bands[index % bands.length];
    const sprite = createPhraseSprite(text, index, random);
    const placeInBand = Math.floor(index / bands.length);
    const bandCount = Math.ceil(PHRASES.length / bands.length);

    sprite.userData.phase = (placeInBand / bandCount) * Math.PI * 2 + randomBetween(random, -0.12, 0.12);
    band.sprites.push(sprite);
    band.group.add(sprite);
    return sprite;
  });

  function select(sprite) {
    if (!sprite) return null;
    sprite.userData.selectedUntil = performance.now() + 2400;
    return {
      index: sprite.userData.index,
      text: sprite.userData.text,
      position: sprite.getWorldPosition(new THREE.Vector3()),
    };
  }

  let dimmed = false;

  function update(elapsed) {
    const movement = reducedMotion ? 0.22 : 1;
    const now = performance.now();

    bands.forEach(({ definition, sprites: bandSprites }) => {
      bandSprites.forEach((sprite) => {
        const data = sprite.userData;
        const angle = data.phase + elapsed * definition.speed * movement;
        const radiusVariation = Math.sin(angle * 2.1 + data.wavePhase) * 0.16;
        const radius = definition.radius + radiusVariation;
        const selected = data.selectedUntil > now;

        sprite.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * data.waveFrequency + data.wavePhase) * definition.wave,
          Math.sin(angle) * radius * definition.depth,
        );
        sprite.getWorldPosition(worldPosition);

        const distance = camera.position.distanceTo(worldPosition);
        const height = THREE.MathUtils.clamp(distance * 0.041, 0.58, 1.08) * (isMobile ? 0.93 : 1);
        const pulse = selected ? 1.18 + Math.sin(now * 0.012) * 0.04 : 1;
        sprite.scale.set(height * data.aspect * pulse, height * pulse, 1);
        const normalOpacity = selected ? 1 : THREE.MathUtils.clamp(1.08 - distance / 62, 0.55, 0.9);
        sprite.material.opacity = normalOpacity * (dimmed ? 0.18 : 1);
        sprite.material.color.setHex(selected ? 0xffefc9 : 0xffffff);
      });
    });
  }

  return {
    sprites,
    select,
    update,
    setDimmed(value) {
      dimmed = value;
    },
  };
}
