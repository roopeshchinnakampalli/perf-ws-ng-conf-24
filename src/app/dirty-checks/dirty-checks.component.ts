import { Component } from '@angular/core';

@Component({
  selector: 'dirty-checks',
  standalone: true,
  imports: [],
  templateUrl: './dirty-checks.component.html',
  styleUrl: './dirty-checks.component.scss',
})
export class DirtyChecksComponent {
  private _renders = 0;

  ngDoCheck() {
    this._renders++;
  }

  renders() {
    return this._renders;
  }
}
