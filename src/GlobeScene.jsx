import { useEffect, useMemo, useRef } from 'react';
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

function latLonToCanvasPoint(lat, lon, width, height) {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

function drawCountryHighlight(context, width, height, country) {
  context.beginPath();
  country.boundary.forEach(([lat, lon], index) => {
    const { x, y } = latLonToCanvasPoint(lat, lon, width, height);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.closePath();
  context.fillStyle = 'rgba(245, 158, 11, 0.52)';
  context.fill();
  context.strokeStyle = 'rgba(255, 251, 235, 0.95)';
  context.lineWidth = 2;
  context.stroke();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    image.src = url;
  });
}

async function createOSMTexture(selectedCountry) {
  const zoom = 3;
  const tileSize = 256;
  const tilesPerAxis = 2 ** zoom;
  const width = tilesPerAxis * tileSize;
  const height = tilesPerAxis * tileSize;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  context.fillStyle = '#0a2b57';
  context.fillRect(0, 0, width, height);

  await Promise.all(
    Array.from({ length: tilesPerAxis }).flatMap((_, x) =>
      Array.from({ length: tilesPerAxis }).map(async (_, y) => {
        const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
        const image = await loadImage(url);
        context.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
      })
    )
  );

  if (selectedCountry) {
    drawCountryHighlight(context, width, height, selectedCountry);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createFallbackTexture(selectedCountry) {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  context.fillStyle = '#0a2b57';
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(173, 216, 255, 0.22)';
  context.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const { x } = latLonToCanvasPoint(0, lon, width, height);
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let lat = -60; lat <= 60; lat += 30) {
    const { y } = latLonToCanvasPoint(lat, 0, width, height);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (selectedCountry) {
    drawCountryHighlight(context, width, height, selectedCountry);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function createBoundaryLine(boundary, radius, highlighted) {
  const points = boundary.map(([lat, lon]) => latLonToVector3(lat, lon, radius));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: highlighted ? 0xfbbf24 : 0x8bd3ff,
    transparent: true,
    opacity: highlighted ? 1 : 0.75,
  });
  return new THREE.Line(geometry, material);
}

function GlobeScene({ countries, selectedCountryId, onCountrySelect }) {
  const containerRef = useRef(null);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === selectedCountryId),
    [countries, selectedCountryId]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    const directionalLight = new THREE.DirectionalLight(0x9bc1ff, 1.25);
    directionalLight.position.set(5, 3, 5);
    scene.add(ambientLight, directionalLight);

    const globeRadius = 1.2;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 128, 128),
      new THREE.MeshStandardMaterial({
        color: '#1b4d91',
        metalness: 0.05,
        roughness: 0.92,
        emissive: '#08234f',
        emissiveIntensity: 0.2,
      })
    );
    scene.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius + 0.04, 64, 64),
      new THREE.MeshBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
      })
    );
    scene.add(atmosphere);

    let worldTexture;
    let disposed = false;

    createOSMTexture(selectedCountry)
      .then((texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        worldTexture = texture;
        globe.material.map = worldTexture;
        globe.material.needsUpdate = true;
      })
      .catch(() => {
        const fallbackTexture = createFallbackTexture(selectedCountry);
        if (disposed) {
          fallbackTexture.dispose();
          return;
        }
        worldTexture = fallbackTexture;
        globe.material.map = worldTexture;
        globe.material.needsUpdate = true;
      });

    const boundariesGroup = new THREE.Group();
    const markersGroup = new THREE.Group();
    globe.add(boundariesGroup, markersGroup);

    const markerMeshes = [];
    countries.forEach((country) => {
      const boundary = createBoundaryLine(country.boundary, globeRadius + 0.004, country.id === selectedCountryId);
      boundariesGroup.add(boundary);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 18, 18),
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
    controls.rotateSpeed = 0.58;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.enablePan = false;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const down = { x: 0, y: 0, moved: false };

    const onPointerDown = (event) => {
      down.x = event.clientX;
      down.y = event.clientY;
      down.moved = false;
    };

    const onPointerMove = (event) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) {
        down.moved = true;
      }
    };

    const onPointerUp = (event) => {
      if (down.moved) {
        return;
      }

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
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    let animationFrameId;
    const render = () => {
      globe.rotation.y += 0.0005;
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
      disposed = true;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
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

      if (worldTexture) {
        worldTexture.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [countries, onCountrySelect, selectedCountry, selectedCountryId]);

  return <div className="globe-scene" ref={containerRef} aria-label="3D globe scene with open geographic data" />;
}

export default GlobeScene;
