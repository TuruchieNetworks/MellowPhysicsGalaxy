// hooks/useGenerateCloudTexture.js

import { useEffect, useState } from 'react';
import SimplexNoise from 'simplex-noise';

const canvasSize = 512; // Size of the canvas for noise texture

const useGenerateCloudTexture = () => {
    const [cloudTexture, setCloudTexture] = useState(null);

    useEffect(() => {
        const noise = new SimplexNoise();

        // Generate fractal noise
        const generateCloudTexture = () => {
            const data = new Uint8Array(canvasSize * canvasSize * 4);
            for (let y = 0; y < canvasSize; y++) {
                for (let x = 0; x < canvasSize; x++) {
                    const value = noise.noise2D(x / 100, y / 100); // Adjust frequency for density
                    const color = Math.floor((value + 1) * 128); // Normalize to 0-255
                    const idx = (x + y * canvasSize) * 4;
                    data[idx] = color;    // Red
                    data[idx + 1] = color; // Green
                    data[idx + 2] = color; // Blue
                    data[idx + 3] = 255;   // Alpha
                }
            }

            const texture = new ImageData(data, canvasSize, canvasSize);
            return texture;
        };

        const texture = generateCloudTexture();
        setCloudTexture(texture);
    }, []);

    return cloudTexture;
};

export default useGenerateCloudTexture;