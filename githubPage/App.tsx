import React from 'react';
import BeforeAfterSlider, {Image} from '../src';

import './app.scss';

const IMG_BASE_PATH = '/react-before-after-slider-component';

const FIRST_IMAGE: Image = {
    id: 1,
    imageUrl: `${IMG_BASE_PATH}/assets/image1.jpg`,
}

const SECOND_IMAGE: Image = {
    id: 2,
    imageUrl: `${IMG_BASE_PATH}/assets/image2.jpg`,
}

export default function App() {
    return (
        <div className="app">
            <div className="app__content-wrapper">
                <BeforeAfterSlider
                    withDemonstration
                    firstImage={FIRST_IMAGE}
                    secondImage={SECOND_IMAGE}
                />
            </div>
        </div>
    );
}
