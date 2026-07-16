import * as THREE from "three";
import { createRandom, randomBetween } from "./random.js";

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function textureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createPlanetTexture() {
  const canvas = createCanvas(1024, 512);
  const context = canvas.getContext("2d");
  const random = createRandom(90210);
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);

  gradient.addColorStop(0, "#342458");
  gradient.addColorStop(0.18, "#9a78a4");
  gradient.addColorStop(0.38, "#d1ac8f");
  gradient.addColorStop(0.56, "#6c538a");
  gradient.addColorStop(0.73, "#c49a87");
  gradient.addColorStop(1, "#251b4c");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const bandColors = ["#ecd2b1", "#806198", "#b98987", "#644b83", "#d9b49b"];
  for (let index = 0; index < 84; index += 1) {
    const y = randomBetween(random, 0, canvas.height);
    const height = randomBetween(random, 1, 10);
    const alpha = randomBetween(random, 0.025, 0.13);
    context.globalAlpha = alpha;
    context.fillStyle = bandColors[Math.floor(random() * bandColors.length)];
    context.fillRect(0, y, canvas.width, height);
  }

  context.globalAlpha = 0.16;
  for (let index = 0; index < 30; index += 1) {
    const y = randomBetween(random, 8, canvas.height - 8);
    const offset = randomBetween(random, -100, 100);
    context.strokeStyle = index % 2 ? "#fff1df" : "#2e2054";
    context.lineWidth = randomBetween(random, 0.5, 2.2);
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(270, y + offset * 0.08, 720, y - offset * 0.07, 1024, y);
    context.stroke();
  }

  context.globalAlpha = 1;
  const texture = textureFromCanvas(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function createRingTexture() {
  const canvas = createCanvas(1024, 1024);
  const context = canvas.getContext("2d");
  const random = createRandom(4815);
  const center = canvas.width / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let radius = 316; radius <= 505; radius += randomBetween(random, 1.3, 4.8)) {
    const warmth = Math.floor(randomBetween(random, 184, 240));
    const violet = Math.floor(randomBetween(random, 174, 225));
    const alpha = randomBetween(random, 0.08, 0.52);
    context.strokeStyle = `rgba(${warmth}, ${violet}, 235, ${alpha})`;
    context.lineWidth = randomBetween(random, 0.8, 4.2);
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();
  }

  const texture = textureFromCanvas(canvas);
  texture.center.set(0.5, 0.5);
  return texture;
}

export function createSoftParticleTexture() {
  const canvas = createCanvas(128, 128);
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.12, "rgba(255,248,226,0.95)");
  gradient.addColorStop(0.35, "rgba(187,159,255,0.35)");
  gradient.addColorStop(1, "rgba(120,86,210,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return textureFromCanvas(canvas);
}

export function createNebulaTexture() {
  const canvas = createCanvas(256, 256);
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);

  gradient.addColorStop(0, "rgba(255,255,255,0.48)");
  gradient.addColorStop(0.22, "rgba(201,174,255,0.2)");
  gradient.addColorStop(0.62, "rgba(105,74,188,0.07)");
  gradient.addColorStop(1, "rgba(44,20,95,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return textureFromCanvas(canvas);
}

export function createPhraseTexture(text) {
  const measuringCanvas = createCanvas(1, 1);
  const measuringContext = measuringCanvas.getContext("2d");
  const font = '500 72px Georgia, "Times New Roman", "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  measuringContext.font = font;

  const measuredWidth = measuringContext.measureText(text).width;
  const width = Math.min(1900, Math.max(640, Math.ceil(measuredWidth + 190)));
  const height = 220;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  const textGradient = context.createLinearGradient(0, 0, width, 0);

  textGradient.addColorStop(0, "#dfd2fa");
  textGradient.addColorStop(0.5, "#fff8e8");
  textGradient.addColorStop(1, "#d9c6ff");
  context.clearRect(0, 0, width, height);
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(137, 94, 235, 0.95)";
  context.shadowBlur = 30;
  context.fillStyle = textGradient;
  context.fillText(text, width / 2, height / 2);
  context.shadowBlur = 6;
  context.fillText(text, width / 2, height / 2);

  const texture = textureFromCanvas(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;

  return {
    texture,
    aspect: width / height,
  };
}

export function createSymbolTexture(symbol) {
  const canvas = createCanvas(128, 128);
  const context = canvas.getContext("2d");
  context.translate(64, 64);
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(255, 221, 170, 0.9)";
  context.shadowBlur = 18;
  context.beginPath();

  if (symbol === "heart") {
    context.moveTo(0, 42);
    context.bezierCurveTo(-8, 28, -46, 8, -46, -18);
    context.bezierCurveTo(-46, -48, -10, -55, 0, -30);
    context.bezierCurveTo(10, -55, 46, -48, 46, -18);
    context.bezierCurveTo(46, 8, 8, 28, 0, 42);
  } else {
    for (let index = 0; index < 8; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI / 4;
      const radius = index % 2 === 0 ? 48 : 13;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  context.fill();
  return textureFromCanvas(canvas);
}
