import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

type DividerProps = {
  className?: string;
  opacity?: number;
};

export const Divider: React.FC<DividerProps> = ({ 
  className,
  opacity = 0.3 
}) => {
  return (
    <View 
      className={cn('h-[1px] bg-gray-200', className)} 
      style={{ opacity }}
    />
  );
};

Divider.displayName = 'Divider';
