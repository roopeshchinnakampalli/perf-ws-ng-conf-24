# Local State with RxState

In this exercise you'll learn how to dramatically reduce the boilerplate of your local state management by using `RxState`.
`RxState` is a tool dedicated for managing reactive component state. 

Up until now, we've treated state as single observable slices. While it is effective for now, it won't be able to scale and is hard to maintain.
We have to manually maintain subscriptions, have high refactoring efforts when changing the behavior of single slices & you can't interact imperatively with your state, to name a few issues.

In a perfect world, our reactive state management is:

* tied to the component lifecycle
* manages subscriptions internally
* easy to construct
* lazy by default -> doesn't require an initial state
* read & write operations reactive as well as imperative
* easy to derive state from stored slices
* is able to manage side effects

And this is exactly what [`@rx-angular/state`](http://www.rx-angular.io/docs/state) provides.

Let's go ahead and improve the boilerplatey `MovieListPageComponent` state step by step!

## Create the state instance

As a first step we want to create an instance of `RxState` by using the new functional API.

The interface of the state should resemble all properties we are right now
maintaining in single observables.

```ts
{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}
```

Creating an instance of `RxState` is as simple as calling a function:

```ts
import { rxState } from '@rx-angular/state';

state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(() => {
  
});
```

## Initialize the state

The first thing we want to do for our use case to work (this isn't a mandatory step for everyone by any means!)
is to set an initial state.

The `rxState` creation function allows you to directly use its instance API withing
the callback function.

```ts
rxState(({ set, connect, /*... other APIs*/}) => {
  set(initialState);
})
```

Please go ahead and initialize your state to the following value:

```ts
{
  favoritesLoading: {},
  favorites: {},
}
```

<details>
  <summary>Solution: Set initial state</summary>

```ts

private state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(({ connect, get, set }) => {
  
  set({
    favoritesLoading: {},
    favorites: {},
  })
});

```

</details>

## Connect movies & favorites

Now we can start populating our state with values.
Go ahead to connect the paginated movie$ stream to the `movie` key of your state.
Also, instead of having a `favoritesMap$: BehaviorSubject`, populate the `favorites` key of your state with
the `movieService.favoriteMovies()` observable.

<details>
  <summary>Connect movies</summary>

```ts
// movie-list-page.component.ts

private state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(({ connect, get, set }) => {

  /*... code before */

  connect(
    'movies',
    this.activatedRoute.params.pipe(
      switchMap(params => {
        if (params['category']) {
          return this.paginate((page) =>
            this.movieService.getMovieList(params['category'], page)
          );
        } else {
          return this.paginate((page) =>
            this.movieService.getMoviesByGenre(params['id'], page)
          );
        }
      })
    )
  );
})

```

</details>

<details>
  <summary>Connect favorites</summary>

```ts

// movie-list-page.component.ts

private state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(({ connect, get, set }) => {

  /*... code before */

  connect('favorites', this.movieService.getFavoriteMovies().pipe(
    map(favorites => toDictionary(favorites, 'id'))
  ));
});
```
</details>

## Handle updates & connect favoritesLoading

The final piece of state connection is the favoritesLoadingMap. By looking at the subscription from before, you will notice
we are updating two different subjects: `favoritesLoadingMap$` and `favoritesMap$`.
Instead of connecting a single key, we now want to connect the slice `{ favorites, favoritesLoading }`.

<details>
  <summary>Solution: Handle updates & connect favoritesLoading</summary>

```ts

private state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(({ connect, get, set }) => {
  
  /* code before */
  
  connect(
    this.toggleFavorite$.pipe(
      groupBy(movie => movie.id),
      mergeMap(movie$ => {
        return movie$.pipe(
          exhaustMap(movie => {
            return this.movieService.toggleFavorite(movie).pipe(
              map(isFavorite => {
                const favoritesLoading = { ...get('favoritesLoading'), [movie.id]: false }; // 👈️
                if (isFavorite) {
                  return {
                    favoritesLoading,
                    favorites: {
                      ...get('favorites'), // 👈️
                      [movie.id]: movie
                    }
                  };
                }
                const favoriteMap = {
                  ...get('favorites') // 👈️
                };
                delete favoriteMap[movie.id];
                return {
                  favorites: favoriteMap,
                  favoritesLoading: { ...get('favoritesLoading'), [movie.id]: false } // 👈️
                };
              }),
              startWith({
                favoritesLoading: { ...get('favoritesLoading'), [movie.id]: true } // 👈️
              })
            );
          })
        )
      })
    )
  )
});

```

</details>

## Read From State

And finally we can remove all of the `BehaviorSubjects` and replace our reads with the `select` API of our reactive state implementation.

<details>
  <summary>Read from state with select</summary>

```ts
// movie-list-page.component.ts

readonly movies$ = this.state.select('movies');
readonly favoritesMap$ = this.state.select('favorites');
readonly favoritesLoadingMap$ = this.state.select('favoritesLoading');

```
</details>

AMAZING!!!! Run your application and see if everything is working as expected.

We didn't put any new "feature" into the application, but I hope you can feel and experience the improved developer experience
when managing reactive component states.
