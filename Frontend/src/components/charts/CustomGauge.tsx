import React, { useEffect, useRef } from 'react';

interface CustomGaugeProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
}

export const CustomGauge: React.FC<CustomGaugeProps> = ({ 
  value, 
  size = 200, 
  thickness = 20,
  color = '#2196f3'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate center and radius
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - thickness) / 2;

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = thickness;
    ctx.stroke();

    // Draw value arc
    const valueInRadians = (value / 100) * 1.5 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.75 + valueInRadians);
    ctx.strokeStyle = color;
    ctx.stroke();

    // Draw value text
    ctx.font = `bold ${size / 5}px Arial`;
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${value}%`, centerX, centerY);
  }, [value, size, thickness, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
