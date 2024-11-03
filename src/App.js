import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import NavBar from './components/headers/NavBar';
import About from './components/layout/About';
import Biography from './components/layout/Bio';
import Contact from './components/auth/Contact';
import Services from './components/auth/Services';
import Merchandise from './components/auth/Merchandise';
import ImageCarousel from './components/carousels/ImageCarousel';
import BackgroundCarousel from './components/carousels/BackgroundCarousel';
import MusicBackground from './components/backgroundVideos/MusicBackground';
import LandingBackground from './components/backgroundVideos/LandingBackground';
import BouncingSpheres from './components/physics_graphics/BouncingSpheres';
import PhysicsAnimations from './components/physics_graphics/PhysicsAnimations';
import { LoadedModels } from './components/loaded_models/LoadedModelTextures';
import { SpinningBox } from './components/loaded_models/LoadedModelTextures';
import ServicesGraphics from './components/layout/ServiceGraphics';
import AboutGraphics from './components/layout/AboutGraphics';
import MusicGraphics from './components/layout/MusicGraphics';

// Array of background images

function App() {
  return ( 
    <div style={{height: '100%'}}>
      <NavBar />
      <Routes>
        <Route exact path='/' element={<Navigate to='/Landing' />} />
        <Route exact path='/Landing' element={ <LandingBackground/> } />
        <Route exact path='/About' element={ <AboutGraphics /> } />
        <Route exact path='/Contact' element={ <Contact /> } />
        <Route exact path='/Services' element={ <ServicesGraphics /> } />
        <Route exact path='/Merchandise' element={ <Merchandise /> } />
        <Route exact path='/Visuals' element={ <AboutGraphics /> } />
        <Route exact path='/LoadedModels' element={ <LoadedModels /> } />
        <Route exact path='/BouncingSpheres' element={ <BouncingSpheres /> } />
        <Route exact path='/SpinningBox' element={ <SpinningBox /> } />
        <Route exact path='/PhysicsAnimations' element={ <PhysicsAnimations /> } />
        <Route exact path='/Music' element={ <MusicBackground /> } />
        <Route exact path='/MusicGraphics' element={ <MusicGraphics /> } />
        <Route exact path='/ImageCarousel' element={ <Biography /> } />
        <Route exact path='/ImageCarousel' element={ <ImageCarousel /> } />
        <Route exact path='/BackgroundCarousel' element={ <BackgroundCarousel /> } />
      </Routes>
    </div>
  );
}

export default App;