import React, { useState} from 'react';
import BeforeAfterSlider, {Image} from '../src';

import './app.scss';

const IMG_BASE_PATH = '/react-before-after-slider-component';

const FIRST_IMAGE: Image = {
    imageUrl: `${IMG_BASE_PATH}/assets/image1.jpg`,
}

const SECOND_IMAGE: Image = {
    imageUrl: `${IMG_BASE_PATH}/assets/image2.jpg`,
}

function doWithDelay(timeout: number, doCallback: () => void): Promise<void> {
    return new Promise((res) => {
        setTimeout(() => {
            doCallback()
            res();
        }, timeout);
    })
}

export default function App() {
    const [delimerPersentPosition, setDelimerPercentPosition] = useState(50);

    const demonstrate = () => {
        setTimeout(async () => {
            const PARTS = 50;
            const timeSeconds = 0.1;
            const borderMin = 35;
            const delta = (delimerPersentPosition - borderMin) / PARTS;
            const timeout = timeSeconds / PARTS * 1000;
            let currentPosition = delimerPersentPosition;
            for (let i = 1; i <= PARTS; i++) {
                await doWithDelay(timeout, () => {
                    currentPosition -= delta;
                    setDelimerPercentPosition(currentPosition);
                });
            }
            await doWithDelay(1000, () => {});
            for (let i = 1; i <= PARTS; i++) {
                await doWithDelay(timeout, () => {
                    currentPosition += delta;
                    setDelimerPercentPosition(currentPosition);
                });
            }
        }, 500);
    };


    return (
        <div className="app">
            <div className="app__content-wrapper">
                <BeforeAfterSlider
                    currentPercentPosition={delimerPersentPosition}
                    firstImage={FIRST_IMAGE}
                    secondImage={SECOND_IMAGE}
                    onVisible={demonstrate}
                    onChangePercentPosition={setDelimerPercentPosition}
                />
            </div>
        </div>
    );
}
