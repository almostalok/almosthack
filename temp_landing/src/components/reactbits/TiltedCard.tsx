'use client';

import React, { useRef, useState } from 'react';

interface TiltedCardProps {
  children: React.ReactNode;
  maxRotate?: number;
  scale?: number;
  className?: string;
}

export function TiltedCard({
  children,
  maxRotate = 12,
  scale = 1.03,
  className = '',
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = ((mouseX - width / 2) / (width / 2)) * maxRotate;
    const rX = -((mouseY - height / 2) / (height / 2)) * maxRotate;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setCurrentScale(scale);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setCurrentScale(1);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${currentScale}, ${currentScale}, ${currentScale})`,
      }}
    >
      {children}
    </div>
  );
}
