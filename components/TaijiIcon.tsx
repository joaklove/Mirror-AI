import React from 'react';
import { cn } from '@/lib/utils';

interface TaijiIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glow?: boolean;
}

/**
 * 太极图标组件
 * 融合道系美学，象征阴阳平衡、道法自然
 */
export const TaijiIcon: React.FC<TaijiIconProps> = ({
  size = 48,
  className,
  animated = true,
  glow = false,
}) => {
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        animated && 'animate-taiji',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* 外发光效果 */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full animate-breathe"
          style={{
            background: 'radial-gradient(circle, hsla(168, 16%, 42%, 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}
      
      {/* 太极 SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* 外圆边框 */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="hsl(168, 16%, 42%)"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
        
        {/* 太极主体 */}
        <g>
          {/* 白色半圆 (阳) */}
          <path
            d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
            fill="hsl(40, 20%, 98%)"
            stroke="hsl(168, 16%, 42%)"
            strokeWidth="0.5"
          />
          
          {/* 黑色半圆 (阴) */}
          <path
            d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2"
            fill="hsl(168, 22%, 21%)"
          />
          
          {/* 阳中之阴 (白中的黑点) */}
          <circle cx="50" cy="26" r="8" fill="hsl(168, 22%, 21%)" />
          
          {/* 阴中之阳 (黑中的白点) */}
          <circle cx="50" cy="74" r="8" fill="hsl(40, 20%, 98%)" />
        </g>
        
        {/* 中心点 - 象征无极 */}
        <circle
          cx="50"
          cy="50"
          r="2"
          fill="hsl(9, 52%, 53%)"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

/**
 * 简化版太极图标 - 用于小尺寸场景
 */
export const TaijiIconSimple: React.FC<TaijiIconProps> = ({
  size = 24,
  className,
  animated = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-taiji', className)}
    >
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
      <path
        d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="50" cy="26" r="8" fill="currentColor" />
      <circle cx="50" cy="74" r="8" fill="hsl(40, 20%, 98%)" />
    </svg>
  );
};

export default TaijiIcon;
