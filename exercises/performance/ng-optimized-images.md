# NgOptimizeImages

In this exercise you will learn how to optimize images using the NgOptimizeImages Directive.

## Using ngSrc 

Start by adding the directive to an image tag.

- Replacing the `src` attribute with `ngSrc`
- Make sure images have a `height` and `width`

<details>
    <summary>show solution</summary>

Go to `movie-card.component.html` and modify the img tag to contain following changes:

```html
  <img class="movie-image"
       [alt]="movie.title"
       [ngSrc]="movie.poster_path | movieImage"
       height="330"
       width="220"
  >
```
</details>

Now if you open the browser console you should see that we are getting an error message.

![img.png](images/ng-optimize-image/ng-image-prio-warning.png)

This error is because we did not tell NgOptimizedImage if it should prioritize the image or not. 
To fix this, add the `priority` attribute to the `img` for the two first images.  

<details>
    <summary>show solution</summary>

Use the index from the movie list to set the priority of the image in the movie card.

```html
  <img class="movie-image"
       [alt]="movie.title"
       [ngSrc]="movie.poster_path | movieImage"
       height="330"
       width="220"
       [priority]="index < 2"
  >
```
</details>

After this change the error should be gone from the console.
