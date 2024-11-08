import sun from '../../galaxy_imgs/sun.jpg';
import stars from '../../galaxy_imgs/stars.jpg';
import mars from '../../galaxy_imgs/mars.jpg';
import earth from '../../galaxy_imgs/earth.jpg';
import saturn from '../../galaxy_imgs/saturn.jpg';
import venus from '../../galaxy_imgs/venus.jpg';
import nebula from '../../galaxy_imgs/nebula.jpg';
import jupiter from '../../galaxy_imgs/jupiter.jpg';
import blue_concert from '../../img/blue_concert.jpg';
import landing_dj from '../../img/landing_dj.jpg';
import globe_concert from '../../img/globe_concert.jpg';
import metal_blocks from '../../img/metal_blocks.jpg';
import vasil_guitar from '../../img/vasil_guitar.jpg';
import crowd_angle from '../../img/angle_outdoor_concerts.jpg';
import bright_stage from '../../img/tube_concerts.avif';
import blue_stage from '../../img/blue_stage_entrance.avif';
import guitar_boy from '../../img/dark-greece.avif';
import concert_lights from '../../img/bright-concert-lights.avif';

class ImageUtils {
    constructor() {
        this.images = {
            concerts: [
                landing_dj,
                blue_concert,
                globe_concert,
                metal_blocks,
                vasil_guitar,
                concert_lights,
                crowd_angle,
                blue_stage,
                guitar_boy,
                bright_stage,
            ],
            galaxies: [
                sun,
                stars,
                mars,
                venus,
                earth,
                saturn,
                nebula,
                jupiter,
            ],
        };
    }

    // Method to get a random image from a specified category
    getRandomImage(category) {
        const categoryImages = this.images[category];
        if (categoryImages && categoryImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * categoryImages.length);
            return categoryImages[randomIndex];
        }
        return null; // Return null if category is not found or has no images
    }

    // Method to get all images from a specified category
    getAllImages(category) {
        return this.images[category] || []; // Return an empty array if category not found
    }

    // Method to get all images from a specified category
    getAllConcertImages() {
        return this.images['concerts'] || []; // Return an empty array if category not found
    }

    // Method to get all images from a specified category
    getAllGalaxialImages() {
        return this.images['galaxies'] || []; // Return an empty array if category not found
    }
}

export default ImageUtils;
