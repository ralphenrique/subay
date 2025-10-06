import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type DayItem = {
  day: number;
  label: string;
  active: boolean;
};

type DaySelectorProps = {
  days: DayItem[];
  textColorClass: string;
  onDayPress?: (day: DayItem) => void;
};

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  textColorClass,
  onDayPress,
}) => {
  return (
    <View className='flex-row px-4 py-6 gap-2'>
      {days.map((item, index) => (
        <View
          key={index}
          className={cn(
            'flex-1 items-center py-3 rounded-2xl',
            item.active ? 'border-2 border-gray-300' : ''
          )}
        >
          <Text className={cn(
            'text-3xl font-nothing',
            item.active ? textColorClass : 'text-gray-400'
          )}>
            {item.day}
          </Text>
          <Text className={cn(
            'text-xs font-nothing mt-1',
            item.active ? 'text-red-500' : 'text-gray-400'
          )}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

DaySelector.displayName = 'DaySelector';
