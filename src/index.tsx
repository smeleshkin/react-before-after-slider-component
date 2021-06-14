import React, {MouseEventHandler, TouchEventHandler, useEffect, useRef, useState} from 'react';
import cn from 'classnames';

import './styles.scss';

export function isIntersectionObserverSupport() {
    if (typeof window === 'undefined') return false;
    return Boolean(window.IntersectionObserver);
}


export interface Image {
    id: number;
    imageUrl: string;
  }

interface Props {
    firstImage: Image;
    secondImage: Image;
    withDemonstration?: boolean;
    startPercent?: number;
    className?: string;
    withResizeFeel?: boolean;
}

enum MODE {
    MOVE = 'move',
    DEFAULT = 'default',
}

function normalizeNewPosition(newPosition: number, imagesWidth: number) {
    if (newPosition > imagesWidth) {
        return imagesWidth;
    }
    if (newPosition < 0) {
        return 0
    }

    return newPosition;
}

function doWithDelay(timeout: number, doCallback: () => void): Promise<void> {
    return new Promise((res) => {
        setTimeout(() => {
            doCallback()
            res();
        }, timeout);
    })
}

export default function BeforeAfterSlider({
    firstImage,
    secondImage,
    startPercent = 50,
    className = '',
    withDemonstration,
    withResizeFeel = true,
}: Props) {
    const classNames = cn({
        'before-after-slider': true,
        [className]: Boolean(className),
    });
    const refContainer = useRef<HTMLDivElement>(null);
    const [imagesWidth, setImagesWidth] = useState<number | null>(null);
    const [delimerPersentPosition, setDelimerPosition] = useState(startPercent);
    const [sliderMode, setSliderMode] = useState<MODE>(MODE.DEFAULT);

    const [containerPosition, setContainerPosition] = useState({
        top: 0,
        left: 0,
    });
    const observerVisiblePersent = 0.95;
    const observerOptions = {
        threshold: [0.0, observerVisiblePersent],
    };

    const observerCallback = function(entries: IntersectionObserverEntry[]) {
        if (!observer) return;
        entries.forEach(entry => {
            if (entry.intersectionRatio > observerVisiblePersent) {
                observer.disconnect();
                setTimeout(async () => {
                    const PARTS = 50;
                    const timeSeconds = 0.1;
                    const borderMin = 35;
                    const delta = (startPercent - borderMin) / PARTS;
                    const timeout = timeSeconds / PARTS * 1000;
                    let currentPosition = delimerPersentPosition;
                    for (let i = 1; i <= PARTS; i++) {
                        await doWithDelay(timeout, () => {
                            currentPosition -= delta;
                            setDelimerPosition(currentPosition);
                        })
                    }
                    await doWithDelay(1000, () => {});
                    for (let i = 1; i <= PARTS; i++) {
                        await doWithDelay(timeout, () => {
                            currentPosition += delta;
                            setDelimerPosition(currentPosition);
                        })
                    }
                }, 500);
            }
        });
    };

    const [observer] = useState(
        withDemonstration && isIntersectionObserverSupport()
            ? new IntersectionObserver(observerCallback, observerOptions)
            : null
    );

    useEffect(() => {
        if (withResizeFeel) {
            window.addEventListener('resize', updateContainerWidth)
        }

    }, []);

    function updateContainerWidth() {
        if (!refContainer.current) return;
        const containerWidth = refContainer.current.offsetWidth as number;
        setImagesWidth(containerWidth);
    }

    useEffect(() => {
        updateContainerWidth();
        document.addEventListener('click', onMouseUpHandler)
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (observer) {
                if (!refContainer.current) return;
                observer.observe(refContainer.current)
            }
        }, 1500);

    }, [])

    const imgStyles = !imagesWidth ? undefined : {width: `${imagesWidth}px`};
    const secondImgContainerStyle = {width: `${delimerPersentPosition}%`};

    const delimerStyle = {left: `${delimerPersentPosition}%`};

    const updateContainerPosition = () => {
        if (!refContainer.current) return;
        const containerCoords = refContainer.current.getBoundingClientRect();

        setContainerPosition({
            top: containerCoords.top + pageYOffset,
            left: containerCoords.left + pageXOffset
        });
    }

    const onMouseDownHandler = () => {
        updateContainerPosition();
        setSliderMode(MODE.MOVE);
    }

    const onMouseUpHandler = () => {
        setSliderMode(MODE.DEFAULT);
    }

    const onMouseMoveHandler: MouseEventHandler<HTMLDivElement> = (e ) => onMoveHandler(e)

    const onTouchMoveHandler: TouchEventHandler<HTMLDivElement> = (e) => onMoveHandler(e.touches[0])

    // @ts-ignore
    const onMoveHandler = (e) => {
        if (sliderMode === MODE.MOVE) {
            if (!imagesWidth) return;
            const X = e.pageX - containerPosition.left;

            setDelimerPosition(normalizeNewPosition(X, imagesWidth) / imagesWidth * 100);
        }
    }

    return (
        <div
            ref={refContainer}
            className={classNames}
            onMouseDown={onMouseDownHandler}
            onMouseMove={onMouseMoveHandler}
            onTouchStart={onMouseDownHandler}
            onTouchMove={onTouchMoveHandler}
        >
            <img src={firstImage.imageUrl} className="before-after-slider__size-fix-img" onLoad={updateContainerWidth}/>
            {imagesWidth && (
                <>
                    <div className="before-after-slider__first-photo-container">
                        <img style={imgStyles} src={firstImage.imageUrl} />
                    </div>
                    <div className="before-after-slider__second-photo-container" style={secondImgContainerStyle}>
                        <img style={imgStyles} src={secondImage.imageUrl} />
                    </div>
                    <div className="before-after-slider__delimer" style={delimerStyle}>
                        <div  className="before-after-slider__delimer-icon-wrapper">
                            <div className="before-after-slider__delimer-icon"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
