import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import useBackgroundImages from '../hooks/UseBackgroundImages';
import ImageCarousel from '../carousels/ImageCarousel';
import HeaderLinks from '../headers/HeaderLinks';
import Biography from '../layout/Bio';
import blue_concert from '../../img/blue_concert.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import bright_stage from '../../img/tube_concerts.avif';
import blue_stage from '../../img/blue_stage_entrance.avif';
import guitar_boy from '../../img/dark-greece.avif';
import concert_lights from '../../img/bright-concert-lights.avif';

const images = [
    globe_concert,
    metal_blocks,
    vasil_guitar,
    concert_lights,
    crowd_angle,
    blue_stage,
    guitar_boy,
    blue_concert,
    bright_stage
];

const Music = () => {
    const { idx } = useBackgroundImages(images); // Use the custom hook
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
            backgroundImage: `url(${images[idx]})`,
            transition: 'background-image 0.5s ease-in-out',
            width: '100vw',
            height: '100vh',
            // backgroundSize: 'cover', 
            // backgroundPosition: 'center',
        }}
        >
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

export default Music;
