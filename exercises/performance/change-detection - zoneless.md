# ChangeDetection - Going zoneless Exercise

In this exercise we will focus on advanced runtime optimizations in angular applications by using our knowledge about
the `ChangeDetection` system and `NgZone` in angular.

## Goal

## Provide no-op zone & ChangeDetection

```ts
// app.config.ts
import { ApplicationConfig, ɵprovideZonelessChangeDetection /* 👈️ add this */ } from '@angular/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([readAccessInterceptor])
    ),
    provideRouter(routes),
    provideFastSVG({
      url: (name: string) => `assets/svg-icons/${name}.svg`,
      defaultSize: '12',
    }),
    ɵprovideZonelessChangeDetection() // 👈️ add this
  ]
};
```

Remove the polyfills section on angular.json

```json
// angular.json


"polyfills": [
"zone.js"
],

```

Optionally, also delete the dependency to zone.js from package.json

```bash
npm uninstall zone.js
```

## Optional: Provide custom
