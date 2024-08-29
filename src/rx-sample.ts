import { createEffect, createStore, EventCallable, sample } from "effector";
import { Observable, Subscription } from "rxjs";

type Input<D, S, U> = {
  source: Observable<D>;
  subscribeOn: EventCallable<S>;
  unsubscribeOn: EventCallable<U>;
  target: EventCallable<D> | EventCallable<void>;
};

export const rxSample = <D, S, U>({
  source,
  subscribeOn,
  unsubscribeOn,
  target,
}: Input<D, S, U>) => {
  const $subscription = createStore<Subscription | null>(null);

  const subscribeFx = createEffect<S, Subscription>(() =>
    source.subscribe(target as EventCallable<D>)
  );

  const unsubscribeFx = createEffect<Subscription, void>((subscription) => {
    subscription.unsubscribe();
  });

  sample({
    clock: subscribeOn,
    target: subscribeFx,
  });

  sample({
    clock: subscribeFx.doneData,
    target: $subscription,
  });

  sample({
    clock: unsubscribeOn,
    source: $subscription,
    filter: (sub): sub is Subscription => Boolean(sub),
    target: unsubscribeFx,
  });
};
