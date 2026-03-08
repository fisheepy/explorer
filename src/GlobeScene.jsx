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

function GlobeScene({ distributionPoints = [], rangePolygon = null }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
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

    const ambientLight = new THREE.AmbientLight(0x6b8ec5, 0.28);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(8, 2.5, 5);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x5ca2ff, 0.7);
    rimLight.position.set(-4, -2, -5);
    scene.add(rimLight);

    const overlayGroup = new THREE.Group();
    scene.add(overlayGroup);

    if (distributionPoints.length > 0) {
      const positions = new Float32Array(distributionPoints.length * 3);
      distributionPoints.forEach((point, index) => {
        const v = latLonToVector3(point.lat, point.lon, earthRadius + 0.03);
        positions[index * 3] = v.x;
        positions[index * 3 + 1] = v.y;
        positions[index * 3 + 2] = v.z;
      });

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pointsMaterial = new THREE.PointsMaterial({
        color: '#f59e0b',
        size: 0.03,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
      });
      overlayGroup.add(new THREE.Points(pointsGeometry, pointsMaterial));
    }

    if (rangePolygon && rangePolygon.length > 1) {
      const rangePoints = rangePolygon.map((point) => latLonToVector3(point.lat, point.lon, earthRadius + 0.035));
      const rangeGeometry = new THREE.BufferGeometry().setFromPoints(rangePoints);
      const rangeMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.95 });
      overlayGroup.add(new THREE.Line(rangeGeometry, rangeMaterial));
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.rotateSpeed = 0.45;

    let frameId;
    const animate = () => {
      earth.rotation.y += 0.00075;
      clouds.rotation.y += 0.00105;
      starfield.rotation.y += 0.00008;
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

      [earthMap, bumpMap, specMap, cloudMap, starMap].forEach((texture) => texture.dispose());

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
  }, [distributionPoints, rangePolygon]);

  return <div className="globe-scene" aria-label="太空视角地球+分布叠加" ref={containerRef} />;
}

export default GlobeScene;
