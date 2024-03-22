import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  signal,
} from '@angular/core';

@Directive({
  selector: '[tilt]',
  standalone: true,
  host: {
    '[style.transform]': 'rotation()',
  },
})
export class TiltDirective {
  @Input('tilt') rotationDegree = 30;

  rotation = signal('rotate(0)');

  @HostListener('mouseenter', ['$event.pageX', '$event.target'])
  onMouseEnter(pageX: number, target: HTMLElement) {
    const pos = determineDirection(pageX, target);

    const _rotationValue =
      pos === 0
        ? `rotate(${this.rotationDegree}deg)`
        : `rotate(-${this.rotationDegree}deg)`;

    this.rotation.set(_rotationValue);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.rotation.set('rotate(0deg)');
  }
}

/**
 * returns 0 if entered from left, 1 if entered from right
 */
function determineDirection(pos: number, element: HTMLElement): 0 | 1 {
  const width = element.clientWidth;
  const middle = element.getBoundingClientRect().left + width / 2;
  return pos > middle ? 1 : 0;
}
