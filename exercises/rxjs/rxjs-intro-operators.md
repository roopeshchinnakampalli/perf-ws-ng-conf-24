# RxJS Introduction - Operators

In this exercise we will extend our knowledge about rxjs by applying `operators` to our Observables.
You'll learn how to use operators to create, filter & transform stream of values in different ways.

## Close sidebar on route change

When using the movies application on mobile mode, we want the sidebar to close after each navigation event.

The following gif shows the desired behavior:

![sidenav-close-mobile.gif](images%2Fsidenav-close-mobile.gif)

Right now, this is not implemented. Please check it out on your own.

Before we introduce any operators, let's implement the naive subscription-only way. It will help you to understand
why operators are useful and how they make your code streams more declarative. 
It'll also teach you how to refactor from imperative to reactive code -> thinking reactively.

As the sidebar is also part of the `AppShellComponent`, please open it and..

**1. Subscribe to RouterEvents**

In the constructor, subscribe to the `this.router.events` Observable.
Note, there is a `sideDrawerOpen: boolean` field in the component representing the state
of the sideDrawer.
In case of `e instanceof NavigationEnd && this.sideDrawerOpen` we want to
set the `sideDrawerOpen` to false again. This will close the drawer whenever it was
open and a navigation event was fired.


<details>
  <summary>AppShellComponent: close drawer on navigation</summary>


```ts
// src/app/app-shell/app-shell.component.ts


constructor(
  private movieService: MovieService,
  private router: Router,
) {
  this.router.events.subscribe((e) => {
    if (e instanceof NavigationEnd && this.sideDrawerOpen) {
      this.sideDrawerOpen = false;
    }
  });
}

```
</details>

Great, check if the sidebar is now behaving as it should.

**2. Transform the if condition to a `filter`**

Now it's time to introduce the first operator, `filter`. We want to filter the
emissions of our stream based on the condition we had coded as an `if`.

As a result, our stream looks much cleaner :)

> to use an operator, you need to call the `.pipe()` function on the Observable
> inside, you can apply operators, e.g. 'stream$.pipe(filter(Boolean))'

<details>
  <summary>AppShellComponent: implement filter operator</summary>


```ts
// src/app/app-shell/app-shell.component.ts

import { filter } from 'rxjs';

constructor(
  private movieService: MovieService,
  private router: Router,
) {
  this.router.events.pipe(
    filter(e => e instanceof NavigationEnd && this.sideDrawerOpen)
  ).subscribe((e) => {
    this.sideDrawerOpen = false;
  });
}

```
</details>

Congratulations if you have introduced your first rxjs operator 🥳

## Create and transform a stream from an event

After we've used a `filter operator`, it's time to get to know also other categories
of rxjs operators. This time we'll learn `creation` & `transformation` operators. Furthermore,
you'll also use a `join creation` operator to further simplify your solution.

I'm sure you've noticed the `tilt` behavior when hovering over the movie cards.
This behavior is controlled by the `TiltDirective`, which we will re-implement in a
reactive way now.

Please open the `TiltDirective` and inspect its code. It currently uses `@HostListener`
decorators to determine the `rotation` value.

This code is fully imperative, but we can make it entirely reactive :-).

> this refactoring is not really needed, nor considered as best practice for developing
> attribute directives. Anyway, it's a very nice example to teach rxjs. Just keep that in mind


**1. inject the `ElementRef`**

In order to listen to events of our element without `@HostListener`s we need to
inject the `ElementRef` into the Directive.

Do so in the constructor, or use the `inject` function, just as u like.


<details>
  <summary>TiltDirective: Inject the ElementRef</summary>


```ts
// src/app/tilt/tilt.directive.ts

constructor(
  private elementRef: ElementRef<HTMLElement>
) {
  
}

```
</details>

**2. Create Observables from events**

As a second step we want to create two Observables:
* one for the `mouseleave`
* one for the `mouseenter`

We'll use the `fromEvent` creation operator in order to do so.

> `fromEvent` sometimes needs a bit of a help to find the correct typing
> For this scenario it's best to type it as fromEvent<MouseEvent>(...args)
> in order to have better typing support in your IDE

Subscribe to each Observable, you can move the logic from the corresponding
`@HostListener` implementations and put it into the subscription callback.

> `fromEvent` expects the element as first parameter and the eventName as string
as the second parameter


<details>
  <summary>TiltDirective: Create Observables from event</summary>


```ts
// src/app/tilt/tilt.directive.ts

constructor(
  private elementRef: ElementRef<HTMLElement>
) {
  fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
    .subscribe(({ pageX, target }) => {
      const pos = determineDirection(pageX, target as HTMLElement);

      this.rotation = pos === 0
             ? `rotate(${this.rotationDegree}deg)`
             : `rotate(-${this.rotationDegree}deg)`;
  });

  fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave').subscribe(() => {
    this.rotation = 'rotate(0deg)'
  });
}

```
</details>

Amazing, please don't forget to delete the code of the `@HostListener` implementation.
We don't need it anymore.

Also take a look at the served application and see if the tilt directive is still
doing its job.

**3. use the `map` operator to transform `MouseEvent` -> `string`**

The code is working, but we can still improve the code quality.
Instead of calculating everything in the subscribe callback, we are going
to transform our `MouseEvent` into a `string` that we can simply
set as new value.

It seems rather unintuitive, but please introduce the `map` for both
subscriptions. Don't worry, it'll make sense soon.


<details>
  <summary>TiltDirective: Create Observables from event</summary>


```ts
// src/app/tilt/tilt.directive.ts

constructor(
  private elementRef: ElementRef<HTMLElement>
) {
  fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
    .pipe(
      map(({ pageX, target }) => {
        const pos = determineDirection(pageX, target as HTMLElement);

        return pos === 0
               ? `rotate(${this.rotationDegree}deg)`
               : `rotate(-${this.rotationDegree}deg)`;
      })
    )
    .subscribe(rotation => {
      this.rotation = rotation;
  });

  fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
    .pipe(
      map(() => 'rotate(0deg)')
    )
    .subscribe(rotation => {
    this.rotation = rotation;
  });
}

```
</details>

Great, make sure the application is still running and be prepared for the next step!

**4. combine both Observables into a single stream**

Don't u think we could get rid of at least one of those `.subscribe`s?
We already have the perfect setup, two streams that both emit the very same type of value which 
we also want to assign to the very same variable.

To further simplify our reactive implementation, we can make use of the
`merge` join creation operator. It'll allow us to combine our two streams into one, with
only one subscription in the end.

First, create two named streams instead of two subscriptions:
* `rotate$`
* `reset$`


<details>
  <summary>TiltDirective: Create streams instead of subscriptions</summary>


```ts
// src/app/tilt/tilt.directive.ts

constructor(
  private elementRef: ElementRef<HTMLElement>
) {
  const rotate$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
    .pipe(
      map(({ pageX, target }) => {
        const pos = determineDirection(pageX, target as HTMLElement);

        return pos === 0
               ? `rotate(${this.rotationDegree}deg)`
               : `rotate(-${this.rotationDegree}deg)`;
      })
    );

  const reset$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
    .pipe(
      map(() => 'rotate(0deg)')
    );
}

```
</details>

Now, combine those streams into a single by using `merge` (`from 'rxjs'`)
operator.


<details>
  <summary>TiltDirective: merge and subscribe</summary>


```ts
// src/app/tilt/tilt.directive.ts

constructor(
  private elementRef: ElementRef<HTMLElement>
) {
  const rotate$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
    .pipe(
      map(({ pageX, target }) => {
        const pos = determineDirection(pageX, target as HTMLElement);

        return pos === 0
               ? `rotate(${this.rotationDegree}deg)`
               : `rotate(-${this.rotationDegree}deg)`;
      })
    );

  const reset$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
    .pipe(
      map(() => 'rotate(0deg)')
    );
  
  merge(rotate$, reset$)
    .subscribe(rotation => this.rotation = rotation);
}

```
</details>

Congratulations, this is a super clean reactive implementation of the tilt directive!
