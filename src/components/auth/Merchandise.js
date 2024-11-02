import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import ImageCarousel from '../carousels/ImageCarousel';
// import logo from '../../img/logo.jpg'; 
// import pose_brown_gradient from '../../img/pose_brown_gradient.jpg'; 
// import pose_gaze_brown from '../../img/pose_gaze_brown.jpg'; 
// import smiling_pose_brown from '../../img/smiling_pose_brown.jpg'; 
// import solid_pose_kharki from '../../img/solid_pose_kharki.jpg'; 
import HeaderLinks from '../headers/HeaderLinks';
import useCarouselImages from '../hooks/UseCarouselImages';
import Bio from '../layout/Bio';

// Array of background images
// const images = [
//     logo,
//     pose_brown_gradient,
//     pose_gaze_brown,
//     smiling_pose_brown,
//     solid_pose_kharki,
// ];

const Merchandise = ({ images }) => {
    const intervalRef = useRef(null);
    const videoRef = useRef(null);
    const { idx, changeImage } = useCarouselImages(images);
    console.log(changeImage)

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
            <div className="container showcase-container imageCover">
                <div className='flex-carousel'>
                    <div className='showcase-container'>
                        <ImageCarousel />
                    </div>
                    <div className='pcBio'>
                        <Bio />
                    </div>
                </div>
                <div className='phoneBio'>
                    <Bio />
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

export default Merchandise;
