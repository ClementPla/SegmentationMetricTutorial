# MetricTutorial

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

# Deploy (to Github-Pages)

Install the deployment package  ```npm i angular-cli-ghpages --save-dev``` 

Run ```ng build --prod --base-href "https://ClementPla.github.io/SegmentationMetricTutorial/" ``` and configure the sources to the github hosting repository.

Run ```npx angular-cli-ghpages --dir=dist/metric-tutorial``` to push the sources on the ```gh-pages``` branch of the repository.
