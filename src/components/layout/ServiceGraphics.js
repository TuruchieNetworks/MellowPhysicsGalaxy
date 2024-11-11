import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import ImageCarousel from '../carousels/ImageCarousel';
import HeaderLinks from '../headers/HeaderLinks';
import useCarouselImages from '../hooks/UseCarouselImages';
import Biography from '../layout/Bio'; 
import PerlinShader from '../surface_shaders/PerlinShader';
import GalaxialFallingSandPlane from '../physics_graphics/GalaxialFallingSandPlane';
import ImageUtils from '../graphics/ImageUtils';
import MusicBackground from '../backgroundVideos/MusicBackground';
import NoiseShader from '../surface_shaders/NoiseShader';

// const images = [
//     landing_dj,
//     blue_concert,
//     globe_concert,
//     metal_blocks,
//     vasil_guitar
// ];
// import BackgroundCarousel from '../carousels/BackgroundCarousel';
// import VideoBackground from '../backgroundVideos/VideoBackground';
// import PhysicsAnimations from '../physics_graphics/PhysicsAnimations';
// import NoisePlane from '../surface_shaders/NoisePlane';
// import NoiseShaderMaterial from '../surface_shaders/NoiseShaderMaterial';
// import FallingSand from '../physics_graphics/FallingSand';
// import FallingInstancedSand from '../physics_graphics/FallingInstancedSands';
// import SphereDrops from '../physics_graphics/SphereDrops';
// import PerlinShader from '../surface_shaders/PerlinShader';
// import NoiseShader from '../surface_shaders/NoiseShader';



const ServicesGraphics = () => {
    const intervalRef = useRef(null); // to hold the interval reference    
    const imageUtils = new ImageUtils();
    const images = imageUtils.getAllConcertImages();
    const { idx} = useCarouselImages(images);
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
        // <div className="video-background App"
        <div
            id="showcase"
            style={{
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
                // height: '100vh',
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
            }}
        >
        <PerlinShader />
        <backgroundImage/>
            <div className="container showcase-container imageCover"
            style={{
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
                // height: '100vh',
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
            }}>
                <div className='flex-carousel'>
                    <div className='showcase-container'>
                        <ImageCarousel />
                    </div>
                    <div className='pcBio'>
                        <Biography />
                    </div>
                </div>
                <div className='phoneBio'>
                    <Biography />
                </div>
                <div className='phone-state'>
                <HeaderLinks />
                <Link to="/about" className="btn party-lights">
                    Read More
                </Link>
                </div>
            </div>
        {/* <GalaxialFallingSandPlane/> */}
        </div>
    );
};

export default ServicesGraphics;
