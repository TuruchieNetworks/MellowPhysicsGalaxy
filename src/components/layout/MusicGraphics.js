import React, { useEffect, useRef } from 'react';
import '../../App.css';
import useCarouselImages from '../hooks/UseCarouselImages';
import Music from '../auth/Music';
import ImageUtils from '../graphics/ImageUtils';
import MusicClouds from '../physics_graphics/MusicClouds';


const MusicGraphics = () => {
    const imageUtils = new ImageUtils();
    const images = imageUtils.getAllConcertImages();
    const { idx } = useCarouselImages(images);
    const videoRef = useRef(null); 

    useEffect(() => {
        // Play the video when the component mounts
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error("Error attempting to play the video:", error);
            });
        }
    }, []); // Empty dependency array to run once on mount

    return (
        <div
            id="showcase"
            style={{
            backgroundImage: `url(${images[idx]})`,
            width: '100vw',
            height: '100vh',
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            transition: 'background-image 0.5s ease-in-out'
        }}
        >
        <MusicClouds/>
        <Music />
        </div>
    );
};

export default MusicGraphics;
