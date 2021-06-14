import React from 'react';

import BeforeAfterSlider, {Image} from '../src';

const FIRST_IMAGE: Image = {
    id: 1,
    imageUrl: '/assets/image1.jpg',
}

const SECOND_IMAGE: Image = {
    id: 1,
    imageUrl: '/assets/image2.jpg',
}

export default function App() {
    return (
        <div>
            <BeforeAfterSlider firstImage={FIRST_IMAGE} secondImage={SECOND_IMAGE} />
        </div>
    );
}
