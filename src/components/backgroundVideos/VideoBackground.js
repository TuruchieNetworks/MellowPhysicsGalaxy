import React, { useRef, useEffect } from 'react';
import logo_scene from '../../videos/logo_scene.mp4';
import '../../styles/VideoBackground.css';

const VideoBackground = () => {
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
        <div className="video-background">
            <video ref={videoRef} loop muted autoPlay>
                <source src={logo_scene} type="video/mp4" />
                Your browser does not support HTML5 video.
            </video>
        </div>
    );
};

export default VideoBackground;
