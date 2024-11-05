import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import '../../styles/PlayerAnimations.css';
import blue_concert from '../../img/blue_concert.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import ImageCarousel from '../carousels/ImageCarousel';
import BackgroundCarousel from '../carousels/BackgroundCarousel';
import MusicBackground from '../backgroundVideos/MusicBackground';
import VideoBackground from '../backgroundVideos/VideoBackground';
import About from './About';
import HeaderLinks from '../headers/HeaderLinks';
import Biography from './Bio';
import PhysicsAnimations from '../physics_graphics/PhysicsAnimations';
import GalaxialScene from '../physics_graphics/GalaxialScene';
import SphereAnimationScene from '../physics_graphics/SphereAnimationScene';
import NoisePlane from '../surface_shaders/NoisePlane';
import NoiseShaderMaterial from '../surface_shaders/NoiseShaderMaterial';
import FallingSand from '../physics_graphics/FallingSand';
import GalaxialFallingSandPlane from '../physics_graphics/GalaxialFallingSandPlane';
import FallingInstancedSand from '../physics_graphics/FallingInstancedSands';
import SphereDrops from '../physics_graphics/SphereDropss';
import PerlinShader from '../surface_shaders/PerlinShader';
import NoiseShader from '../surface_shaders/NoiseShader';

const images = [
    landing_dj,
    blue_concert,
    globe_concert,
    metal_blocks,
    vasil_guitar
];

const Landing = () => {
    const [idx, setIdx] = useState(0); // current index of the image
    return (
        <div id="showcase">
            <SphereDrops /> 
            {/* <GalaxialFallingSandPlane /> */}
            {/* <NoiseShaderMaterial /> */}
            {/*
            <NoiseShader />
            <FallingSand />*/}
            {/* <SphereAnimationScene /> */}
            {/* <div className="galaxial-animations"></div> */}
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
                    <Link to="/about" className="btn party-lights">
                        Read More
                    </Link>
                </div>
            </div>
            {/* <MusicBackground /> */}
            <About />
            {/* <PerlinShader /> */}
            {/* <BackgroundCarousel /> */}
            {/* <FallingInstancedSand /> */}
            {/* <VideoBackground/> */}
            {/* <PerlinShader /> */}

            {/* <PhysicsAnimations /> */}
            {/* <div className='profileShowcase' style={{
                backgroundImage: `url(${images[idx]})`,
                width: '100vw',
                // height: '100vh',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out'
            }}>
            </div> */}
        </div>
    );
};

export default Landing;