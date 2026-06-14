import { useEffect, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { LOGO_TEXT } from '../lib/constants';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo3D({ size = 'lg' }: Logo3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
    xl: 'text-9xl',
  };

  const crownSizes = {
    sm: 28,
    md: 40,
    lg: 64,
    xl: 96,
  };

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX = (e.clientX - centerX) / rect.width;
      mouseY = (e.clientY - centerY) / rect.height;
    };

    const animate = (): void => {
      targetX += (mouseX * 20 - targetX) * 0.05;
      targetY += (mouseY * -20 - targetY) * 0.05;

      setRotation({ x: targetY, y: targetX });
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="inline-block perspective-container"
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="logo-3d-wrapper"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="flex items-center gap-4 relative">
          <div className="logo-layer absolute inset-0 flex items-center gap-4 blur-xl opacity-30"
            style={{
              transform: 'translateZ(-50px)',
            }}
          >
            <span className={`font-bold ${sizeClasses[size]} text-amber-500 tracking-tight`}>
              {LOGO_TEXT}
            </span>
            <Crown
              size={crownSizes[size]}
              className="text-amber-500"
              fill="currentColor"
            />
          </div>

          <div className="logo-layer relative flex items-center gap-4"
            style={{
              transform: 'translateZ(0px)',
            }}
          >
            <span className={`font-bold ${sizeClasses[size]} text-amber-500 tracking-tight drop-shadow-2xl animate-float`}>
              {LOGO_TEXT}
            </span>
            <Crown
              size={crownSizes[size]}
              className="text-amber-500 animate-crown-float"
              fill="currentColor"
            />
          </div>

          <div className="logo-layer absolute inset-0 flex items-center gap-4 blur-sm opacity-20"
            style={{
              transform: 'translateZ(30px)',
            }}
          >
            <span className={`font-bold ${sizeClasses[size]} text-amber-300 tracking-tight`}>
              {LOGO_TEXT}
            </span>
            <Crown
              size={crownSizes[size]}
              className="text-amber-300"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
