// src/face-demo.js - Demonstrasi 2: face tracking (MindAR + Three.js)
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-face-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

// Menggunakan anchor index sekitar area hidung/mulut
const ANCHOR_INDEX = 1;
const MASK_SCALE = 1.0;

// Posisi masker (sesuaikan jika ingin digeser naik/turun)
const MASK_OFFSET = { x: 0, y: -0.08, z: 0.05 };

// Path file gambar masker Anda
const MASK_SRC = './assets/images/masker.png';

function buildMask() {
    const g = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        MASK_SRC,
        (texture) => {
            // Ukuran bidang masker (lebar, tinggi)
            const geometry = new THREE.PlaneGeometry(1.5, 0.75);

            // Menggunakan MeshBasicMaterial agar warna gambar tidak pudar/terpengaruh cahaya lampu
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });

            const maskMesh = new THREE.Mesh(geometry, material);
            g.add(maskMesh);
        },
        undefined,
        (error) => {
            console.error('Gagal memuat gambar masker:', error);
        }
    );

    g.scale.setScalar(MASK_SCALE);
    g.position.set(MASK_OFFSET.x, MASK_OFFSET.y, MASK_OFFSET.z);
    return g;
}

async function start() {
    const mindarThree = new MindARThree({ container: document.getElementById('container') });
    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(ANCHOR_INDEX);
    anchor.group.add(buildMask());

    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(0, 1, 2);
    scene.add(dir);

    await mindarThree.start();
    setStatus('Mencari wajah', 'searching');
    let hadFace = false, lostCount = 0;

    renderer.setAnimationLoop(() => {
        const hasFace = mindarThree.getLatestEstimate() !== null;
        if (hasFace !== hadFace) {
            hadFace = hasFace;
            if (hasFace) setStatus('Wajah terdeteksi', 'found');
            else { lostCount++; setStatus('Wajah tidak terdeteksi - mencari wajah', 'searching'); }
            document.getElementById('info').textContent = 'Wajah hilang ' + lostCount + ' kali.';
        }
        renderer.render(scene, camera);
    });
}

setupStartButton(start);