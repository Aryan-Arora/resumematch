import { describe, it, expect, vi } from "vitest";
import { enqueue } from "./uploadQueue.js";

function waitFor(conditionFn, { timeout = 2000, interval = 10 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (conditionFn()) return resolve();
      if (Date.now() - start > timeout) return reject(new Error("waitFor timed out"));
      setTimeout(check, interval);
    };
    check();
  });
}

describe("uploadQueue", () => {
  it("runs enqueued tasks sequentially, never overlapping", async () => {
    const order = [];
    let active = 0;
    let maxActive = 0;

    function makeTask(id, delay) {
      return async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        order.push(`start:${id}`);
        await new Promise((r) => setTimeout(r, delay));
        order.push(`end:${id}`);
        active -= 1;
      };
    }

    enqueue(makeTask("a", 30));
    enqueue(makeTask("b", 10));
    enqueue(makeTask("c", 5));

    await waitFor(() => order.length === 6);

    expect(maxActive).toBe(1);
    expect(order).toEqual(["start:a", "end:a", "start:b", "end:b", "start:c", "end:c"]);
  });

  it("continues processing later tasks after an earlier task throws", async () => {
    const results = [];
    enqueue(async () => {
      throw new Error("boom");
    });
    enqueue(async () => {
      results.push("ran");
    });

    await waitFor(() => results.length === 1);
    expect(results).toEqual(["ran"]);
  });
});
