import { useEffect, useRef } from 'react';
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

function cameraPositionForFocus(focus, distance = 4.2) {
  if (!focus) {
    return new THREE.Vector3(0, 0.2, distance);
  }

  const dir = latLonToVector3(focus.lat, focus.lon, 1).normalize();
  return dir.multiplyScalar(distance);
}

function createIconTexture(icon) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 44, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(2, 9, 28, 0.78)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
  ctx.stroke();

  ctx.font = '62px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, size / 2, size / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function GlobeScene({ distributionClusters = [], rangePolygon = null, speciesIcon = '📍', autoFocusTarget = null }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    const targetCameraPos = cameraPositionForFocus(autoFocusTarget, 4.2);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

    scene.add(new THREE.AmbientLight(0x6b8ec5, 0.28));
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(8, 2.5, 5);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x5ca2ff, 0.7);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    const overlayGroup = new THREE.Group();
    earth.add(overlayGroup);

    const iconTexture = createIconTexture(speciesIcon);
    const spriteMaterial = new THREE.SpriteMaterial({ map: iconTexture, transparent: true, depthWrite: false });

    distributionClusters.forEach((cluster) => {
      const sprite = new THREE.Sprite(spriteMaterial.clone());
      sprite.position.copy(latLonToVector3(cluster.lat, cluster.lon, earthRadius + 0.06));
      const scale = Math.min(0.23, 0.09 + Math.log2(cluster.count + 1) * 0.028);
      sprite.scale.set(scale, scale, 1);
      overlayGroup.add(sprite);
    });

    if (rangePolygon && rangePolygon.length > 1) {
      const rangePoints = rangePolygon.map((point) => latLonToVector3(point.lat, point.lon, earthRadius + 0.035));
      const rangeGeometry = new THREE.BufferGeometry().setFromPoints(rangePoints);
      const rangeMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.95 });
      overlayGroup.add(new THREE.Line(rangeGeometry, rangeMaterial));
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.rotateSpeed = 0.45;

    let frameId;
    let focusBlend = 0;

    const animate = () => {
      earth.rotation.y += 0.00075;
      clouds.rotation.y += 0.00105;
      starfield.rotation.y += 0.00008;

      if (focusBlend < 1) {
        focusBlend = Math.min(1, focusBlend + 0.045);
        camera.position.lerp(targetCameraPos, focusBlend);
      }

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      controls.dispose();

      [earthMap, bumpMap, specMap, cloudMap, starMap, iconTexture].forEach((texture) => texture.dispose());

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [distributionClusters, rangePolygon, speciesIcon, autoFocusTarget]);

  return <div className="globe-scene" aria-label="太空视角地球+聚簇图标叠加" ref={containerRef} />;
}

export default GlobeScene;
