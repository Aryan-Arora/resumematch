// Sequential in-process task queue so resume processing (parsing, embedding,
// scoring) runs after the HTTP response is sent instead of blocking it.
// Sequential on purpose — parallel embedding calls were tested and found
// slower on this WASM/CPU backend (see semanticSkillMatch.js notes).
const queue = [];
let running = false;

export function enqueue(task) {
  queue.push(task);
  drain();
}

async function drain() {
  if (running) return;
  running = true;
  while (queue.length > 0) {
    const task = queue.shift();
    try {
      await task();
    } catch (err) {
      console.error("Queued upload task failed:", err);
    }
  }
  running = false;
}
