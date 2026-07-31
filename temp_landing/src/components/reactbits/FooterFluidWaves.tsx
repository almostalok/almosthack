'use client';

import React, { useEffect, useRef } from 'react';

export function FooterFluidWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 0.015;

      // Draw 3 animated fluid neon wave layers
      const waveColors = [
        'rgba(0, 240, 255, 0.15)',
        'rgba(139, 92, 246, 0.15)',
        'rgba(16, 185, 129, 0.12)',
      ];

      for (let i = 0; i < waveColors.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = waveColors[i];

        const frequency = 0.005 + i * 0.002;
        const amplitude = 35 + i * 15;
        const speedOffset = step + i * 2;

        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
          const y =
            height * 0.5 +
            Math.sin(x * frequency + speedOffset) * amplitude +
            Math.cos(x * 0.002 + speedOffset * 0.5) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-90"
    />
  );
}
