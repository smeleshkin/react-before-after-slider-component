import React, {MouseEventHandler, TouchEventHandler, useEffect, useRef, useState} from 'react';

import './styles.scss';

export function isIntersectionObserverSupport() {
    if (typeof window === 'undefined') return false;
    return Boolean(window.IntersectionObserver);
}

export interface Image {
    imageUrl: string;
    alt?: string,
}

type OnSliderLoadCallback = () => void;

enum MODE {
    MOVE = 'move',
    DEFAULT = 'default',
}

interface Props {
    firstImage: Image,
    secondImage: Image,
    currentPercentPosition?: number,
    className?: string,
    withResizeFeel?: boolean,
    onReady?: OnSliderLoadCallback,
    onVisible?: () => void,
    onChangePercentPosition?: (newPosition: number) => void,
    feelsOnlyTheDelimiter?: boolean,
    delimiterIconStyles?: React.CSSProperties,
    delimiterColor?: string,
    onChangeMode?: (newMode: MODE) => void,
}

type OnImageLoadCallback = (idx: 0 | 1) => void;

function useReadyStatus(
    imagesWidth: number | null,
    refContainer: React.RefObject<HTMLDivElement>,
    onReady?: OnSliderLoadCallback
) {
    const [isReady, setIsReady] = useState(false);

    const imagesLoadedRef = useRef<[boolean, boolean]>([false, false]);
    const onImageLoad = (idx: 0 | 1) => {
        const newImagesLoadedRef: [boolean, boolean] = [...imagesLoadedRef.current];
        newImagesLoadedRef[idx] = true;
        imagesLoadedRef.current = newImagesLoadedRef;
    }

    useEffect(() => {
        if (!isReady && imagesLoadedRef.current.every(Boolean) && imagesWidth && refContainer.current) {
            setIsReady(true);
        }
    }, [imagesLoadedRef.current, imagesWidth, isReady, refContainer.current]);

    useEffect(() => {
        if(isReady && onReady) {
            onReady();
        }
    }, [isReady]);

    return  {
        onImageLoad,
        isReady,
    };
}

function useInit(
    updateContainerWidth: () => void,
    onMouseUpHandler: () => void,
    firstImageRef: React.RefObject<HTMLImageElement>,
    onImageLoad: OnImageLoadCallback,
) {
    useEffect(() => {
        updateContainerWidth();
        // With ssr the first image may already be loaded. The second image only appears on the client.
        if (firstImageRef.current && firstImageRef.current.complete) {
            onImageLoad(0);
        }

        document.addEventListener('click', onMouseUpHandler);
        return () => {
            document.removeEventListener('click', onMouseUpHandler);
        }
    }, []);
}

function useResizeFeel(callback: () => void, withResizeFeel?: boolean) {
    useEffect(() => {
        if (withResizeFeel) {
            window.addEventListener('resize', callback);
        }

        return () => {
            window.removeEventListener('resize', callback);
        }
    }, []);
}

function normalizeNewPosition(newPosition: number, imagesWidth: number) {
    if (newPosition > imagesWidth) {
        return imagesWidth;
    }
    if (newPosition < 0) {
        return 0;
    }

    return newPosition;
}

const DEFAULT_START_PERCENT = 50;
const DEFAULT_BACKGROUND_COLOR = '#fff';

export default function BeforeAfterSlider({
    firstImage,
    secondImage,
    className,
    withResizeFeel = true,
    currentPercentPosition,
    onVisible,
    onReady,
    onChangePercentPosition,
    delimiterIconStyles,
    feelsOnlyTheDelimiter = false,
    delimiterColor = DEFAULT_BACKGROUND_COLOR,
    onChangeMode,
}: Props) {
    const classNames = ['before-after-slider'];
    className && classNames.push(className);

    const refContainer = useRef<HTMLDivElement>(null);
    const firstImageRef = useRef<HTMLImageElement>(null);

    const [imagesWidth, setImagesWidth] = useState<number | null>(null);
    const [delimiterPercentPosition, setDelimiterPosition] = useState(
        currentPercentPosition
        || DEFAULT_START_PERCENT
    );
    const [sliderMode, setSliderMode] = useState<MODE>(MODE.DEFAULT);
    const {onImageLoad, isReady} = useReadyStatus(imagesWidth, refContainer, onReady);
    const [containerPosition, setContainerPosition] = useState({
        top: 0,
        left: 0,
    });

    const onFirstImageLoad = () => {
        updateContainerWidth();
        onImageLoad(0);
    }

    /**
     * Observer start
     */
    const observerVisiblePercent = 0.95;
    const observerOptions = {
        threshold: [0.0, observerVisiblePercent],
    };
    const observerCallback = function(entries: IntersectionObserverEntry[]) {
        if (!observer || !onVisible) return;
        entries.forEach(entry => {
            if (entry.intersectionRatio > observerVisiblePercent) {
                observer.disconnect();
                onVisible();
            }
        });
    };
    const [observer] = useState(
        onVisible && isIntersectionObserverSupport()
            ? new IntersectionObserver(observerCallback, observerOptions)
            : null
    );
    useEffect(() => {
        if (observer) {
            if (!isReady) return;
            observer.observe(refContainer.current as HTMLDivElement);
        }
    }, [isReady]);
    /**
     * Observer end
     */

    useEffect(() => {
        if (!currentPercentPosition || !imagesWidth) {
            return;
        }
        setDelimiterPosition(normalizeNewPosition(currentPercentPosition, imagesWidth));
    }, [currentPercentPosition, imagesWidth]);

    const updateContainerWidth = () => {
        if (!refContainer.current) return;
        const containerWidth = refContainer.current.offsetWidth;
        setImagesWidth(containerWidth);
    }

    const onMouseUpHandler = () => {
        setSliderModeProxy(MODE.DEFAULT);
    }

    const setSliderModeProxy = (newMode: MODE) => {
        setSliderMode(newMode);
        onChangeMode && onChangeMode(newMode);
    }

    useInit(
        updateContainerWidth,
        onMouseUpHandler,
        firstImageRef,
        onImageLoad
    );

    const imgStyles = !imagesWidth ? undefined : {width: `${imagesWidth}px`};
    const secondImgContainerStyle = {width: `${delimiterPercentPosition}%`};

    const preparedDelimiterIconStyles = React.useMemo(() => ({
        backgroundColor: delimiterColor,
        ...(delimiterIconStyles ? delimiterIconStyles : {}),
    }), [delimiterColor, delimiterIconStyles]);

    const delimiterStyle = React.useMemo(() => ({
        left: `${delimiterPercentPosition}%`,
        backgroundColor: delimiterColor,
    }), [delimiterPercentPosition, delimiterColor]);

    const updateContainerPosition = () => {
        if (!refContainer.current) return;
        const containerCoords = refContainer.current.getBoundingClientRect();

        setContainerPosition({
            top: containerCoords.top + pageYOffset,
            left: containerCoords.left + pageXOffset,
        });
    }

    const onMouseDownHandler = () => {
        updateContainerPosition();
        setSliderModeProxy(MODE.MOVE);
    }

    const onMouseMoveHandler: MouseEventHandler<HTMLDivElement>
        = (e ) => onMoveHandler(e);

    const onTouchMoveHandler: TouchEventHandler<HTMLDivElement>
        = (e) => {
        onMoveHandler(e.touches[0]);
    };

    const onMoveHandler = (e: React.Touch | React.MouseEvent) => {
        if (sliderMode === MODE.MOVE) {
            if (!imagesWidth) return;
            const X = e.pageX - containerPosition.left;
            const newPosition = normalizeNewPosition(X, imagesWidth) / imagesWidth * 100;
            onChangePercentPosition
                ? onChangePercentPosition(newPosition)
                : setDelimiterPosition(newPosition);
        }
    }

    useResizeFeel(updateContainerWidth, withResizeFeel);

    const onClickHandlers = {
        onMouseDown: onMouseDownHandler,
        onTouchStart: onMouseDownHandler,
    }

    return (
        <div
            ref={refContainer}
            className={classNames.join(' ')}
            onMouseMove={onMouseMoveHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onMouseUpHandler}
            onTouchCancel={onMouseUpHandler}
            {...(!feelsOnlyTheDelimiter ? onClickHandlers : {})}
        >
            <div className="before-after-slider__first-photo-container">
                <img
                    src={firstImage.imageUrl}
                    onLoad={onFirstImageLoad}
                    draggable={false}
                    alt={firstImage.alt}
                    ref={firstImageRef}
                />
            </div>
            {Boolean(imagesWidth) && (
                <>
                    <div className="before-after-slider__second-photo-container" style={secondImgContainerStyle}>
                        <img
                            style={imgStyles}
                            src={secondImage.imageUrl}
                            onLoad={() => onImageLoad(1)}
                            draggable={false}
                            alt={secondImage.alt}
                        />
                    </div>
                    <div
                        className="before-after-slider__delimiter"
                        style={delimiterStyle}
                        {...feelsOnlyTheDelimiter ? onClickHandlers : {}}
                    >
                        <div>
                            <div
                                className="before-after-slider__delimiter-icon"
                                style={preparedDelimiterIconStyles}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
