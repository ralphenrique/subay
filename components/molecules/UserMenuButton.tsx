import React from 'react';
import { View, Pressable } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogIn } from 'lucide-react-native';

type UserMenuButtonProps = {
  colorScheme: 'light' | 'dark' | undefined;
};

export const UserMenuButton: React.FC<UserMenuButtonProps> = ({ colorScheme }) => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const handlePress = () => {
    if (isSignedIn) {
      // TODO: Navigate to user profile/settings screen
      console.log('Navigate to profile');
    } else {
      router.push('/(auth)/sign-in');
    }
  };

  const iconColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';

  if (isSignedIn && user) {
    return (
      <Pressable
        onPress={handlePress}
        className='flex-row items-center gap-2 px-3 py-2 rounded-xl border border-muted/40 bg-muted/10'
      >
        <Avatar
          alt={user.fullName || user.emailAddresses?.[0]?.emailAddress || 'User'}
          className='w-6 h-6'
        >
          {user.imageUrl ? (
            <AvatarImage source={{ uri: user.imageUrl }} />
          ) : (
            <AvatarFallback>
              <User size={16} color={iconColor} />
            </AvatarFallback>
          )}
        </Avatar>
        <Text className='text-xs font-nothing text-muted-foreground'>
          {user.firstName || 'Profile'}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      className='flex-row items-center gap-2 px-3 py-2 rounded-full border border-muted/40 bg-muted/10'
    >
      <LogIn size={16} color={iconColor} />
      <Text className='text-xs font-nothing text-muted-foreground'>
        Sign In
      </Text>
    </Pressable>
  );
};

UserMenuButton.displayName = 'UserMenuButton';
