import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import '../../styles/PlayerAnimations.css';
import ImageCarousel from '../carousels/ImageCarousel';
import HeaderLinks from '../headers/HeaderLinks';
import Biography from './Bio';
import ImageUtils from '../graphics/ImageUtils';
import useCarouselImages from '../hooks/UseCarouselImages';
import MusicBackground from '../backgroundVideos/MusicBackground';
import GalaxialFallingSandPlane from '../physics_graphics/GalaxialFallingSandPlane';

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

const Landing = () => {
    // const [idx, setIdx] = useState(0); // current index of the image
    const imageUtils = new ImageUtils();
    const images = imageUtils.getAllConcertImages();
    const { idx } = useCarouselImages(images);
    return (
        <div id="showcase"
            style={{
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
                width: '100vw',
                // height: '100vh',
                backgroundSize: 'cover', // Ensure the background covers the whole container
                backgroundPosition: 'center', // Position the background image in the center
            }}>
            <GalaxialFallingSandPlane />
            {/*
            <SphereDrops />
            <NoiseShader />
            <FallingSand />
            <NoiseShaderMaterial /> 
            <PhysicsAnimations />
            <SphereAnimationScene />
            */}
            <div id="galaxial-showcase" style={{
                backgroundImage: `url(${images[idx]})`,
                transition: 'background-image 0.5s ease-in-out',
                width: '100vw',
                // height: '100vh',
                backgroundSize: 'cover', // Ensure the background covers the whole container
                backgroundPosition: 'center', // Position the background image in the center
            }}>
                <div className="galaxial-contents">
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
            </div>
            <MusicBackground />
            {/* <VideoBackground/> */}
        </div>
    );
};

export default Landing;