import React from 'react';
import { View, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Cloud, X } from 'lucide-react-native';
import { useState } from 'react';

type GuestPromptProps = {
  colorScheme: 'light' | 'dark' | undefined;
};

export const GuestPrompt: React.FC<GuestPromptProps> = ({ colorScheme }) => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isSignedIn || isDismissed) {
    return null;
  }

  const iconColor = colorScheme === 'dark' ? '#666666' : '#999999';

  return (
    <View className='mx-4 mb-4 p-3 rounded-2xl border border-muted/40 bg-muted/10'>
      <View className='flex-row items-start justify-between gap-3'>
        <View className='flex-1'>
          <View className='flex-row items-center gap-2 mb-1'>
            <Cloud size={16} color={iconColor} />
            <Text className='text-sm font-nothing text-muted-foreground font-semibold'>
              Guest Mode
            </Text>
          </View>
          <Text className='text-xs font-nothing text-muted-foreground opacity-80'>
            Your tasks are saved locally. Sign in to sync across devices and back up to the cloud.
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            className='mt-2 self-start'
          >
            <Text className='text-xs font-nothing text-primary font-semibold'>
              Sign In →
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setIsDismissed(true)}
          className='p-1'
          hitSlop={8}
        >
          <X size={16} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
};

GuestPrompt.displayName = 'GuestPrompt';
