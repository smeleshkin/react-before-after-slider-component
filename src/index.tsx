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
    delimiterColor?: string,
}

function useReadyStatus(
    imagesWidth: number | null,
    refContainer: React.RefObject<HTMLDivElement>,
    onReady?: OnSliderLoadCallback
) {
    const [isReady, setIsReady] = useState(false);
    

    const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
    const incrementLoadedImagesCount = () => {
        setImagesLoadedCount(imagesLoadedCount + 1);
    }

    useEffect(() => {
        if (!isReady && imagesLoadedCount === 2 && imagesWidth && refContainer.current) {
            setIsReady(true);
        }
    }, [imagesLoadedCount, imagesWidth, isReady, refContainer.current]);

    useEffect(() => {
        if(isReady && onReady) {
            onReady();
        }
    }, [isReady]);

    return  {
        onImageLoad: incrementLoadedImagesCount,
        isReady,
    };
}

function useInit(updateContainerWidth: () => void, onMouseUpHandler: () => void) {
    
    

    useEffect(() => {
        updateContainerWidth();
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

const DEFAULT_START_PERSENT = 50;

export default function BeforeAfterSlider({
    firstImage,
    secondImage,
    className,
    withResizeFeel = true,
    currentPercentPosition,
    onVisible,
    onReady,
    onChangePercentPosition,
    delimiterColor,
}: Props) {
    const classNames = ['before-after-slider'];
    className && classNames.push(className);

    const refContainer = useRef<HTMLDivElement>(null);
    const [imagesWidth, setImagesWidth] = useState<number | null>(null);
    const [delimerPercentPosition, setDelimerPosition] = useState(
        currentPercentPosition
        || DEFAULT_START_PERSENT
    );
    const [sliderMode, setSliderMode] = useState<MODE>(MODE.DEFAULT);
    const {onImageLoad, isReady} = useReadyStatus(imagesWidth, refContainer, onReady);
    const [containerPosition, setContainerPosition] = useState({
        top: 0,
        left: 0,
    });
    const [isMobile, setIsMobile] = useState(false);
    const [isDelimiterClicked, setIsDelimiterClicked] = useState(false);
    /**
     * Observer start
     */
    const observerVisiblePersent = 0.95;
    const observerOptions = {
        threshold: [0.0, observerVisiblePersent],
    };
    const observerCallback = function(entries: IntersectionObserverEntry[]) {
        if (!observer || !onVisible) return;
        entries.forEach(entry => {
            if (entry.intersectionRatio > observerVisiblePersent) {
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
        if(typeof window !== "undefined"){
            if(window.innerWidth < 769){
                setIsMobile(true);
            }else{
                setIsMobile(false);
            }
        }
    },[]);

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
        setDelimerPosition(normalizeNewPosition(currentPercentPosition, imagesWidth));
    }, [currentPercentPosition, imagesWidth]);

    const updateContainerWidth = () => {
        if (!refContainer.current) return;
        const containerWidth = refContainer.current.offsetWidth;
        setImagesWidth(containerWidth);
    }

    const onMouseUpHandler = () => {
        setSliderMode(MODE.DEFAULT);
    }

    useInit(updateContainerWidth, onMouseUpHandler);

    const imgStyles = !imagesWidth ? undefined : {width: `${imagesWidth}px`};
    const secondImgContainerStyle = {width: `${delimerPercentPosition}%`};
    const delimiterIconStyles = {
        backgroundColor: delimiterColor,
    };
    const delimiterPositionStyle = {
        left: `${delimerPercentPosition}%`,
        backgroundColor: delimiterColor,
    };

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

        if(!isMobile){
            setSliderMode(MODE.MOVE);
        }
        //setSliderMode(MODE.MOVE);
    }

    const onMouseMoveHandler: MouseEventHandler<HTMLDivElement>
        = (e ) => {
            onMoveHandler(e);
        }

    const onTouchMoveHandler: TouchEventHandler<HTMLDivElement>
        = (e) => {
        if(isDelimiterClicked){
            console.log("delimitador tocado");
            setSliderMode(MODE.MOVE);
            onMoveHandler(e.touches[0]);
        }
    };

    const onMoveHandler = (e: React.Touch | React.MouseEvent) => {
        if (sliderMode === MODE.MOVE) {
            if (!imagesWidth) return;
            const X = e.pageX - containerPosition.left;
            const newPosition = normalizeNewPosition(X, imagesWidth) / imagesWidth * 100;
            onChangePercentPosition ? onChangePercentPosition(newPosition) : setDelimerPosition(newPosition);
        }
    }

    useResizeFeel(updateContainerWidth, withResizeFeel);

    return (
        <div
            ref={refContainer}
            className={classNames.join(' ')}
            onMouseDown={onMouseDownHandler}
            onMouseMove={onMouseMoveHandler}
            onTouchStart={onMouseDownHandler}
            onTouchMove={onTouchMoveHandler}
        >
            <img src={firstImage.imageUrl} className="before-after-slider__size-fix-img" onLoad={updateContainerWidth}/>
            {Boolean(imagesWidth) && (
                <>
                    <div className="before-after-slider__first-photo-container">
                        <img
                            style={imgStyles}
                            src={firstImage.imageUrl}
                            onLoad={onImageLoad}
                            draggable={false}
                            alt={firstImage.alt}
                        />
                    </div>
                    <div className="before-after-slider__second-photo-container" style={secondImgContainerStyle}>
                        <img
                            style={imgStyles}
                            src={secondImage.imageUrl}
                            onLoad={onImageLoad}
                            draggable={false}
                            alt={firstImage.alt}
                        />
                    </div>
                    <div className="before-after-slider__delimiter" style={delimiterPositionStyle}
                        onTouchStart={() => {
                            console.log("touch start");
                            setIsDelimiterClicked(true);
                        }}
                        onTouchMove={() => {
                            console.log("touch move");
                            setIsDelimiterClicked(true);
                        }}
                        onTouchEnd={() => {
                            console.log("touch end");
                            setIsDelimiterClicked(false);
                        }}
                        onTouchCancel={() => {
                            console.log("touch cancel");
                            setIsDelimiterClicked(false);
                        }}>
                        <div>
                            <div className="before-after-slider__delimiter-icon" style={delimiterIconStyles}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
