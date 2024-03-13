import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rxActions } from '@rx-angular/state/actions';
import { exhaustMap, map, Observable, startWith, tap } from 'rxjs';
import { TMDBMovieModel } from '../../shared/model/movie.model';
import { MovieService } from '../movie.service';
import { ElementVisibilityDirective } from '../../shared/cdk/element-visibility/element-visibility.directive';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'movie-list-page',
  templateUrl: './movie-list-page.component.html',
  styleUrls: ['./movie-list-page.component.scss'],
  standalone: true,
  imports: [NgIf, MovieListComponent, ElementVisibilityDirective],
})
export class MovieListPageComponent {
  movies: TMDBMovieModel[];

  readonly actions = rxActions<{ paginate: void }>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private movieService: MovieService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      if (params['category']) {
        this.paginate(page => this.movieService.getMovieList(params['category'], page)).subscribe(movies => {
          this.movies = movies;
        });
      } else {
        this.paginate(page => this.movieService.getMoviesByGenre(params['id'], page)).subscribe(movies => {
          this.movies = movies;
        });
      }
    });
  }

  private paginate(
    requestFn: (page: number) => Observable<TMDBMovieModel[]>
  ): Observable<TMDBMovieModel[]> {
    // local array to store all movies
    let allMovies: TMDBMovieModel[] = [];
    return this.actions.paginate$.pipe(
      startWith(void 0),
      exhaustMap((v, i) =>
        // call requestFn with the page parameter, use the index from `exhaustMap`
        // as the index is not 0 based
        requestFn(i + 1).pipe(
          map((movies) => [...allMovies, ...movies])
        )
      ),
      tap(movies => allMovies = movies)
    );
  }
}
