'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export function AICoreCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 400;
      height = canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    window.addEventListener('resize', handleResize);

    let angle = 0;

    // Outer Orbiting Nodes
    const numNodes = 12;
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
      angleOffset: (i * Math.PI * 2) / numNodes,
      speed: 0.02 + Math.random() * 0.01,
      dist: 90 + Math.random() * 20,
      size: 3 + Math.random() * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.02;

      const centerX = width / 2;
      const centerY = height / 2;

      // Outer Glowing Ring 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);

      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      ctx.stroke();

      // Outer Glowing Ring 2 (Opposite spin)
      ctx.rotate(-angle * 1.2);
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.4)' : 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.stroke();

      ctx.restore();

      // Center Holographic Core Orb
      const pulseSize = 45 + Math.sin(angle * 3) * 5;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        pulseSize + 25
      );
      gradient.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.9)' : 'rgba(0, 240, 255, 0.9)');
      gradient.addColorStop(0.4, isLight ? 'rgba(99, 102, 241, 0.6)' : 'rgba(139, 92, 246, 0.6)');
      gradient.addColorStop(0.8, isLight ? 'rgba(2, 132, 199, 0.2)' : 'rgba(0, 240, 255, 0.2)');
      gradient.addColorStop(1, isLight ? 'rgba(248, 250, 252, 0)' : 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize + 25, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner Core Solid Sphere
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#0284c7' : '#00F0FF';
      ctx.shadowBlur = 25;
      ctx.shadowColor = isLight ? '#0284c7' : '#00F0FF';
      ctx.fill();

      ctx.shadowBlur = 0;

      // Orbiting Data Particles & Connection Vectors
      nodes.forEach((node) => {
        const currentAngle = angle * node.speed * 50 + node.angleOffset;
        const x = centerX + Math.cos(currentAngle) * node.dist;
        const y = centerY + Math.sin(currentAngle) * (node.dist * 0.6);

        // Vector line to center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node dot
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#0284c7' : '#00F0FF';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <div className={`relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-300 ${
      isLight
        ? 'bg-slate-100/90 border-slate-200 shadow-[0_0_40px_rgba(2,132,199,0.15)]'
        : 'bg-black border-white/15 shadow-[0_0_50px_rgba(0,240,255,0.25)]'
    }`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className={`absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[10px] px-3 py-1.5 rounded-lg border backdrop-blur-md transition-colors duration-300 ${
        isLight
          ? 'bg-white/90 text-slate-600 border-slate-200'
          : 'bg-zinc-950/80 text-zinc-400 border-white/10'
      }`}>
        <span className="flex items-center gap-1.5 text-cyan font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
          Holographic AI Engine
        </span>
        <span className="text-emerald-500 font-medium">60 FPS • Canvas 3D</span>
      </div>
    </div>
  );
}
