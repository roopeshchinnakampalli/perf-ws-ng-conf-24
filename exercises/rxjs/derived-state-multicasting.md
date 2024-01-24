# Side Effects, Multicasting, Derived State & Subscription Handling

# Goal

The goal of this exercise is to get familiar with the very basic concepts of state management with rxjs: 

* join operators
* multicasting
* derived state

## Derived State: Amount of Currently visible favorites

We now want to show the user the currently visible amount of favorite movies as a numeric value on the screen.
Until now, we stored single state slices in different observable sources. Let's combine multiple slices together
to form a derived state.

Please use `combineLatest` to compose a new `Observable<number>` that calculates the amount of visible
favored movies. Use `movies$` & `favoritesMap$` as inputs for it.

<details>
  <summary>visibleFavorites$</summary>

```ts
// movie-list-page.component.ts

readonly visibleFavorites$ = combineLatest([
  this.movies$,
  this.favoritesMap$
]).pipe(
  map(([movies, favorites]) => movies.filter(movie => favorites[movie.id]).length)
)

```

</details>


Don't forget to bind the value into the template in order to see if the result works.

```html

<!-- movie-list-page.component.html -->

<div><strong>Visible {{ visibleFavorites$ | async }}</strong></div>

<!-- Rest of the template -->
```

Amazing, run the application and see if the value is displayed and also updated when u change the favorite state of a movie.

## Multicasting

Something is wrong with the implementation we did before, can u see what? Open your dev tools network tab
and filter for `xhr` requests. Start scrolling the movie list page and observe the requests being fired.
You will notice that there are 2 requests being made per page as you are scrolling.
This is because now there are 2 subscribers for the `movie$` Observable.

In other words, `movie$` is cold, as the producer is encapsulated within the stream. Every subscriber
starts a completely new stream.

To face this, we have the concept of `multicasting` which allows us to transform our observables from a
`cold`, to a `hot` state.

A `hot` Observable depends on a producer and shares 1 producer across multiple subscribers.

You can choose whichever solution u think fits best to achieve this. Your options are:
* `connectable`
* `connect`
* `shareReplay` -> being removed soon
* `share`

For this use case I recommend going with `share`.

Please apply any multicasting technique to the `movie$` observable in order to share its outcome
across multiple subscribers.

<details>
  <summary>Movie$ multicasting</summary>

```ts
// movie-list-page.component.ts

movie$ = /**/
  share({ connector: () => new ReplaySubject(1), resetOnRefCountZero: true })

```

</details>

Cool, repeat the process from before and see if the duplicated network request is gone.

## Combine state into viewModel$

It is generally good practice to slice your state into viewModels for the usage in the template.
This helps to reduce the usage of `async` pipes in your template and reduces the total amount of subscriptions
being made by your application.
It also is a way to not be forced to introduce multicasting on individual state slices.

Use `combineLatest` to create a `viewModel$` Observable in `MovieListPageComponent` that exposes the following properties
as a key-value object to the template.

```ts
import { combineLatest } from 'rxjs';
import { MovieModel } from './movie-model';

viewModel$: Observable<{
  movies: MovieModel[];
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  visibleFavorites: number;
}> = combineLatest({/**/ })
```

<details>
  <summary>Create viewModel$</summary>

This is the simple solution. If you like you can delete the `visibleFavorites$` slice, remove the `share`
operator from `movies$` and calculate `visibleFavorites` on the go with an additional `map` operator. 

```ts
// movie-list-page.component.ts

import { combineLatest } from 'rxjs';
import { MovieModel } from './movie-model';

viewModel$: Observable<{
  movies: MovieModel[];
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  visibleFavorites: number;
}> = combineLatest({
  movies: this.movies$,
  favorites: this.favoritesMap$,
  favoritesLoading: this.favoritesLoadingMap$,
  visibleFavorites: this.visibleFavorites$
})
```

</details>

Now adjust your template so that it reads from the viewModel$ instead of using single async pipes.

<details>
  <summary>Use viewModel$ in the template</summary>

This is the simple solution. If you like you can delete the `visibleFavorites$` slice, remove the `share`
operator from `movies$` and calculate `visibleFavorites` on the go with an additional `map` operator.

```html
// movie-list-page.component.html

<ng-container *ngIf="viewModel$ | async as vm;">

  <div><strong>Visible {{ vm.visibleFavorites }}</strong></div>

  <movie-list
    (favoriteToggled)="toggleFavorite$.next($event)"
    [favorites]="vm.favorites"
    [moviesLoading]="vm.favoritesLoading"
    *ngIf="vm.movies && vm.movies.length > 0; else: elseTmpl"
    [movies]="vm.movies">
  </movie-list>

  <div (elementVisible)="paginate$.next($event)"></div>

  <ng-template #elseTmpl>
    <div>Sorry, nothing found bra!</div>
  </ng-template>


</ng-container>
```

</details>

Good job, check your application to see if all interactions still work and your applied changes are properly
reflected.

