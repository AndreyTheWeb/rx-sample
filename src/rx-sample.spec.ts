import { allSettled, createEvent, EventCallable, fork } from "effector";
import { Subject } from "rxjs";
import { describe, test, expect, vi } from "vitest";

import { rxSample } from "./rx-sample";

describe("rxSample", () => {
  test("Should subscribe to observable", async () => {
    const mockChannel = new Subject();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = vi.fn();

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe as unknown as EventCallable<void>,
      target: target as unknown as EventCallable<void>,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    expect(target).toHaveBeenCalledWith("test");
    expect(mockChannel.observed).toBeTruthy();
  });

  test("Should unsubscribe from observable", async () => {
    const mockChannel = new Subject();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = vi.fn();

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target as unknown as EventCallable<void>,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    await allSettled(unsubscribe, { scope });

    expect(mockChannel.observed).toBeFalsy();
  });
});
