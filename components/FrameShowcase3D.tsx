"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const slideSpecs = [
  { frame: "#8c5a2b", mat: "#f5ecdb", accent: "#c79a50", art: ["#6f1d1b", "#e9c46a", "#31572c"] },
  { frame: "#151515", mat: "#f8f3ea", accent: "#d6b25e", art: ["#1d3557", "#a8dadc", "#f1faee"] },
  { frame: "#f4efe6", mat: "#fffaf1", accent: "#b08968", art: ["#2a9d8f", "#264653", "#e76f51"] },
  { frame: "#5c4033", mat: "#f4ead8", accent: "#e0b45b", art: ["#7f5539", "#ddb892", "#ffe8d6"] },
  { frame: "#b08d57", mat: "#fbf7ed", accent: "#6b4423", art: ["#582f0e", "#936639", "#adc178"] }
];

function makeTexture(spec: (typeof slideSpecs)[number], index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 760;

  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, spec.art[0]);
  gradient.addColorStop(0.55, spec.art[1]);
  gradient.addColorStop(1, spec.art[2]);

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.78)";
  context.fillRect(52, 56, canvas.width - 104, canvas.height - 112);

  context.fillStyle = spec.art[index % spec.art.length];
  context.globalAlpha = 0.86;
  context.beginPath();
  context.ellipse(280, 320, 132, 172, -0.22, 0, Math.PI * 2);
  context.fill();

  context.globalAlpha = 0.58;
  context.fillStyle = spec.accent;
  context.fillRect(120, 540, 320, 18);
  context.fillRect(160, 585, 240, 12);

  context.globalAlpha = 0.22;
  context.strokeStyle = "#17120b";
  context.lineWidth = 5;
  for (let ring = 0; ring < 4; ring += 1) {
    context.strokeRect(82 + ring * 18, 86 + ring * 18, canvas.width - 164 - ring * 36, canvas.height - 172 - ring * 36);
  }

  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

function makeFrameSlide(spec: (typeof slideSpecs)[number], index: number) {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: spec.frame,
    metalness: index === 4 ? 0.42 : 0.12,
    roughness: 0.46
  });
  const matMaterial = new THREE.MeshStandardMaterial({
    color: spec.mat,
    metalness: 0.03,
    roughness: 0.82
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: spec.accent,
    metalness: 0.58,
    roughness: 0.24
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    metalness: 0,
    roughness: 0.08,
    transmission: 0.14,
    transparent: true,
    opacity: 0.17
  });

  const back = new THREE.Mesh(new THREE.BoxGeometry(2.18, 3.02, 0.08), matMaterial);
  back.position.z = -0.02;
  group.add(back);

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 2.04),
    new THREE.MeshStandardMaterial({
      map: makeTexture(spec, index),
      roughness: 0.36,
      metalness: 0.02
    })
  );
  photo.position.z = 0.045;
  group.add(photo);

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.04), glassMaterial);
  glass.position.z = 0.055;
  group.add(glass);

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.22), frameMaterial);
  top.position.set(0, 1.62, 0.08);
  group.add(top);

  const bottom = top.clone();
  bottom.position.y = -1.62;
  group.add(bottom);

  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.25, 0.22), frameMaterial);
  left.position.set(-1.25, 0, 0.08);
  group.add(left);

  const right = left.clone();
  right.position.x = 1.25;
  group.add(right);

  const accentTop = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.035, 0.035), accentMaterial);
  accentTop.position.set(0, 1.35, 0.205);
  group.add(accentTop);

  const accentBottom = accentTop.clone();
  accentBottom.position.y = -1.35;
  group.add(accentBottom);

  const accentLeft = new THREE.Mesh(new THREE.BoxGeometry(0.035, 2.72, 0.035), accentMaterial);
  accentLeft.position.set(-1.03, 0, 0.205);
  group.add(accentLeft);

  const accentRight = accentLeft.clone();
  accentRight.position.x = 1.03;
  group.add(accentRight);

  group.userData.depth = 0;

  return group;
}

export function FrameShowcase3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const mountElement = mount;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const slides = slideSpecs.map(makeFrameSlide);
    const root = new THREE.Group();
    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let width = 0;
    let height = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "Moving 3D photo frame slides");
    renderer.domElement.setAttribute("data-testid", "frame-showcase-3d");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    mountElement.appendChild(renderer.domElement);

    scene.add(root);
    slides.forEach((slide) => root.add(slide));

    scene.add(new THREE.AmbientLight("#fff2dc", 1.55));

    const keyLight = new THREE.DirectionalLight("#fff5e6", 3.4);
    keyLight.position.set(2.8, 5.2, 4.4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#d7b56d", 1.8);
    rimLight.position.set(-4, 2.5, 2.5);
    scene.add(rimLight);

    function resize() {
      const rect = mountElement.getBoundingClientRect();
      const maxVisibleWidth = Math.max(1, window.innerWidth + 64);
      width = Math.max(1, Math.min(rect.width, maxVisibleWidth));
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, width < 640 ? 0.25 : 0.38, width < 640 ? 8.6 : 7.45);
      camera.updateProjectionMatrix();
    }

    function positionSlides(time: number) {
      const isMobile = width < 640;
      const radiusX = isMobile ? 2.0 : 2.9;
      const radiusZ = isMobile ? 1.0 : 1.35;
      const count = slides.length;

      slides.forEach((slide, index) => {
        const phase = time + (index / count) * Math.PI * 2;
        const depth = (Math.cos(phase) + 1) / 2;
        const scale = (isMobile ? 0.64 : 0.72) + depth * (isMobile ? 0.2 : 0.32);

        slide.position.set(Math.sin(phase) * radiusX, Math.sin(phase * 1.8) * 0.12, Math.cos(phase) * radiusZ);
        slide.rotation.set(Math.sin(phase * 1.2) * 0.05, -Math.sin(phase) * 0.48, Math.sin(phase + index) * 0.035);
        slide.scale.setScalar(scale);
        slide.userData.depth = depth;

        slide.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.renderOrder = Math.round(depth * 100);
          }
        });
      });

      root.rotation.y = Math.sin(time * 0.28) * 0.08;
      root.rotation.x = Math.sin(time * 0.18) * 0.025;
    }

    function render() {
      const elapsed = reducedMotion.matches ? 0.35 : clock.getElapsedTime() * 0.68;
      positionSlides(elapsed);
      renderer.render(scene, camera);

      if (!reducedMotion.matches) {
        frameId = window.requestAnimationFrame(render);
      }
    }

    resize();
    render();

    const observer = new ResizeObserver(() => resize());
    observer.observe(mountElement);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      renderer.dispose();

      slides.forEach((slide) => {
        slide.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const material = child.material;

            if (Array.isArray(material)) {
              material.forEach((item) => item.dispose());
            } else {
              if ("map" in material && material.map) {
                material.map.dispose();
              }
              material.dispose();
            }
          }
        });
      });

      mountElement.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="h-[340px] w-full sm:h-[440px] lg:h-[560px]" />;
}
