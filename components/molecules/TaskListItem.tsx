import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type Task = {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  createdAt?: string; // ISO date string
};

type TaskListItemProps = {
  task: Task;
  textColorClass: string;
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const TaskListItem: React.FC<TaskListItemProps> = ({ 
  task, 
  textColorClass 
}) => {
  const createdTime = formatTime(task.createdAt);
  
  return (
    <View className='flex-row items-center py-4'>
      {/* Created Time */}
      {createdTime && (
        <View className='mr-4 '>
          <Text className={cn(
            'text-sm font-nothing',
            task.completed ? 'text-gray-400' : 'text-gray-500'
          )}>
            {createdTime}
          </Text>
        </View>
      )}

      {/* Task title */}
      <Text className={cn(
        'flex-1 text-lg font-nothing',
        textColorClass,
        task.completed && 'opacity-50'
      )}>
        {task.title}
      </Text>

      {/* Time (if you still need this field) */}
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
