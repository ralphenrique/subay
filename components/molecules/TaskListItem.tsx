import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Asterisk, Sun, Calendar, Check, Moon, LucideIcon } from 'lucide-react-native';

export type TaskIconType = 'asterisk' | 'sun' | 'calendar' | 'check' | 'moon';

export type Task = {
  id: string;
  icon: TaskIconType;
  title: string;
  time?: string;
  completed: boolean;
  color: string;
};

type TaskListItemProps = {
  task: Task;
  textColorClass: string;
};

const getIconComponent = (iconName: TaskIconType, color: string, completed: boolean) => {
  const iconColor = completed ? '#A0A0A0' : color;
  const iconSize = 24;

  const iconMap: Record<TaskIconType, React.ComponentType<any>> = {
    asterisk: Asterisk,
    sun: Sun,
    calendar: Calendar,
    check: Check,
    moon: Moon,
  };

  const IconComponent = iconMap[iconName] || Calendar;
  return <IconComponent size={iconSize} color={iconColor} />;
};

export const TaskListItem: React.FC<TaskListItemProps> = ({ 
  task, 
  textColorClass 
}) => {
  return (
    <View className='flex-row items-center py-4'>
      {/* Icon */}
      <View className='mr-4'>
        {getIconComponent(task.icon, task.color, task.completed)}
      </View>

      {/* Task title */}
      <Text className={cn(
        'flex-1 text-lg font-nothing',
        textColorClass,
        task.completed && 'opacity-50'
      )}>
        {task.title}
      </Text>

      {/* Time */}
      {task.time && (
        <Text className={cn(
          'text-base font-nothing',
          'text-gray-400'
        )}>
          {task.time}
        </Text>
      )}
    </View>
  );
};

TaskListItem.displayName = 'TaskListItem';
