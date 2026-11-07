'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeSceneMode } from '@/types/experience';

interface ThreeSceneCanvasProps {
  mode: ThreeSceneMode;
  primaryColor: string;
  secondaryColor: string;
  accentTertiary: string;
  particleCount?: number;
  orbitSpeed?: number;
  monogramInitials?: string;
  reducedMotion?: boolean;
}

export default function ThreeSceneCanvas({
  mode,
  primaryColor,
  secondaryColor,
  accentTertiary,
  particleCount = 950,
  orbitSpeed = 0.25,
  monogramInitials = 'F',
  reducedMotion = false,
}: ThreeSceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [hoveredPulse, setHoveredPulse] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      requestAnimationFrame(() => setWebglSupported(false));
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 6.2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColor, 2.4, 25);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondaryColor, 1.8, 25);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const color1 = new THREE.Color(primaryColor);
    const color2 = new THREE.Color(secondaryColor);
    const color3 = new THREE.Color(accentTertiary);

    // Construct geometry specifically tailored to the selected ThreeSceneMode
    if (mode === 'orbital_sanctuary' || mode === 'celestial_vault') {
      // Central celestial sphere + concentric astrolabe rings
      const coreGeo = new THREE.IcosahedronGeometry(1.25, mode === 'celestial_vault' ? 3 : 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: color1,
        wireframe: true,
        roughness: 0.25,
        metalness: 0.75,
        transparent: true,
        opacity: 0.65,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      rootGroup.add(coreMesh);

      const innerCoreGeo = new THREE.SphereGeometry(0.68, 24, 24);
      const innerCoreMat = new THREE.MeshStandardMaterial({
        color: color2,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.88,
      });
      rootGroup.add(new THREE.Mesh(innerCoreGeo, innerCoreMat));

      // Three interlocking meridian rings
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(1.75 + i * 0.42, 0.018, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? color1 : color3,
          transparent: true,
          opacity: 0.55 - i * 0.1,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = (Math.PI / 3) * i + 0.4;
        ring.rotation.y = (Math.PI / 4) * i;
        rootGroup.add(ring);
      }
    } else if (mode === 'kinetic_monogram') {
      // Sculptural polyhedral architectural knot + floating precision frames
      const knotGeo = new THREE.TorusKnotGeometry(1.18, 0.28, 110, 16, 2, 3);
      const knotMat = new THREE.MeshStandardMaterial({
        color: color1,
        wireframe: true,
        roughness: 0.2,
        metalness: 0.8,
      });
      rootGroup.add(new THREE.Mesh(knotGeo, knotMat));

      const frameGeo = new THREE.OctahedronGeometry(2.15, 0);
      const frameMat = new THREE.MeshBasicMaterial({
        color: color2,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      rootGroup.add(new THREE.Mesh(frameGeo, frameMat));
    } else if (mode === 'bauhaus_totem') {
      // Constructivist stack of primary architectural forms
      const boxGeo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
      const boxMat = new THREE.MeshStandardMaterial({
        color: color1,
        roughness: 0.3,
        metalness: 0.4,
        wireframe: false,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = -0.5;
      rootGroup.add(box);

      const coneGeo = new THREE.ConeGeometry(0.95, 1.5, 4);
      const coneMat = new THREE.MeshStandardMaterial({
        color: color2,
        wireframe: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 1.05;
      rootGroup.add(cone);

      const ringGeo = new THREE.TorusGeometry(2.1, 0.03, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: color3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      rootGroup.add(ring);
    } else {
      // botanical_particles / phyllotaxis Fibonacci spiral sculpture
      const groupSpiral = new THREE.Group();
      const count = 48;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y) * 1.65;
        const theta = goldenAngle * i;
        const nodeGeo = new THREE.OctahedronGeometry(0.11, 0);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? color1 : i % 2 === 0 ? color2 : color3,
          roughness: 0.3,
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(theta) * radius, y * 1.65, Math.sin(theta) * radius);
        groupSpiral.add(node);
      }
      rootGroup.add(groupSpiral);
    }

    // Surrounding particle starfield / spore field
    const safeParticleCount = Math.min(1200, Math.max(250, particleCount));
    const positions = new Float32Array(safeParticleCount * 3);
    for (let i = 0; i < safeParticleCount; i++) {
      const r = 2.4 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: color1,
      size: 0.036,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
      targetX = nx * 0.65;
      targetY = -ny * 0.65;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    let frameId = 0;
    const speedFactor = reducedMotion ? 0.05 : orbitSpeed;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      rootGroup.rotation.y += 0.0045 * (speedFactor * 3.5);
      rootGroup.rotation.x += (targetY * 0.5 - rootGroup.rotation.x) * 0.05;
      rootGroup.rotation.z += (targetX * 0.35 - rootGroup.rotation.z) * 0.05;
      particleSystem.rotation.y -= 0.0008 * (speedFactor * 3);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [mode, primaryColor, secondaryColor, accentTertiary, particleCount, orbitSpeed, reducedMotion]);

  if (!webglSupported) {
    return (
      <div
        className="relative flex items-center justify-center w-full h-full min-h-[360px] overflow-hidden"
        aria-label="Architectural Geometric Fallback Canvas"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-72 h-72 opacity-80 transition-transform duration-700"
        >
          <circle
            cx="200"
            cy="200"
            r="155"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <circle
            cx="200"
            cy="200"
            r="115"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          <polygon
            points="200,55 325,275 75,275"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.2"
            opacity="0.6"
          />
          <polygon
            points="200,345 325,125 75,125"
            fill="none"
            stroke={accentTertiary}
            strokeWidth="1.2"
            opacity="0.6"
          />
          <text
            x="200"
            y="218"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="54"
            fontFamily="serif"
          >
            {monogramInitials}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full min-h-[380px] select-none"
      onMouseEnter={() => setHoveredPulse(true)}
      onMouseLeave={() => setHoveredPulse(false)}
    >
      <div ref={mountRef} className="w-full h-full min-h-[380px]" />
      <div
        className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] tracking-widest uppercase opacity-65 transition-opacity"
        style={{ color: primaryColor }}
      >
        3D WEBGL · {mode.replace(/_/g, ' ')} {hoveredPulse ? '· INTERACTIVE ORBIT ACTIVE' : ''}
      </div>
    </div>
  );
}
