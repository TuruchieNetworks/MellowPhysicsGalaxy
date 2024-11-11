import React, { useEffect, useRef, useState } from 'react';
import '../../styles/ImageCarousel.css';
import CarouselButton from './CarouselButton';
import useCarousel from '../hooks/UseCarousel';
import purple_crowd from '../../img/purple_crowd.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import blue_stage from '../../img/blue_stage_entrance.avif';
import bright_purple_stage from '../../img/bright_purple_stage.jpg';
import concert_lights from '../../img/bright-concert-lights.avif';

const images = [
    globe_concert,
    metal_blocks,
    vasil_guitar,
    concert_lights,
    crowd_angle,
    blue_stage,
    bright_purple_stage,
    metal_blocks,
    purple_crowd
];


// object-fit: contain; /* Ensure images cover the area */
const ImageCarousel = () => {
    const { idx, handleNext, handlePrev } = useCarousel(images); // Use the custom hook



    return (
        <div>
            <div className="Carousel">
                <div
                    className="image-container"
                    id="imgs"
                    style={{
                        transform: `translateX(${-idx * 100}%)`, transition: 'transform 0.5s ease-in-out'
                    }}
                >
                    {images.map((image, idx) => (
                        <img
                            src={image}
                            alt={`image-${idx}`}
                            key={idx}
                            // style={{
                            //     width: '500px',
                            //     objectFit: 'cover'
                            // }}
                        />
                    ))}
                </div>
                <div className='btn-container'>
                    <CarouselButton direction="left" handleClick={handlePrev} />
                    <CarouselButton direction="right" handleClick={handleNext} />
                </div>
            </div>
        </div>
    );
};

export default ImageCarousel;
