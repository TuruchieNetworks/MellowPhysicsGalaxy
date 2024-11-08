import React, { useRef, useEffect, useState } from 'react';
import logo_scene from '../../videos/logo_scene.mp4';
import '../../styles/VideoBackground.css';
import Landing from '../layout/Landing';
import ImageUtils from '../graphics/ImageUtils';
import useCarouselImages from '../hooks/UseCarouselImages';

// const images = [
//     landing_dj,
//     blue_concert,
//     globe_concert,
//     metal_blocks,
//     vasil_guitar
// ];
const LandingBackground = () => {
    // const [idx, setIdx] = useState(0); // current index of the image
    const intervalRef = useRef(null); // to hold the interval reference
    const videoRef = useRef(null); // Create a reference for the video element
    // const [idx, setIdx] = useState(0); // current index of the image
    const imageUtils = new ImageUtils();
    const images = imageUtils.getAllConcertImages();
    const { idx, changeImage } = useCarouselImages(images);

    useEffect(() => {
        // Play the video when the component mounts
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error("Error attempting to play the video:", error);
            });
        }
    }, []); // Empty dependency array to run once on mount

    // useEffect(() => {
    //     intervalRef.current = setInterval(run, 2000); // Start the interval

    //     return () => clearInterval(intervalRef.current); // Cleanup on unmount
    // }, []);

    // const run = () => {
    //     setIdx((prevIdx) => (prevIdx + 1) % images.length); // Loop back to the start
    // };

    return (
        <div className=""
            id="showcase"
            style={{
                backgroundImage: `url(${images[idx]})`,
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out',
                width: '100vw',
                // height: '100vh',
            }}
        >
            <video ref={videoRef} loop muted autoPlay style={{display: 'none'}}>
                <source src={logo_scene} type="video/mp4" />
                Your browser does not support HTML5 video.
            </video>
            <Landing/>
        </div>
    );
};

export default LandingBackground;
