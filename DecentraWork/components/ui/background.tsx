'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Set a dark background color
    renderer.setClearColor(0x0B0C10, 1) // Fully opaque dark background

    // Create particles
    const particlesCount = 500
    const positions = new Float32Array(particlesCount * 3)
    const colors = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50 // Spread particles in a 50x50x50 cube
      // Adjust colors to have dark purplish tones
      colors[i] = Math.random() * 0.2 + 0.2 // Dim colors for a dark theme
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Create connections
    const connectionsGeometry = new THREE.BufferGeometry()
    const connectionsMaterial = new THREE.LineBasicMaterial({
      color: 0x66FCF1,
      transparent: true,
      opacity: 0.1,
    })
    const connections = new THREE.LineSegments(connectionsGeometry, connectionsMaterial)
    scene.add(connections)

    // Camera positioning
    camera.position.z = 30

    // Animation
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      // Animate particles
      particles.rotation.y = elapsedTime * 0.05
      particles.rotation.x = elapsedTime * 0.03

      // Update connections
      const positions = particles.geometry.attributes.position.array
      const linePositions = []
      const maxConnections = 150; // Reduced number of connections
      const connectionCount = Math.min(maxConnections, particlesCount * (particlesCount - 1) / 2);

      for (let i = 0; i < connectionCount; i++) {
        const idx1 = Math.floor(Math.random() * particlesCount);
        const idx2 = Math.floor(Math.random() * particlesCount);

        const dx = positions[idx1 * 3] - positions[idx2 * 3]
        const dy = positions[idx1 * 3 + 1] - positions[idx2 * 3 + 1]
        const dz = positions[idx1 * 3 + 2] - positions[idx2 * 3 + 2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < 5) {
          linePositions.push(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2])
          linePositions.push(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2])
        }
      }

      connectionsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      connectionsGeometry.attributes.position.needsUpdate = true

      // Subtle animation for connections
      connections.rotation.z = Math.sin(elapsedTime * 0.2) * 0.02; // Subtle rotation for the connections

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />
}

export default DynamicBackground
