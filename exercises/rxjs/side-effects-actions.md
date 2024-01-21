# Actions & Side Effects 

Actions are a way to encapsulate side effects in a reactive way. 

## Goal

As of right now, we've used `Subject`s as our event triggers. While this works, it's neither scalable, nor handy to use.
In this exercise, you'll learn other approaches on how to implement actions / event streams withing your application.

## Replace `toggleFavorite$` Subject with `rxActions`

It's time to get introduced to `rxActions` from the `@rx-angular/state/actions` package.
Your first task will be to refactor the currently existing `toggleFavorite$` from `Subject` to `rxActions`.

```ts
import { rxActions } from '@rx-angular/state/actions';

actions = rxActions<{ toggleFavorite: MovieModel }>();
```

Great, this will enable you to dispatch the action via `actions.toggleFavorite()` and listen this action via `actions.toggleFavorite$`.

Replace the usages of `toggleFavorite$` accordingly and remove the subject.

<details>
  <summary>ToggleFavorite Action Solution</summary>

```ts
// movie-list-page.component.ts

connect(
  this.actions.toggleFavorite$
)

```

```html
<!-- movie-list-page.component.html -->

<movie-list
  [favorites]="favoritesMap$ | async"
  [moviesLoading]="favoritesLoadingMap$ | async"
  (favoriteToggled)="actions.toggleFavorite($event)"
  *ngIf="movies && movies.length > 0; else: elseTmpl"
  [movies]="movies">
</movie-list>

```

</details>

Well done, make sure your application is still working. Try to toggle the favorite state of a movie.

## MovieFavoriteService: A Store-Like implementation

As of now, we've mixed and matched global state with local state. Our component contains a lot of state management code that could also be
part of a service. We now want to create a stateful service, where all the state is stored and actions are provided.

Your task now will be to extract the favorite state management code from `MovieListPageComponent` to the a new `MovieFavoriteService`.
In the end your `MovieFavoriteService` state should have the following properties:

* `favorites: Record<string, MovieModel>;`
* `favoritesLoading: Record<string, boolean>;`

It should have the following actions:

* `toggleFavorite: MovieModel;`

Optional: 

It should have the following side-effects:

*  `this.actions.toggleFavorite$` --> `alert('movie updated')`

### Create Service

Start by creating a new `movie-favorite.service.ts` in the `/movie` folder. The service should be provided in root.

<details>
  <summary>MovieFavoriteService Skeleton</summary>

```ts
// movie/movie-favorite.service.ts

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  
  /* inject MovieService */
  private readonly movieService = inject(MovieService);
}
```

</details>

### Actions

Let's start by creating the `rxActions<{ toggleFavorite: MovieModel }>`.

<details>
  <summary>MovieFavoriteService rxActions</summary>

```ts
// movie/movie-favorite.service.ts

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  
  /* inject MovieService */
  private readonly movieService = inject(MovieService);
  
  /* define actions */
  readonly actions = rxActions<{
    toggleFavorite: MovieModel;
  }>();
  
}
```

</details>

Great, also refactor its usage in the `MovieListPageComponent`. Remove the `rxActions` from that component and replace it's usage with
the `MovieFavoriteService`.

<details>
  <summary>MovieFavoriteService usage in MovieListPageComponent</summary>

```ts
// movie-list-page.component.ts

export class MovieListPageComponent {
      
  constructor(
    private activatedRoute: ActivatedRoute,
    private movieService: MovieService,
    public movieFavorites: MovieFavoriteService // 👈️,
  ) {}
  
}
```
Also adjust the template

```html
<!-- movie-list-page.component.html -->

<movie-list
  [favorites]="favoritesMap$ | async"
  [moviesLoading]="favoritesLoadingMap$ | async"
  (favoriteToggled)="movieFavorites.actions.toggleFavorite($event)"
  *ngIf="movies && movies.length > 0; else: elseTmpl"
  [movies]="movies">
</movie-list>
```

</details>


### State

Let's continue by refactoring the state pieces as well into the `MovieFavoriteService`.

The `MovieFavoriteService` state should have the following properties:

* `favorites: Record<string, MovieModel>;`
* `favoritesLoading: Record<string, boolean>;`

It should expose the following Observables:

* `favorites$ = this.state.select('favorites');`
* `favoritesLoading$ = this.state.select('favoritesLoading');`

<details>
  <summary>MovieFavoriteService State Skeleton</summary>

```ts
// movie/movie-favorite.service.ts

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  
  /* inject MovieService */
  private readonly movieService = inject(MovieService);
  
  /* define actions */
  readonly actions = rxActions<{
    toggleFavorite: MovieModel;
  }>();
  
  /* create state */
  private readonly state = rxState<{
    favorites: Record<string, MovieModel>;
    favoritesLoading: Record<string, boolean>;
  }>();
  
  /* expose state */
  readonly favorites$ = this.state.select('favorites');
  readonly favoritesLoading$ = this.state.select('favoritesLoading');
}
```

</details>

Now move logic that connect `favorites` & `favoritesLoadingMap` from `MovieListPageComponent` to `MovieFavoriteService`.

<details>
  <summary>MovieFavoriteService State</summary>

```ts
// movie/movie-favorite.service.ts

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  
  /* inject MovieService */
  private readonly movieService = inject(MovieService);
  
  /* define actions */
  readonly actions = rxActions<{
    toggleFavorite: MovieModel;
  }>();
  
  /* create state */
  private readonly state = rxState<{
    favorites: Record<string, MovieModel>;
    favoritesLoading: Record<string, boolean>;
  }>(({ connect, get }) => {
    connect(
      'favorites',
      this.movieService
        .getFavoriteMovies()
        .pipe(map((favorites) => toDictionary(favorites, 'id'))),
    );
    
    connect(
      this.actions.toggleFavorite$.pipe(
        groupBy((movie) => movie.id),
        mergeMap((movie$) => {
          return movie$.pipe(
            exhaustMap((movie) => {
              return this.movieService.toggleFavorite(movie).pipe(
                map((isFavorite) => {
                  const favoritesLoading = {
                    ...get('favoritesLoading'),
                    [movie.id]: false,
                  };
                  if (isFavorite) {
                    return {
                      favoritesLoading,
                      favorites: {
                        ...get('favorites'),
                        [movie.id]: movie,
                      },
                    };
                  }
                  const favoriteMap = {
                    ...get('favorites'),
                  };
                  delete favoriteMap[movie.id];
                  return {
                    favorites: favoriteMap,
                    favoritesLoading: {
                      ...get('favoritesLoading'),
                      [movie.id]: false,
                    },
                  };
                }),
                startWith({
                  favoritesLoading: {
                    ...get('favoritesLoading'),
                    [movie.id]: true,
                  },
                }),
              );
            }),
          );
        }),
      ),
    );
  });
  
  /* expose state */
  readonly favorites$ = this.state.select('favorites');
  readonly favoritesLoading$ = this.state.select('favoritesLoading');
}
```

</details>

The only thing left for the state refactoring is the cleanup of the `MovieListPageComponent`. You can keep its state as is and only
replace the `connection`s to use the `MovieFavoriteService`.

<details>
  <summary>MovieListPageComponent connections</summary>

```ts
// movie-list-page.component.ts

private state = rxState<{
  favorites: Record<string, MovieModel>;
  favoritesLoading: Record<string, boolean>;
  movies: TMDBMovieModel[];
}>(({ connect, get, set }) => {
  set({
    favoritesLoading: {},
    favorites: {},
  });
  
  connect('favorites', this.movieFavorites.favorites$);
  
  connect('favoritesLoading', this.movieFavorites.favoritesLoading$);
});

```

</details>

### Optional: Effects

We also had a side-effect in place, that raised an `alert` whenever a favorite finished loading. In best case we also refactor this
to be part of the `MovieFavoriteService`.

For this, use `rxEffects(({ register }) => {})` in order to handle the side effect in the `MovieFavoriteService`. 

The effect should subscribe to `this.actions.toggleFavorite$` and fire an `alert` whenever a movie finshed loading.

Docs: https://www.rx-angular.io/docs/state/effects

<details>
  <summary>MovieFavoriteService State</summary>

```ts
// movie/movie-favorite.service.ts

@Injectable({
  providedIn: 'root',
})
export class MovieFavoriteService {
  
  /* code */
  
  private readonly effects = rxEffects(({ register }) => {
    register(
      this.actions.toggleFavorite$.pipe(
        groupBy((movie) => movie.id),
        mergeMap((movie$) =>
          movie$.pipe(
            exhaustMap((movie) =>
              this.state.select('favoritesLoading').pipe(
                filter((favoritesLoading) => !favoritesLoading[movie.id]),
                tap(() => alert('movie updated')),
                take(1),
              ),
            ),
          ),
        ),
      ),
    );
  });
}
```

</details>
