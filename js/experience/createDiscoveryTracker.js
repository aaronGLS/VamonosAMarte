export function createDiscoveryTracker(total, goal) {
  const discovered = new Set();
  let finaleTriggered = false;

  return {
    discover(index) {
      const wasKnown = discovered.has(index);
      discovered.add(index);
      const count = discovered.size;
      const reachedGoal = !finaleTriggered && count >= goal;

      if (reachedGoal) finaleTriggered = true;
      return { count, total, isNew: !wasKnown, reachedGoal };
    },
    getProgress() {
      return { count: discovered.size, total, goal };
    },
  };
}
