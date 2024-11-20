class TwoDPencil {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.drawing = false;
    this.coordinates = []; // Store x, y points drawn

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Bind the methods to the instance
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClearCanvas = this.handleClearCanvas.bind(this);
  }

  handleMouseDown(e) {
    this.drawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Start the path
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    // Add initial point to coordinates
    this.coordinates.push({ x, y });
  }

  handleMouseMove(e) {
    if (!this.drawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw the line
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // Save coordinates
    this.coordinates.push({ x, y });
  }

  handleMouseUp() {
    this.drawing = false;
  }

  handleClearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.coordinates = []; // Clear saved coordinates
  }

  getCoordinates() {
    return this.coordinates;
  }

  resetCoordinates() {
    this.coordinates = [];
  }

  setCanvasSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Method to create 3D vertices from the 2D coordinates
  createVerticesFromPencil() {
    // Assuming you want to convert 2D points (x, y) to 3D vertices with z = 0
    return this.coordinates.map((point) => new THREE.Vector3(point.x, point.y, 0));
  }
}

export default TwoDPencil;
