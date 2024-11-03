import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import ImageCarousel from '../carousels/ImageCarousel';
import HeaderLinks from '../headers/HeaderLinks';
import useCarouselImages from '../hooks/UseCarouselImages';
import Biography from '../layout/Bio'; 
import metal_blocks from '../../img/metal_blocks.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import blue_concert from '../../img/blue_concert.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import PerlinShader from '../surface_shaders/PerlinShader';

// Array of background images
const images = [
    landing_dj,
    metal_blocks,
    globe_concert,
    blue_concert,
    vasil_guitar
];

const Services = () => {
    const intervalRef = useRef(null); // to hold the interval reference
    const { idx, changeImage } = useCarouselImages(images);
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
        <div className="video-background App"
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
            <div className="container showcase-container imageCover">
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
        </div>
    );
};

export default Services;
