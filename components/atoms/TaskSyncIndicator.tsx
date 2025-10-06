import React from 'react';
import { View } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Text } from '@/components/ui/text';
import { Cloud, HardDrive } from 'lucide-react-native';

type TaskSyncIndicatorProps = {
  colorScheme: 'light' | 'dark' | undefined;
};

export const TaskSyncIndicator: React.FC<TaskSyncIndicatorProps> = ({ colorScheme }) => {
  const { isSignedIn } = useUser();
  
  const iconColor = colorScheme === 'dark' ? '#666666' : '#999999';
  const iconSize = 12;

  return (
    <View className='flex-row items-center gap-1 px-3 py-1 rounded-full bg-muted/10'>
      {isSignedIn ? (
        <>
          <Cloud size={iconSize} color={iconColor} />
          <Text className='text-[10px] font-nothing text-muted-foreground'>
            Synced
          </Text>
        </>
      ) : (
        <>
          <HardDrive size={iconSize} color={iconColor} />
          <Text className='text-[10px] font-nothing text-muted-foreground'>
            Local
          </Text>
        </>
      )}
    </View>
  );
};

TaskSyncIndicator.displayName = 'TaskSyncIndicator';
