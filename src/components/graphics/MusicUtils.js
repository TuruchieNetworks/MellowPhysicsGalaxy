import NeverChange from '../../media/NeverChange.mp3'; // Importing the uploaded music file

class MusicUtils {
  constructor() {
    this.musicList = this.getMusicList();  // Get the music list
    this.musicTracks = this.getCategorizedMusicList();  // Get the categorized music list
  }

  // Simulate getting a list of music from an uploaded folder
  getMusicList() {
    return [{
      title: "Never Change", // Simulated track name (entered by the user)
      originalTrackName: this.getOriginalTrackName(NeverChange), // Retrieve original file name dynamically
      artist: "Animate", // Artist name
      genre: "Music", // Genre
      file: this.getFileUrl(NeverChange), // Dynamically retrieve file URL/path
    }];
  }

  // Method to simulate retrieving the original file name (similar to Java)
  getOriginalTrackName(file) {
    // This would typically use file operations to extract the file name, here it's done with string manipulation
    const fileName = file.split('/').pop(); // Extracts the file name from the file path
    return fileName;
  }

  // Method to return the file URL dynamically, simulating the retrieval of a file path
  getFileUrl(file) {
    // You can replace this with an actual URL if the file is hosted on a server or cloud
    const baseUrl = '/media/';  // Simulate the base directory for media files
    return `${baseUrl}${this.getOriginalTrackName(file)}`;  // Combine base path and file name
  }

  // Simulate categorizing music based on genre or other attributes
  getCategorizedMusicList() {
    return this.musicList.reduce((categorized, track) => {
      if (!categorized[track.genre]) {
        categorized[track.genre] = [];
      }
      categorized[track.genre].push(track);
      return categorized;
    }, {});
  }

  // Get a track by its genre or title for testing purposes
  getTrackByGenre(genre) {
    return this.musicTracks[genre] || [];
  }

  // Play the music using the typical audio.play() method
  playTrack() {
    const audio = new Audio(this.musicList[0].file);
    audio.play();
  }

  // Example: Using Three.js for music-related visualizations (stub function)
  setupThreeJSVisualization() {
    // Here we would initiate Three.js for rendering music-related animations
    console.log("Setting up Three.js visualization for track:", this.musicList[0].title);
  }
}

export default MusicUtils