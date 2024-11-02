import * as THREE from 'three';

class Particles {
    constructor(particleCount) {
        this.particles = [];
        this.particleCount = particleCount;

        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: 0xffdd44 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 10
            );
            this.particles.push(mesh);
        }
    }

    updateParticles() {
        this.particles.forEach((mesh) => {
            mesh.position.y -= 0.1; // Adjust the speed as needed
            if (mesh.position.y < -1) {
                mesh.position.y = Math.random() * 10 + 10; // Reset to above the ground
            }
        });
    }

    getParticles() {
        return this.particles;
    }
}

export default Particles;
