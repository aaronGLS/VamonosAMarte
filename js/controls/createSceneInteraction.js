import * as THREE from "three";

export function createSceneInteraction(canvas, camera, {
  phraseTargets,
  moonTargets,
  onPhrase,
  onMoon,
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const start = new THREE.Vector2();
  const targets = [...phraseTargets, ...moonTargets];
  const activePointers = new Set();
  let primaryPointer = null;
  let enabled = false;
  let cancelled = false;

  function pick(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(targets, false)[0]?.object ?? null;
  }

  canvas.addEventListener("pointerdown", (event) => {
    activePointers.add(event.pointerId);
    if (!enabled) return;
    if (primaryPointer === null) {
      primaryPointer = event.pointerId;
      start.set(event.clientX, event.clientY);
      cancelled = false;
    }
    if (activePointers.size > 1) cancelled = true;
  });

  canvas.addEventListener("pointerup", (event) => {
    activePointers.delete(event.pointerId);
    if (!enabled || event.pointerId !== primaryPointer) return;

    const distance = start.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
    primaryPointer = null;
    if (cancelled || distance > 8) return;

    const target = pick(event);
    if (!target) return;
    if (target.userData.interactionType === "secret-moon") onMoon();
    else onPhrase(target);
  });

  canvas.addEventListener("pointercancel", (event) => {
    activePointers.delete(event.pointerId);
    if (event.pointerId === primaryPointer) primaryPointer = null;
    cancelled = true;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!enabled || event.pointerType !== "mouse" || event.buttons) return;
    canvas.classList.toggle("is-pointing", Boolean(pick(event)));
  });
  canvas.addEventListener("pointerleave", () => canvas.classList.remove("is-pointing"));

  return {
    setEnabled(value) {
      enabled = value;
      if (!value) {
        canvas.classList.remove("is-pointing");
        activePointers.clear();
        primaryPointer = null;
        cancelled = true;
      }
    },
  };
}
