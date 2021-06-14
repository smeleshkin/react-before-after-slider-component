# React before after slider component

[![screencast demo](./screencast.gif)](./screencast.gif)

## Demo
https://smeleshkin.github.io/react-before-after-slider-component/
## Build
npm run build:npm
## Usage
```
npm install react-before-after-slider-component --save
```

Then use it in your app:
```js
import React from 'react';
import ReactBeforeSliderComponent from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';
...

const FIRST_IMAGE = {
  id: 1,
  imageUrl: 'https://example.com/.../some-image.jpg'
};
const SECOND_IMAGE = {
  id: 2,
  imageUrl: 'https://example.com/.../some-image-2.jpg'
};
/* ... */
<ReactBeforeSliderComponent
    firstImage={FIRST_IMAGE}
    secondImage={SECOND_IMAGE}
/>
/* ... */
```
