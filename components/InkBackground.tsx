import React from 'react';
import { cn } from '@/lib/utils';

interface InkBackgroundProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

/**
 * 水墨背景组件
 * 营造国风意境，若隐若现的山水轮廓
 */
export const InkBackground: React.FC<InkBackgroundProps> = ({
  className,
  intensity = 'light',
}) => {
  const opacityMap = {
    light: 0.03,
    medium: 0.06,
    heavy: 0.1,
  };

  const opacity = opacityMap[intensity];

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden', className)}>
      {/* 远山轮廓 - 左侧 */}
      <svg
        className="absolute -left-20 top-1/4 w-[600px] h-[400px] animate-cloud-float"
        style={{ opacity, animationDelay: '0s' }}
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 400 L0 250 Q50 200 100 220 Q150 180 200 200 Q250 150 300 180 Q350 120 400 160 Q450 100 500 140 Q550 80 600 120 L600 400 Z"
          fill="hsl(168, 22%, 21%)"
        />
      </svg>

      {/* 远山轮廓 - 右侧 */}
      <svg
        className="absolute -right-20 top-1/3 w-[500px] h-[350px] animate-cloud-float"
        style={{ opacity, animationDelay: '-4s', animationDirection: 'reverse' }}
        viewBox="0 0 500 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 350 L0 200 Q40 160 80 180 Q120 140 160 160 Q200 110 240 140 Q280 90 320 120 Q360 70 400 100 Q440 50 500 80 L500 350 Z"
          fill="hsl(168, 22%, 21%)"
        />
      </svg>

      {/* 云雾效果 - 底部 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] animate-cloud-float"
        style={{
          opacity: opacity * 1.5,
          animationDuration: '12s',
          background: `
            radial-gradient(ellipse 80% 60% at 30% 100%, hsla(168, 16%, 42%, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 100%, hsla(168, 16%, 42%, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* 水墨晕染点 - 装饰 */}
      <div
        className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full animate-breathe"
        style={{
          opacity: opacity * 2,
          background: 'radial-gradient(circle, hsla(9, 52%, 53%, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute bottom-1/3 left-1/3 w-[250px] h-[250px] rounded-full animate-breathe"
        style={{
          opacity: opacity * 2,
          background: 'radial-gradient(circle, hsla(168, 16%, 42%, 0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '-2s',
        }}
      />
    </div>
  );
};

/**
 * 宣纸纹理覆盖层
 */
export const PaperTexture: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('fixed inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `,
        backgroundSize: '200px 200px',
        opacity: 0.03,
      }}
    />
  );
};

export default InkBackground;
