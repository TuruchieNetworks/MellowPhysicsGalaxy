import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import ImageCarousel from '../carousels/ImageCarousel';
import useCarouselImages from '../hooks/UseCarouselImages';
import HeaderLinks from '../headers/HeaderLinks';
import Biography from '../layout/Bio';
import FallingGhoasts from '../physics_graphics/FallingGhoasts';
import ImageUtils from '../graphics/ImageUtils';
// import PhysicsAnimations from '../physics_graphics/PhysicsAnimations';
// import MusicBackground from '../backgroundVideos/MusicBackground';
// import blue_concert from '../../img/blue_concert.jpg';
// import globe_concert from '../../img/globe_concert.jpg';
// import metal_blocks from '../../img/metal_blocks.jpg';
// import vasil_guitar from '../../img/vasil_guitar.jpg';
// import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
// import bright_stage from '../../img/tube_concerts.avif';
// import blue_stage from '../../img/blue_stage_entrance.avif';
// import guitar_boy from '../../img/dark-greece.avif';
// import concert_lights from '../../img/bright-concert-lights.avif';
// import PerlinShader from '../surface_shaders/PerlinShader';
// import NoiseShader from '../surface_shaders/NoiseShader';
// Array of background images
// const images = [
//     globe_concert,
//     metal_blocks,
//     vasil_guitar,
//     concert_lights,
//     crowd_angle,
//     blue_stage,
//     guitar_boy,
//     blue_concert,
//     bright_stage
// ];
const Merchandise = () => {
    const videoRef = useRef(null);
    const intervalRef = useRef(null);
    const imageUtils = new ImageUtils();
    const images = imageUtils.getAllConcertImages();
    const { idx } = useCarouselImages(images);

    useEffect(() => {
        // Play the video when the component mounts
        if (videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error("Error attempting to play the video:", error);
            });
        }
    }, [idx]); // Empty dependency array to run once on mount

    return (
        <div
            id="showcase"
            style={{
                width: '100vw',
                height: '100vh',
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
            }}
        >
            <FallingGhoasts />
            <div className="container showcase-container imageCover"
            style={{
                width: '100vw',
                height: '100vh',
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
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
        {/* <PhysicsAnimations />  */}
        {/* <NoiseShader /> */}
        </div>
    );
};

export default Merchandise;
