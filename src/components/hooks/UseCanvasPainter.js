import { useState, useRef } from 'react';

export function useCanvasPainter() {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState([]);

    const handleMouseMove = (e) => {
        if (e.buttons !== 1) return; // Only draw when the left mouse button is pressed
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints((prev) => [...prev, { x, y }]);
    };

    const clearCanvas = () => setPoints([]);

    return { canvasRef, points, handleMouseMove, clearCanvas };
}



// function Canvas2D() {
//   const { canvasRef, points, handleMouseMove, clearCanvas } = useCanvasDrawing();

//   return (
//       <div>
//           <canvas
//               ref={canvasRef}
//               width={500}
//               height={500}
//               style={{ border: '1px solid black' }}
//               onMouseMove={handleMouseMove}
//           />
//           <button onClick={clearCanvas}>Clear</button>
//       </div>
//   );
// }


// import { Canvas2D } from './Canvas2D';
// import { useEffect, useState } from 'react';
// import * as THREE from 'three';

// function ThreeCanvasIntegration() {
//     const { points } = useCanvasDrawing();
//     const [scene, setScene] = useState(null);

//     useEffect(() => {
//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         const renderer = new THREE.WebGLRenderer();

//         camera.position.z = 100;
//         renderer.setSize(window.innerWidth, window.innerHeight);
//         document.body.appendChild(renderer.domElement);

//         setScene(scene);

//         const animate = () => {
//             requestAnimationFrame(animate);
//             renderer.render(scene, camera);
//         };

//         animate();
//     }, []);

//     useEffect(() => {
//         if (scene) {
//             extrudeCanvasDrawing(points, scene);
//         }
//     }, [points, scene]);

//     return <Canvas2D />;
// }
