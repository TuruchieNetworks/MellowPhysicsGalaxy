export class Controls {
  constructor(scene, camera) {
      this.scene = scene;
      this.camera = camera;
      this.setupEvents();
  }

  setupEvents() {
      window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
  }
}