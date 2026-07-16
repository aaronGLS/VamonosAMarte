import * as THREE from "three";
import { COLORS } from "../config.js";

export function createWorld() {
  const scene = new THREE.Scene();
  const ambient = new THREE.AmbientLight(0x6f5d91, 0.72);
  const keyLight = new THREE.DirectionalLight(0xffdfad, 3.5);
  const rimLight = new THREE.PointLight(COLORS.violet, 28, 42, 1.6);
  const blueLight = new THREE.PointLight(COLORS.blue, 18, 34, 1.7);

  keyLight.position.set(-9, 6, 11);
  rimLight.position.set(8, 1, -8);
  blueLight.position.set(-8, -5, -5);
  scene.add(ambient, keyLight, rimLight, blueLight);

  return scene;
}
