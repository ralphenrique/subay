import React from 'react';
import { Pressable, View } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/text';
import { Cloud, HardDrive } from 'lucide-react-native';
import { syncTasksNow, isTaskSyncEnabled } from '@/lib/state/tasks';
type TaskSyncIndicatorProps = {
  colorScheme: 'light' | 'dark' | undefined;
};

export const TaskSyncIndicator: React.FC<TaskSyncIndicatorProps> = ({ colorScheme }) => {

  const iconColor = colorScheme === 'dark' ? '#666666' : '#999999';
  const iconSize = 12;

  return (
    <View className='flex-row items-center gap-1 px-3 py-1 rounded-full bg-muted/10'>
      <>
        <Cloud size={iconSize} color={iconColor} />
        {isTaskSyncEnabled() ? (
          <Text className='text-[10px] font-nothing text-muted-foreground'>
            Synced
          </Text>
        ) : (
          <Pressable
            className='text-[10px] font-nothing text-muted-foreground underline'
            onPress={() => {
              syncTasksNow();
            }}
          >
            <Text className='text-[10px] font-nothing text-muted-foreground'>
              Synced
            </Text>
          </Pressable>
        )}
      </>
    </View>
  );
};

TaskSyncIndicator.displayName = 'TaskSyncIndicator';
