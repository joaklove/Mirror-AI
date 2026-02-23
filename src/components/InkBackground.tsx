import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface InkBackgroundProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  enableParticles?: boolean;
  enableGradient?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const InkBackground: React.FC<InkBackgroundProps> = ({
  className,
  intensity = 'light',
  enableParticles = true,
  enableGradient = true,
}) => {
  const { theme, customTheme, themeConfigs } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enableParticles) return;
    
    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 12 + 18,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.2,
    }));
    
    setParticles(newParticles);

    const newOrbs: Orb[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 100,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * 10,
    }));
    setOrbs(newOrbs);
  }, [enableParticles, customTheme]);

  const opacityMap = {
    light: 0.04,
    medium: 0.08,
    heavy: 0.12,
  };

  const opacity = opacityMap[intensity];
  const colors = themeConfigs[customTheme];
  
  const inkColor = isDark ? '220, 25%, 15%' : '168, 22%, 21%';
  const accentColor = isDark ? '200, 30%, 25%' : '168, 16%, 42%';
  const warmColor = isDark ? '350, 60%, 45%' : '9, 52%, 53%';
  const lightColor = isDark ? '190, 60%, 60%' : '45, 80%, 55%';

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-0', className)}>
      {enableGradient && (
        <>
          <div 
            className="absolute inset-0 animate-gradient-shift"
            style={{
              background: isDark 
                ? `linear-gradient(135deg, hsl(220, 30%, 6%) 0%, hsl(200, 25%, 10%) 50%, hsl(220, 30%, 8%) 100%)`
                : `linear-gradient(135deg, hsl(40, 30%, 94%) 0%, hsl(45, 20%, 90%) 25%, hsl(40, 25%, 92%) 50%, hsl(35, 20%, 88%) 75%, hsl(40, 30%, 94%) 100%)`,
              backgroundSize: '400% 400%',
              animationDuration: '12s',
            }}
          />
          
          {orbs.map((orb) => (
            <div
              key={`orb-${orb.id}`}
              className="absolute rounded-full animate-orb-float"
              style={{
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                width: orb.size,
                height: orb.size,
                background: orb.id % 2 === 0 
                  ? `radial-gradient(circle, hsla(${warmColor}, 0.2) 0%, transparent 70%)`
                  : `radial-gradient(circle, hsla(${lightColor}, 0.15) 0%, transparent 70%)`,
                filter: 'blur(30px)',
                animationDuration: `${orb.duration}s`,
                animationDelay: `${orb.delay}s`,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </>
      )}

      <svg
        className="absolute -left-20 top-1/4 w-[600px] h-[400px] animate-cloud-float"
        style={{ opacity: opacity * 1.5, animationDelay: '0s' }}
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 400 L0 250 Q50 200 100 220 Q150 180 200 200 Q250 150 300 180 Q350 120 400 160 Q450 100 500 140 Q550 80 600 120 L600 400 Z"
          fill={`hsl(${inkColor})`}
          fillOpacity="0.08"
        />
      </svg>

      <svg
        className="absolute -right-20 top-1/3 w-[500px] h-[350px] animate-cloud-float"
        style={{ opacity: opacity * 1.5, animationDelay: '-4s', animationDirection: 'reverse' }}
        viewBox="0 0 500 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 350 L0 200 Q40 160 80 180 Q120 140 160 160 Q200 110 240 140 Q280 90 320 120 Q360 70 400 100 Q440 50 500 80 L500 350 Z"
          fill={`hsl(${inkColor})`}
          fillOpacity="0.06"
        />
      </svg>

      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] animate-cloud-float"
        style={{
          opacity: opacity * 2,
          animationDuration: '12s',
          background: `
            radial-gradient(ellipse 80% 60% at 30% 100%, hsla(${accentColor}, 0.2) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 100%, hsla(${accentColor}, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      <div
        className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full animate-breathe"
        style={{
          opacity: opacity * 3,
          background: `radial-gradient(circle, hsla(${warmColor}, 0.12) 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute bottom-1/3 left-1/3 w-[250px] h-[250px] rounded-full animate-breathe"
        style={{
          opacity: opacity * 2.5,
          background: `radial-gradient(circle, hsla(${accentColor}, 0.1) 0%, transparent 70%)`,
          filter: 'blur(50px)',
          animationDelay: '-2s',
        }}
      />

      {enableParticles && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: isDark ? particle.opacity * 0.8 : particle.opacity,
            background: isDark 
              ? `radial-gradient(circle, hsla(190, 70%, 75%, 0.9) 0%, transparent 70%)`
              : `radial-gradient(circle, hsla(${warmColor}, 0.8) 0%, transparent 70%)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: 'blur(1px)',
            willChange: 'transform, opacity',
            boxShadow: isDark 
              ? `0 0 ${particle.size * 2}px hsla(190, 70%, 75%, 0.4)`
              : `0 0 ${particle.size * 2}px hsla(${warmColor}, 0.3)`,
          }}
        />
      ))}

      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsla(${warmColor}, 0.4) 30%, hsla(${lightColor}, 0.3) 50%, hsla(${warmColor}, 0.4) 70%, transparent 100%)`,
          opacity: 0.6,
        }}
      />
      
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsla(${accentColor}, 0.3) 30%, hsla(${lightColor}, 0.2) 50%, hsla(${accentColor}, 0.3) 70%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
    </div>
  );
};

export const PaperTexture: React.FC<{ className?: string }> = ({ className }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn('fixed inset-0 pointer-events-none z-0', className)}
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `,
        backgroundSize: '200px 200px',
        opacity: isDark ? 0.015 : 0.025,
      }}
    />
  );
};

export default InkBackground;
