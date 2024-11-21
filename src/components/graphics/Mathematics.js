import { matrix, inv, multiply } from 'mathjs';  // Import matrix utilities from mathjs

class Mathematics {
  constructor(scene, world = null, camera, textureLoader) {
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.textureLoader = textureLoader || new THREE.TextureLoader();

    // Default points for fallback
    this.defaultPoints = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 6 },
      { x: 3, y: 10 },
      { x: 4, y: 15 }
    ];

    // Initialize points as either twodpencil's output or the default
    this.points = this.getPointsFromPencil() || this.defaultPoints;
    this.area = this.integrateTrapezoidal(this.points);  // Recalculate area if points are updated
  }

  // Example method to check for twodpencil's points (you can modify this based on how twodpencil provides data)
  getPointsFromPencil() {
    if (window.twodpencil && Array.isArray(window.twodpencil.coordinates)) {
      return window.twodpencil.coordinates; // Assuming twodpencil gives an array of {x, y} points
    }
    return null; // If no valid data, return null
  }

  // Fit polynomial using least squares method
  fitPolynomial(points, degree = 2) {
    const xVals = points.map(p => p.x);
    const yVals = points.map(p => p.y);
    
    // Construct the Vandermonde matrix for the polynomial terms (x^0, x^1, x^2, ..., x^degree)
    const X = [];
    for (let i = 0; i < points.length; i++) {
      let row = [];
      for (let j = 0; j <= degree; j++) {
        row.push(Math.pow(xVals[i], j)); // x^0, x^1, x^2, ..., x^degree
      }
      X.push(row);
    }

    // Convert X to a mathjs matrix
    const XMatrix = matrix(X);
    const yMatrix = matrix(yVals);

    // Solve the normal equation: (X^T * X) * coefficients = X^T * y
    const Xt = XMatrix.transpose();
    const XtX = multiply(Xt, XMatrix);
    const XtX_inv = inv(XtX);
    const XtY = multiply(Xt, yMatrix);
    
    // Get the coefficients
    const coefficients = multiply(XtX_inv, XtY);

    // Return the polynomial coefficients
    return coefficients.toArray().map(c => c[0]);
  }

  // Find Derivative of a function
  findDerivative() {
    const func = "x^2 + 3*x - 2"; // Example polynomial
    const diff = simplify(derivative(func, 'x'));
    console.log('First Derivative:', diff.toString());

    const secondDiff = simplify(derivative(diff, 'x'));
    console.log('Second Derivative:', secondDiff.toString());
  }

  // Integrate using the Trapezoidal Rule (Dynamic points)
  integrateTrapezoidal(points = this.points) {
    let totalArea = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i + 1].x;
      const y2 = points[i + 1].y;

      // Area of a trapezoid
      totalArea += 0.5 * (x2 - x1) * (y1 + y2);
    }
    return totalArea;
  }

  // Tabulate the coordinates for graphing or other use
  tabulateCoordinates(points = this.points) {
    return points.map(point => ({ x: point.x, y: point.y }));
  }

  // Get coordinates for extrusion (used for 3D visualization)
  getCoordinatesForExtrusion(points) {
    return points.map(point => new THREE.Vector2(point.x, point.y));
  }

  // Method for plotting the graph using D3 (using dynamic points)
  plotGraphWithD3(points) {
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const xScale = d3.scaleLinear()
        .domain([d3.min(points, d => d.x), d3.max(points, d => d.x)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(points, d => d.y), d3.max(points, d => d.y)])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

    // Plot line
    svg.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add circles for each point
    svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 4)
        .attr("fill", "red");
  }

  // Method to generate graph from pencil or default coordinates
  generateGraph() {
    this.plotGraphWithD3(this.tabulateCoordinates(this.points));
  }
}

export default Mathematics;












/*/ Example Usageconst
points = [{x: 0, y: 1}, {x: 1, y: 3}, {x: 2, y: 6}, {x: 3, y: 10}, {x: 4, y: 15}];
const degree = 2;  // Quadratic fit
const coefficients = mathematics.fitPolynomial(points, degree);
console.log('Polynomial Coefficients:', coefficients);

const rawPoints = [
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 6 }
];
console.log("Tabulated Coordinates:", tabulateCoordinates(rawPoints));
*/