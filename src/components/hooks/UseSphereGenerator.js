// UseSphereGenerator.js
import { useEffect } from 'react';
import * as THREE from 'three';

const UseSphereGenerator = (addSphere, gravity, setClickedSpheres, clickedSpheres, camera, scene) => {
  // Create necessary vectors and raycaster
  const mouse = new THREE.Vector2();
  const intersectionPoint = new THREE.Vector3();
  const planeNormal = new THREE.Vector3();
  const newPlane = new THREE.Plane();
  const raycaster = new THREE.Raycaster();

  useEffect(() => {
      // Handle mouse click
      const handleClick = (event) => {
          // Update mouse coordinates
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          // Set the plane normal and update the raycaster
          planeNormal.copy(camera.position).normalize();
          newPlane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
          raycaster.setFromCamera(mouse, camera);
          raycaster.ray.intersectPlane(newPlane, intersectionPoint);

          // Check intersections with spheres
          const intersects = raycaster.intersectObjects(clickedSpheres.map(sphere => sphere.mesh));

          if (intersects.length > 0) {
              const intersectedSphere = intersects[0].object;

              // Handle sphere logic here (e.g., changing color, velocity, etc.)
              const sphereData = { mesh: intersectedSphere, velocity: new THREE.Vector3(0, 0, 0) };
              addSphere(sphereData);
              setClickedSpheres(prev => [...prev, sphereData]); // Add clicked sphere to state
          }
      };

      // Handle mouse movement
      const handleMouseMove = (event) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          // Set plane normal and update raycaster
          planeNormal.copy(camera.position).normalize();
          newPlane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
          raycaster.setFromCamera(mouse, camera);
          raycaster.ray.intersectPlane(newPlane, intersectionPoint);
      };

      // Add event listeners for click and mouse move
      window.addEventListener('click', handleClick);
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
          window.removeEventListener('click', handleClick);
          window.removeEventListener('mousemove', handleMouseMove);
      };
  }, [addSphere, gravity, clickedSpheres, camera, scene]); // Include camera and scene as dependencies
};

export default UseSphereGenerator;