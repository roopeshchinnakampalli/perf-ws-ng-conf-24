# RxJS Introduction - Observable

In this exercise we will slowly get to know rxjs, in particular the `Observable` data structure.
You'll learn how to receive values from an `Observable` in different ways and display them in the template.

## Display list of movies

You might have noticed, that the list of movies is completely empty when serving the application.

> ℹ️ IMPORTANT: please make sure you are actually at the correct url (http://localhost:4200/list/popular)


So your first task will be to actually show a list of movies by subscribing to different Observables.

The `MovieListPageComponent` is able to display movies based off a list category or a genre id.
It receives its inputs from the route parameters. In angular, the route parameters are exposed as an `Observable`
from the `ActivatedRoute` service.

Just for reference, here is the route configuration for the `MovieListPageComponent`:

<details>
  <summary>route config for MovieListPageComponent</summary>


```ts
// src/app/app.routes.ts
{
    path: 'list/:category',
    loadComponent: () =>
      import('./movie/movie-list-page/movie-list-page.component').then(
        (m) => m.MovieListPageComponent
      ),
  },
  {
    path: 'list/genre/:id',
    loadComponent: () =>
      import('./movie/movie-list-page/movie-list-page.component').then(
        (m) => m.MovieListPageComponent
      ),
  },

```
</details>

We'll then be able to use the route params to perform a get request to the TMDB movies API which
returns us the desired movie data.

Let's go there step by step.

Open the `MovieListPageComponent` and...

**1. Subscribe to the ActivatedRoute.params Observable**

In the constructor, subscribe to `this.activatedRoute.params` and print the params to the console.

<details>
  <summary>MovieListPageComponent: Subscribe to ActivatedRoute.params</summary>

```ts
// src/app/movie/movie-list-page/movie-list-page.component.ts

constructor(
  private activatedRoute: ActivatedRoute,
  private movieService: MovieService,
) {
  this.activatedRoute.params.subscribe(params => {
    console.log('params', params);
  });
}

```

</details>

Great, now navigate through different list categories and observe the console output. 

![navigate-through-categories](images/navigate-through-categories.png)

You should see an object with a `category` property being printed to your console, e.g.

```javascript
{category: 'upcoming'}
```

Nice, now let's fetch actual data with that information.

**2. Fetch movies by category based on the route params**

Instead of only (keep it for now..) printing the params to the console, pass the category
property to the `this.movieService.getMovieList` function.
It returns an `Observable<TMDBMovieModel[]>` which we want to subscribe to.

Use the value and assign it to `this.movies`.

Please don't forget to put an `if (params['category'])` in order to verify if we actually receive a
category.

<details>
  <summary>MovieListPageComponent: fetch movies by category</summary>

```ts
// movie-list-page.component.ts

this.activatedRoute.params.subscribe(params => {
  console.log('params', params);
  
  if (params['category']) {
    this.movieService.getMovieList(params['category']).subscribe(
      movies => this.movies = movies
    )
  }
});

```
</details>

Well done, now you should be able to see actual movie cards being populated to your screen.

Before we continue with the other params, let's make sure they are accessible via the UI by following
the next task of this exercise!

## Display list of genres

You should've noticed the `Genre` headline within the side navigation of the movies app.

![empty-genres.png](images%2Fempty-genres.png)

Sadly, it's only a headline :(. This will be your next task, make sure the list of genres is 
properly displayed. This time we won't subscribe ourselves, but let the `async` pipe handle this for us.

As the navigation bar is filled with data from the `AppShellComponent`, this is the one we need to 
change for this task. Open it, and ...

**1. Create a genre$ field of movieService.getGenres()**

Use the `this.movieService.getGenres()` method and bind it to a field in the component.

<details>
  <summary>Create a genre$ field in AppShellComponent</summary>

```ts
// app-shell.component.ts

readonly genres$ = this.movieService.getGenres();

```

</details>

Now we want our template to subscribe to this data.
The angular framework provides a utility for this: the `AsyncPipe`.

**2. Subscribe to genres in the template and create views**

Open the `AppShellComponent`s template file and locate the Genres headline. You should find
a template which you need to repeat per genre coming as a result from the http call.

I suggest using the `@for` control flow to iterate over the genres, but you can choose to do
otherwise as well.

Here is an example for the `@for`, note that it is missing the async pipe you need to add for
the exercise:

`@for (genre of genre; track 'id') `


<details>
  <summary>subscribe to genre$ with async pipe</summary>

```html
<!--app-shell.component.html-->

@for (genre of genres$ | async; track 'id') {
  <a
    class="navigation--link"
    [routerLink]="['/list', 'genre', genre.id]"
    routerLinkActive="active"
  >
    <div class="navigation--menu-item">
      <fast-svg class="navigation--menu-item-icon" name="genre" />
      {{ genre.name }}
    </div>
  </a>
}

```

</details>

Great, serve the application and take a look if the genres are being rendered to the screen.

You can also start navigating around, but the movies aren't changing yet. Let's change that as well!

**3. Display movies based on the genre **

While navigating, observe the console, you should see objects being printed out with an `id` property.
This is what we will use to fetch the movies based on the genre from the `MovieService`.

For this, again open the `MovieListPageComponent` and add another branch 
in your params subscription.

Use the `params['id']` and pass it to the `this.movieService.getMoviesByGenre` method.
Again, subscribe to the Observable and assign the result to `this.movies`

<details>
  <summary>MovieListPageComponent: fetch movies by genre</summary>

```ts
// movie-list-page.component.ts

this.activatedRoute.params.subscribe(params => {
  if (params['category']) {
    this.movieService.getMovieList(params['category']).subscribe(
      movies => this.movies = movies
    )
  } else {
    this.movieService.getMoviesByGenre(params['id']).subscribe(
      movies => this.movies = movies
    );
  }
});

```

</details>

Very well done, check your application and check if you can now navigate between categories and genres back
and forth.
You can also observe the network tab, it should show you different endpoints being fetched based on the
route you are currently at.
