import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createBoundaryLine(boundary, radius) {
  const points = boundary.map(([lat, lon]) => latLonToVector3(lat, lon, radius));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x8bd3ff, transparent: true, opacity: 0.85 });
  return new THREE.Line(geometry, material);
}

function GlobeScene({ countries, selectedCountryId, onCountrySelect }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    const directionalLight = new THREE.DirectionalLight(0x9bc1ff, 1.25);
    directionalLight.position.set(5, 3, 5);
    scene.add(ambientLight, directionalLight);

    const globeRadius = 1.2;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 64, 64),
      new THREE.MeshStandardMaterial({
        color: '#1d4ed8',
        metalness: 0.1,
        roughness: 0.85,
        emissive: '#0b1e6d',
        emissiveIntensity: 0.25,
      })
    );
    scene.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius + 0.04, 64, 64),
      new THREE.MeshBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    const boundariesGroup = new THREE.Group();
    const markersGroup = new THREE.Group();
    scene.add(boundariesGroup, markersGroup);

    const markerMeshes = [];
    countries.forEach((country) => {
      const boundary = createBoundaryLine(country.boundary, globeRadius + 0.004);
      boundariesGroup.add(boundary);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.023, 16, 16),
        new THREE.MeshStandardMaterial({ color: country.id === selectedCountryId ? 0xf59e0b : 0xf8fafc })
      );
      marker.position.copy(latLonToVector3(country.center.lat, country.center.lon, globeRadius + 0.03));
      marker.userData = { countryId: country.id };
      markerMeshes.push(marker);
      markersGroup.add(marker);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.enablePan = false;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(markerMeshes);
      if (intersections.length > 0) {
        onCountrySelect(intersections[0].object.userData.countryId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    let animationFrameId;
    const render = () => {
      globe.rotation.y += 0.0012;
      boundariesGroup.rotation.y += 0.0012;
      markersGroup.rotation.y += 0.0012;
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.cancelAnimationFrame(animationFrameId);
      controls.dispose();

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [countries, onCountrySelect, selectedCountryId]);

  return <div className="globe-scene" ref={containerRef} aria-label="3D globe scene with country map" />;
}

export default GlobeScene;
