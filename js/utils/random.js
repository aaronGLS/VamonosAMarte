export function createRandom(seed = 123456) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function randomBetween(random, minimum, maximum) {
  return minimum + (maximum - minimum) * random();
}
