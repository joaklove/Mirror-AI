import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton-pulse', variantStyles[variant], className)}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="80%" />
      <div className="flex gap-2 pt-2">
        <Skeleton width={60} height={24} variant="text" />
        <Skeleton width={60} height={24} variant="text" />
      </div>
    </div>
  );
};

interface EntryCardSkeletonProps {
  className?: string;
}

export const EntryCardSkeleton: React.FC<EntryCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('dao-card p-4 space-y-3', className)}>
      <div className="flex justify-between items-center">
        <Skeleton width={100} height={16} variant="text" />
        <Skeleton width={60} height={12} variant="text" />
      </div>
      <Skeleton height={48} />
      <div className="flex gap-2">
        <Skeleton width={50} height={22} variant="text" />
        <Skeleton width={50} height={22} variant="text" />
      </div>
    </div>
  );
};

export default Skeleton;
