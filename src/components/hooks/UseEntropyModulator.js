import { useState, useEffect, useRef } from 'react';

const useEntropyModulator = () => {
    const [hovered, setHovered] = useState(false);
    const materialRef = useRef();

    // Update the shader material properties based on hover state
    useEffect(() => {
        const animate = () => {
            if (materialRef.current) {
                // Example: Modify shader time or any other property based on the hovered state
                materialRef.current.uniforms.time.value += 0.05; // Update time for animation

                // Apply hover effect
                materialRef.current.uniforms.hovered.value = hovered ? 1.0 : 0.0; // Use hovered state
            }
            requestAnimationFrame(animate);
        };
        animate();

        // Cleanup function to prevent memory leaks
        return () => {
            materialRef.current = null;
        };
    }, [hovered]);

    const hoverProps = {
        onPointerOver: () => setHovered(true),
        onPointerOut: () => setHovered(false),
    };

    return { materialRef, hoverProps };
};

export default useEntropyModulator;
