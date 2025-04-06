"use client";

import { useEffect, useRef } from 'react';

interface SimpleConfettiProps {
  active: boolean;
  duration?: number;
}

export function SimpleConfetti({ active, duration = 3000 }: SimpleConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Confetti colors
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    // Confetti pieces
    const confetti: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];
    
    // Create confetti
    for (let i = 0; i < 200; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1
      });
    }
    
    // Animation
    let animationFrameId: number;
    let startTime = Date.now();
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if duration has passed
      if (Date.now() - startTime > duration) {
        cancelAnimationFrame(animationFrameId);
        return;
      }
      
      // Draw confetti
      confetti.forEach(piece => {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        
        // Draw a rectangle for the confetti piece
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
        
        ctx.restore();
        
        // Update position
        piece.y += piece.speed;
        piece.rotation += piece.rotationSpeed;
        
        // Reset if off screen
        if (piece.y > canvas.height) {
          piece.y = -piece.size;
          piece.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, duration]);
  
  if (!active) return null;
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
} 