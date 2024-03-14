import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FastSvgModule } from '@push-based/ngx-fast-svg';

import { MyMovieListComponent } from './my-movie-list.component';

const routes: Routes = [
  {
    path: '',
    component: MyMovieListComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FastSvgModule,
    MyMovieListComponent,
  ],
})
export class MyMovieListModule {}
