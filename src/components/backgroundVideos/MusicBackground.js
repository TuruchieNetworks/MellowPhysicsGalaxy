import React, { useRef, useEffect } from 'react';
import logo_scene from '../../videos/logo_scene.mp4';
import '../../styles/VideoBackground.css';
import Music from '../auth/Music';
import useBackgroundImages from '../hooks/UseBackgroundImages';
import blue_concert from '../../img/blue_concert.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';

const images = [
    landing_dj,
    blue_concert,
    globe_concert,
    metal_blocks,
    vasil_guitar
];

const MusicBackground = () => {
    const videoRef = useRef(null); // Create a reference for the video element
    const { idx } = useBackgroundImages(images); // Use the custom hook

    useEffect(() => {
        // Play the video when the component mounts
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error("Error attempting to play the video:", error);
            });
        }
    }, []); // Empty dependency array to run once on mount

    return (
        <div className=""
            id="showcase"
            style={{
                backgroundImage: `url(${images[idx]})`,
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out',
                width: '100vw',
                height: '100vh',
            }}
        >
            <video ref={videoRef} loop muted autoPlay style={{display: 'none'}}>
                <source src={logo_scene} type="video/mp4" />
                Your browser does not support HTML5 video.
            </video>
            <Music/>
        </div>
    );
};

export default MusicBackground;
