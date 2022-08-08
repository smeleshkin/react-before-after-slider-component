import React, {useRef, useState} from 'react';
import BeforeAfterSlider from '../src';

import './app.scss';

const IMG_BASE_PATH = '/react-before-after-slider-component';

function createImageUrl(url: string): string {
    return window.location.host.includes('localhost')
        ? url
        : `${IMG_BASE_PATH}/${url}`;
}

const DEMONSTRATION_DELAY = 500;

const DEFAULT_DURATION = 800;
type Animation = {
    start: number,
    end: number,
    duration: number;
}
const START_POSITION = 55;
const END_POSITION_1 = 35;
const END_POSITION_2 = 80
const ANIMATIONS: Animation[] = [
    {
        start: START_POSITION,
        end: END_POSITION_1,
        duration: DEFAULT_DURATION,
    },
    // pause
    {
        start: END_POSITION_1,
        end: END_POSITION_1,
        duration: 30,
    },
    {
        start: END_POSITION_1,
        end: END_POSITION_2,
        duration: DEFAULT_DURATION,
    },
];

const DELIMITER_WITH_LOGO_STYLES = {
    width: '50px',
    height: '50px',
    backgroundSize: 'cover',
    borderRadius: 'none',
}

function timePhaseToCoordinadeDifferenceCoefficient(x: number) {
    return (Math.sin(x * Math.PI - Math.PI / 2) + 1) / 2;
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

    const [feelsOnlyTheDelimiter, setFeelsOnlyTheDelimiter] = useState<boolean>(false);
    const toggleFeelsOnlyTheDelimiter = () => setFeelsOnlyTheDelimiter(!feelsOnlyTheDelimiter);
    const [delimiterPersentPosition, setDelimiterPercentPosition] = useState<number>(START_POSITION);

    const logoUrl = React.useMemo(() => createImageUrl(`/assets/logo.png`), []);
    const [delimiterIconStyles, setDelimiterIconStyles] = useState<React.CSSProperties | undefined>();
    const toggleDelimiterIconStyles = () => setDelimiterIconStyles(
        !delimiterIconStyles
            ? {...DELIMITER_WITH_LOGO_STYLES, backgroundImage: `url(${logoUrl})`}
            : undefined
    );

    /** Animation start */
    const allAnimationsRef = useRef<Animation[]>([]);
    const animationStartTimeRef = useRef<number | null>(null);
    const animationPositionsRef = useRef<Animation | null>(null);
    const animate = (timestamp: number) => {
        let animationPositions = animationPositionsRef.current;

        if (!animationPositions) {
            const currentAnimation = allAnimationsRef.current.shift();
            if (!currentAnimation) {
                return;
            }
            animationPositions = animationPositionsRef.current = currentAnimation;
        }

        let animationStartTime = animationStartTimeRef.current;
        if (!animationStartTime) {
            animationStartTime = animationStartTimeRef.current = timestamp;
        }

        const {
            start: animationStartPosition,
            end: animationEndPosition,
            duration: animationDuration
        } = animationPositions;

        if (timestamp > animationStartTime + animationDuration) {
            // End of animation
            setDelimiterPercentPosition(animationEndPosition);
            animationPositionsRef.current = null;
            animationStartTimeRef.current = null;
        } else {
            const animationPhase = (timestamp - animationStartTime) / animationDuration;
            const coordinatesDifference =
                (animationEndPosition - animationStartPosition)
                * timePhaseToCoordinadeDifferenceCoefficient(animationPhase);

            setDelimiterPercentPosition(animationStartPosition + coordinatesDifference);
        }


        window.requestAnimationFrame(animate);
    }

    const demonstrate = () => {
        allAnimationsRef.current = [...ANIMATIONS];
        setTimeout(() => window.requestAnimationFrame(animate), DEMONSTRATION_DELAY);
    };
    /** Animation end */

    const buttonText = [
        'Now:',
        (feelsOnlyTheDelimiter ? 'Only separator' : 'All area'),
        'is clickable'
    ].join(' ');

    const toggleIconStylesButtonText = [
        'Now: Delimiter icon',
        (delimiterIconStyles ? 'with' : 'without'),
        'custom styles',
    ].join(' ');

    return (
        <div className="app">
            <div className="app__content-wrapper">
                <BeforeAfterSlider
                    currentPercentPosition={delimiterPersentPosition}
                    firstImage={firstImage}
                    secondImage={secondImage}
                    onVisible={demonstrate}
                    onChangePercentPosition={setDelimiterPercentPosition}
                    feelsOnlyTheDelimiter={feelsOnlyTheDelimiter}
                    delimiterIconStyles={delimiterIconStyles}
                />
                <div className="app__buttons">
                    <div>
                        <button onClick={toggleFeelsOnlyTheDelimiter}>
                             {buttonText}
                        </button>
                    </div>
                    <div>
                        <button onClick={toggleDelimiterIconStyles}>
                            {toggleIconStylesButtonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
