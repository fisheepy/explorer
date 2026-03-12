import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const TEXTURES = {
  earthDay: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  earthBump: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  earthSpec: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
  stars: 'https://threejs.org/examples/textures/galaxy_starfield.png',
};

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function cameraPositionForFocus(focus, distance = 4.25) {
  if (!focus) {
    return new THREE.Vector3(0, 0.1, distance);
  }

  const direction = latLonToVector3(focus.lat, focus.lon, 1).normalize();
  return direction.multiplyScalar(distance);
}

function createMarkerButton(cluster, onClick, iconUrl, iconLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'globe-marker';
  button.setAttribute('aria-label', `Show ${iconLabel || 'species'} image at ${cluster.lat.toFixed(1)}, ${cluster.lon.toFixed(1)}`);
  if (iconUrl) {
    const image = document.createElement('img');
    image.className = 'globe-marker-icon';
    image.src = iconUrl;
    image.alt = '';
    image.draggable = false;
    button.appendChild(image);
  } else {
    const dot = document.createElement('span');
    dot.className = 'globe-marker-dot';
    button.appendChild(dot);
  }
  button.addEventListener('click', onClick);
  return button;
}

function GlobeScene({
  distributionClusters = [],
  rangePolygon = null,
  speciesIconUrl = null,
  speciesIconLabel = '',
  autoFocusTarget = null,
  previewImages = [],
  previewTitle = '',
}) {
  const containerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const activePreviewImage = previewImages[previewIndex] ?? null;

  useEffect(() => {
    setIsPreviewVisible(false);
    setPreviewIndex(0);
  }, [previewImages]);

  useEffect(() => {
    const container = containerRef.current;
    const markerLayer = markerLayerRef.current;
    if (!container || !markerLayer) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.copy(cameraPositionForFocus(autoFocusTarget, 4.25));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'globe-canvas';
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const [earthMap, bumpMap, specMap, cloudMap, starMap] = [
      loader.load(TEXTURES.earthDay),
      loader.load(TEXTURES.earthBump),
      loader.load(TEXTURES.earthSpec),
      loader.load(TEXTURES.clouds),
      loader.load(TEXTURES.stars),
    ];

    const starfield = new THREE.Mesh(
      new THREE.SphereGeometry(900, 64, 64),
      new THREE.MeshBasicMaterial({ map: starMap, side: THREE.BackSide })
    );
    scene.add(starfield);

    const earthRadius = 1.45;
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadius, 128, 128),
      new THREE.MeshPhongMaterial({
        map: earthMap,
        bumpMap,
        bumpScale: 0.04,
        specularMap: specMap,
        specular: new THREE.Color('#1b5e83'),
        shininess: 10,
      })
    );
    scene.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.48, 128, 128),
      new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      })
    );
    scene.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.53, 128, 128),
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color('#6cb8ff') },
          viewVector: { value: camera.position },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          uniform vec3 glowColor;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vPositionNormal), 3.2);
            gl_FragColor = vec4(glowColor * intensity, intensity * 0.82);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      })
    );
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x6b8ec5, 0.34));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.9);
    sunLight.position.set(8, 2.5, 5);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x5ca2ff, 0.82);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    if (rangePolygon && rangePolygon.length > 1) {
      const rangePoints = rangePolygon.map((point) => latLonToVector3(point.lat, point.lon, earthRadius + 0.035));
      const rangeGeometry = new THREE.BufferGeometry().setFromPoints(rangePoints);
      const rangeMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.95 });
      const rangeLine = new THREE.Line(rangeGeometry, rangeMaterial);
      earth.add(rangeLine);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 7;
    controls.rotateSpeed = 0.45;

    let shouldAutoRotate = true;
    const markerEntries = distributionClusters.map((cluster) => {
      const anchor = latLonToVector3(cluster.lat, cluster.lon, earthRadius + 0.05);
      const scale = Math.min(1.28, 0.92 + Math.log2(cluster.count + 1) * 0.14);
      const button = createMarkerButton(cluster, () => {
        if (previewImages.length > 0) {
          setIsPreviewVisible(true);
        }
      }, speciesIconUrl, speciesIconLabel);
      button.style.setProperty('--marker-scale', `${scale}`);
      markerLayer.appendChild(button);
      return { anchor, button };
    });

    let frameId;
    const worldPosition = new THREE.Vector3();
    const projected = new THREE.Vector3();

    const updateMarkerPositions = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      markerEntries.forEach(({ anchor, button }) => {
        worldPosition.copy(anchor);
        earth.localToWorld(worldPosition);

        projected.copy(worldPosition).project(camera);
        if (projected.z < -1 || projected.z > 1) {
          button.classList.remove('visible');
          return;
        }

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;

        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.classList.add('visible');
      });
    };

    const animate = () => {
      if (shouldAutoRotate && !isPreviewVisible) {
        earth.rotation.y += 0.0011;
        clouds.rotation.y += 0.00145;
        starfield.rotation.y += 0.00008;
      }

      controls.update();
      updateMarkerPositions();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      updateMarkerPositions();
    };

    const onPointerEnter = () => {
      shouldAutoRotate = false;
    };

    const onPointerLeave = () => {
      shouldAutoRotate = true;
    };

    window.addEventListener('resize', onResize);
    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(frameId);
      controls.dispose();
      markerEntries.forEach(({ button }) => button.remove());

      [earthMap, bumpMap, specMap, cloudMap, starMap].forEach((texture) => texture.dispose());

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((material) => material.dispose());
          else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [distributionClusters, rangePolygon, speciesIconUrl, speciesIconLabel, autoFocusTarget, previewImages, isPreviewVisible]);

  return (
    <div className="globe-scene" aria-label="Space view globe with species markers" ref={containerRef}>
      <div className="globe-marker-layer" ref={markerLayerRef} aria-hidden="true" />
      {activePreviewImage?.url ? (
        <button
          type="button"
          className={`globe-image-preview ${isPreviewVisible ? 'visible' : ''}`}
          onClick={() => setIsPreviewVisible(false)}
          aria-label={`Hide ${previewTitle || 'species'} preview`}
        >
          <img
            src={activePreviewImage.url}
            alt={`${previewTitle || 'Species'} preview`}
            className="globe-image-preview-photo"
            onError={() => {
              if (previewIndex < previewImages.length - 1) {
                setPreviewIndex((current) => current + 1);
                return;
              }

              setIsPreviewVisible(false);
            }}
          />
        </button>
      ) : null}
    </div>
  );
}

export default GlobeScene;
