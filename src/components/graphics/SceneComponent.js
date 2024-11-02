import React, { useEffect } from 'react';
import useColorUtils from '../hooks/UseColorUtils';

const SceneComponent = () => {
    const { randomHexColor, randomRgbaColor } = useColorUtils();

    useEffect(() => {
        // Example usage of random color functions
        const hexColor = randomHexColor();
        const rgbaColor = randomRgbaColor();
        console.log('Random Hex Color:', hexColor);
        console.log('Random RGBA Color:', rgbaColor);
        
        // You can use these colors in your scene setup or materials
        // For example, setting a background color or material color
    }, [randomHexColor, randomRgbaColor]);

    return (
        <div>
            <h1>Sphere Animation SceneComponent</h1>
            {/* Additional scene elements */}
        </div>
    );
};

export default SceneComponent;
