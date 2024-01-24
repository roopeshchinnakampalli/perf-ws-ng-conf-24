# Side Effects & Subscription Handling

# Goal

The goal of this exercise is to learn how to efficiently unsubscribe from open subscriptions in your components.
Furthermore, if you pay attention, you'll notice that some of those subscriptions are actually not needed and break
the reactive flow. They are implemented as side-effects, even though should be pure reactive state.

## Subscription Handling

We have created a lot of manual subscriptions in our component without even thinking about cleaning them up.
As a final part of this exercise, we want to ensure that we don't have any leftover subscriptions that could
potentially lead to memory leaks or other unwanted behavior.

Typically, this was handled with a `private readonly destroy$ = new Subject<void>();`.

Luckily, angular now exposes a `takeUntilDestroyed` operator from the `@angular/core/rxjs-interop` package.

Go ahead and use the `takeUntilDestroyed` operator as last operator on each subscription you've created to
ensure proper cleanup on component destruction.

Please go over the following components and search for `.subscribe`. If there are subscriptions, go
and apply the `takeUntilDestroyed` operator.

If you aren't inside an injection context, you need to inject the `DestroyRef` inside the component and pass
it to the `takeUntilDestroyed(this.destroyRef)`.

* `TiltDirective`
* `MovieListPageComponent`
* `AppShellComponent`
