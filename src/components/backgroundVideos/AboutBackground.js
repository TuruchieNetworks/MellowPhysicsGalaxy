import React, { useRef, useEffect } from 'react';
import logo_scene from '../../videos/logo_scene.mp4';
import '../../styles/VideoBackground.css';
import Landing from '../layout/Landing';
import About from '../layout/About';

const AboutBackground = () => {
    const videoRef = useRef(null); // Create a reference for the video element

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
            //backgroundImage: `url(${images[idx]})`,
            transition: 'background-image 0.5s ease-in-out',
            width: '100vw',
            height: '100vh',
            // backgroundSize: 'cover', 
            // backgroundPosition: 'center',
        }}
        >
            <video ref={videoRef} loop muted autoPlay>
                <source src={logo_scene} type="video/mp4" />
                Your browser does not support HTML5 video.
            </video>
            <Landing/>
            <About/>
        </div>
    );
};

export default AboutBackground;
