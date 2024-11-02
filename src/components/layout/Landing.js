import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';
import '../../styles/PlayerAnimations.css';
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
import FallingInstancedSand from '../physics_graphics/FallingInstancedSands';
import PerlinShader from '../surface_shaders/PerlinShader';
import NoiseShader from '../surface_shaders/NoiseShader';

const Landing = () => {
    return (
        <div id="showcase">
            <NoiseShader />
            {/* <NoiseShaderMaterial /> */}
            <PerlinShader />
            <FallingSand />
            <PhysicsAnimations />
            {/* <SphereAnimationScene /> */}
            {/* <div className="galaxial-animations"></div> */}
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
            <MusicBackground />
            <PhysicsAnimations />
            <About />
            {/* <PerlinShader /> */}
            <BackgroundCarousel />
            <FallingInstancedSand />
            {/* <VideoBackground/> */}
            <PhysicsAnimations />
        </div>
    );
};

export default Landing;