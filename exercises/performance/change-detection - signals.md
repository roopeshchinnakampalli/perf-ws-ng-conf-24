# ChangeDetection - Signals Exercise

This exercise is here to showcase how powerful signal change detection is. We are not quite at the level
we get with signal components, but we are close to it already.

## TiltDirective signal CD

We are going to slightly adjust the `TiltDirective` in order to make use of the new signal based
change detection.

Open the `TiltDirective` and..

**1. Transform `rotation` into a signal**

Refactor the `rotation` field from a static property to a `signal()`. Set the initial value to `rotate(0deg)`

<details>
  <summary>TiltDirective rotation signal</summary>

```ts
// tilt.directive.ts

rotation = signal('rotate(0deg)');


```

</details>

**2. Replace @HostBinding to {host} decorator property**

<details>
  <summary>TiltDirective use signal in {host} decorator style</summary>

```ts
// tilt.directive.ts

@Directive({
  selector: '[tilt]',
  standalone: true,
  host: {
    '[style.transform]': 'rotation()'
  }
})
export class TiltDirective {
  
}


```

</details>

Great! Please take a look at your application and be amazed by the change detection counters.
🔥🔥🔥🔥

## Check out Matthieu Rieglers Demo !!!

https://jeanmeche.github.io/angular-change-detection/
