import {
  createEffect,
  createStore,
  EventCallable,
  is,
  sample,
  Store,
} from "effector";
import { Observable, Subscription } from "rxjs";

type Input<D, S, U> = {
  source: Observable<D>;
  subscribeOn: EventCallable<S>;
  unsubscribeOn: EventCallable<U>;
  target: EventCallable<D> | EventCallable<void>;
};

type InputWithStore<D, S, U> = {
  source: Store<Observable<D>>;
  subscribeOn: EventCallable<S>;
  unsubscribeOn: EventCallable<U>;
  target: EventCallable<D> | EventCallable<void>;
};

export function rxSample<D, S, U>(config: Input<D, S, U>): void;
export function rxSample<D, S, U>(config: InputWithStore<D, S, U>): void;

export function rxSample<D, S, U>({
  source,
  subscribeOn,
  unsubscribeOn,
  target,
}: Input<D, S, U> | InputWithStore<D, S, U>) {
  const $subscription = createStore<Subscription | null>(null);

  const subscribeFx = createEffect<S, Subscription>(() => {
    const observable = is.store(source) ? source.getState() : source;
    return observable.subscribe(target as EventCallable<D>);
  });

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
}
