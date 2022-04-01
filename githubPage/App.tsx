import React, { useState} from 'react';
import BeforeAfterSlider from '../src';

import './app.scss';

const IMG_BASE_PATH = '/react-before-after-slider-component';

function doWithDelay(timeout: number, doCallback: () => void): Promise<void> {
    return new Promise((res) => {
        setTimeout(() => {
            doCallback()
            res();
        }, timeout);
    })
}

function createImageUrl(url: string): string {
    return window.location.host.includes('localhost')
        ? url
        : `${IMG_BASE_PATH}/${url}`;
}

export default function App() {
    const [{firstImage, secondImage}] = useState({
        firstImage: {
            imageUrl: createImageUrl(`/assets/image1.jpg`),
            alt: 'Image after'
        },
        secondImage: {
            imageUrl: createImageUrl(`/assets/image2.jpg`),
            alt: 'Image after'
        }
    });
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
                    firstImage={firstImage}
                    secondImage={secondImage}
                    onVisible={demonstrate}
                    onChangePercentPosition={setDelimerPercentPosition}
                />
            </div>
        </div>
    );
}
