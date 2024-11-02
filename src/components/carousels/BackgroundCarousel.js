import React from 'react';
import Biography from '../layout/Bio';
import ImageCarousel from './ImageCarousel';
import useCarouselImages from '../hooks/UseCarouselImages';
import blue_concert from '../../img/blue_concert.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';

const images = [
    landing_dj,
    blue_concert,
    globe_concert,
    metal_blocks,
    vasil_guitar
];

const BackgroundCarousel = () => {
  const { idx, changeImage } = useCarouselImages(images);
  // console.log(changeImage);

  return (
    <div className="Carousel"
      style={{
        backgroundImage: `url(${images[idx]})`,
        transition: 'background-image 0.5s ease-in-out',
        width: '100vw',
        height: '100vh', 
        backgroundSize: 'cover', // Ensure the background covers the whole container
        backgroundPosition: 'center', // Position the background image in the center
      }}>
      <div className="background-container">
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
      </div>
    </div>
  )
};

export default BackgroundCarousel;