## Side Effect: Alert on update completion

We want to show a notification to the user whenever the favorite state was successfully updated. Or in other words,
whenever the MovieService responds with a result after the user wanted to change the favorite state of a Movie, we want
to show an `alert` (or console log, as u like).

There are two ways of achieving this. We could just add a line of code to the already existing state and call it a day.
Or, we create a new subscription that only maintains the logic of the side effect. You should prefer the latter, as a clear separation of
concerns makes the code easier to understand and better to maintain.

The trigger of the side effect is the `toggleFavorite$` subject. This is what we want to subscribe to.
We basically need to have the same logic as for the state changes: `groupBy` -> `mergeMap` -> `exhaustMap`.
If you like, you can create a re-usable Observable to use it for both, the state & the effect instead of copy/pasting the same logic again.

Instead of `exhaustMap` to the service call, we want to subscribe to the `favoritesLoading` and wait for it to become
falsy for the given movie.id.

<details>
  <summary>Alert favorite update side effect</summary>

```ts
// movie-list-page.component.ts

this.toggleFavorite$.pipe(
  /* groupBy, mergeMap, exhaustMap */
  this.favoritesLoadingMap$.pipe(
    filter(favoritesLoading => !favoritesLoading[movie.id]),
    tap(() => alert('movie updated')),
    take(1) // <- this is important, otherwise exhaustMap never stops blocking events
  )
).subscribe();

```
</details>

Cool, check out your new side effect by changing the favorite state again in your application.
