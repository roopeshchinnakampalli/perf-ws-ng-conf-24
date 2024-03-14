import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FastSvgModule } from '@push-based/ngx-fast-svg';

import { MovieDetailPageComponent } from './movie-detail-page.component';

const routes: Routes = [
  {
    path: '',
    component: MovieDetailPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FastSvgModule,
    MovieDetailPageComponent,
  ],
})
export class MovieDetailPageModule {}
