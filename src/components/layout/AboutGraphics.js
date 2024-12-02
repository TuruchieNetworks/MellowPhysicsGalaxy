import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import Biography from './Bio';
import HeaderLinks from '../headers/HeaderLinks';
import ImageUtils from '../graphics/ImageUtils';
import ImageCarousel from '../carousels/ImageCarousel';
import useCarouselImages from '../hooks/UseCarouselImages';
import FallingSand from '../physics_graphics/FallingSand';
// import blue_concert from '../../img/blue_concert.jpg';
// import globe_concert from '../../img/globe_concert.jpg';
// import landing_dj from '../../img/landing_dj.jpg';
// import metal_blocks from '../../img/metal_blocks.jpg';
// import vasil_guitar from '../../img/vasil_guitar.jpg';
// import PhysicsAnimations from '../physics_graphics/PhysicsAnimations';

// const images = [
//     landing_dj,
//     blue_concert,
//     globe_concert,
//     metal_blocks,
//     vasil_guitar
// ];

const AboutGraphics = ({ currentBackground, handlePrev, handleNext }) => {
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
                // height: '100vh',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out'
            }}
        >

            <FallingSand />

            <div className="container showcase-container imageCover"
                style={{
                    backgroundImage: `url(${images[idx]})`,
                    transition: 'background-image 0.5s ease-in-out',
                    width: '100vw',
                    // height: '100vh',
                    backgroundSize: 'cover', // Ensure the background covers the whole container
                    backgroundPosition: 'center', // Position the background image in the center
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
                    <Link to="/visuals" className="btn party-lights">
                        Visuals
                    </Link>
                </div> 
            </div>
            
            {/* <About /> */}
        </div>
    );
};

export default AboutGraphics;
