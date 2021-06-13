# React before after slider component

[![screencast demo](./screencast.gif)](./screencast.gif)

## Build
npm run build
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

const firstImage = {
  id: 1,
  imageUrl: 'https://example.com/.../some-image.jpg'
};
const secondImage = {
  id: 1,
  imageUrl: 'https://example.com/.../some-image-2.jpg'
};

<ReactBeforeSliderComponent firstImage={firstImage} secondImage={secondImage} />
...
```
