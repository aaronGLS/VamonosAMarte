import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CAMERA } from "../config.js";

export function createOrbitControls(camera, canvas, { reducedMotion, onInteract }) {
  const controls = new OrbitControls(camera, canvas);
  const home = new THREE.Vector3(...CAMERA.home);
  const center = new THREE.Vector3();
  let lastInteraction = performance.now();
  let returningHome = false;

  controls.enabled = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.rotateSpeed = 0.48;
  controls.zoomSpeed = 0.72;
  controls.minDistance = CAMERA.minDistance;
  controls.maxDistance = CAMERA.maxDistance;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI - 0.25;
  controls.autoRotateSpeed = 0.32;

  controls.addEventListener("start", () => {
    returningHome = false;
    controls.autoRotate = false;
    lastInteraction = performance.now();
    onInteract();
  });
  controls.addEventListener("end", () => {
    lastInteraction = performance.now();
  });

  return {
    controls,
    activate() {
      controls.enabled = true;
      lastInteraction = performance.now();
    },
    suspend() {
      controls.enabled = false;
      controls.autoRotate = false;
      returningHome = false;
    },
    reset() {
      returningHome = true;
      controls.autoRotate = false;
      lastInteraction = performance.now();
    },
    update() {
      if (!controls.enabled) return;

      if (returningHome) {
        camera.position.lerp(home, 0.075);
        controls.target.lerp(center, 0.075);
        if (camera.position.distanceTo(home) < 0.03) {
          camera.position.copy(home);
          controls.target.copy(center);
          returningHome = false;
        }
      }

      if (!reducedMotion && performance.now() - lastInteraction > 7500 && !returningHome) {
        controls.autoRotate = true;
      }
      controls.update();
    },
    isEnabled() {
      return controls.enabled;
    },
  };
}
