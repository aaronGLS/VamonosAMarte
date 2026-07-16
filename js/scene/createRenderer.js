import * as THREE from "three";
import { PERFORMANCE } from "../config.js";

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: !matchMedia("(max-width: 680px)").matches,
    alpha: false,
    powerPreference: "high-performance",
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x05050e, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, PERFORMANCE.maxPixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  container.append(renderer.domElement);

  return renderer;
}

export async function warmUpRenderer(renderer, scene, camera) {
  await renderer.compileAsync(scene, camera);
  renderer.render(scene, camera);
  renderer.getContext().finish();
  await new Promise((resolve) => requestAnimationFrame(resolve));
}
