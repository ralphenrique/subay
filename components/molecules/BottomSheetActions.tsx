import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Plus, User } from 'lucide-react-native';

type BottomSheetActionsProps = {
  colorScheme: 'light' | 'dark' | undefined;
  toggleColorScheme: () => void;
  onPressAddTask?: () => void;
  onPressUserMenu?: () => void;
  disableAddTask?: boolean;
  disableUserMenu?: boolean;
};

export const BottomSheetActions: React.FC<BottomSheetActionsProps> = ({
  colorScheme,
  toggleColorScheme,
  onPressAddTask,
  onPressUserMenu,
  disableAddTask,
  disableUserMenu,
}) => {
  // Animation for icon transition
  const iconTransition = useSharedValue(colorScheme === 'dark' ? 1 : 0);

  useEffect(() => {
    iconTransition.value = withTiming(colorScheme === 'dark' ? 1 : 0, {
      duration: 300,
    });
  }, [colorScheme, iconTransition]);

  // Animated styles for icon transitions
  const sunAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(iconTransition.value, [0, 1], [1, 0]);
    const rotation = interpolate(iconTransition.value, [0, 1], [0, 180]);
    const scale = interpolate(iconTransition.value, [0, 0.5, 1], [1, 0.8, 0]);

    return {
      opacity,
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      position: 'absolute' as const,
    };
  });

  const moonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(iconTransition.value, [0, 1], [0, 1]);
    const rotation = interpolate(iconTransition.value, [0, 1], [-180, 0]);
    const scale = interpolate(iconTransition.value, [0, 0.5, 1], [0, 0.8, 1]);

    return {
      opacity,
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      position: 'absolute' as const,
    };
  });

  return (
    <View className='flex-row px-4 py-6 gap-4 items-center'>
      {/* Left button - Dark/Light mode toggle */}
      <Button
        className='w-14 h-14 rounded-full items-center justify-center p-0'
        onPress={toggleColorScheme}
      >
        <View className='w-6 h-6 items-center justify-center'>
          <Animated.View style={sunAnimatedStyle}>
            <Sun size={24} color='#FFFFFF' />
          </Animated.View>
          <Animated.View style={moonAnimatedStyle}>
            <Moon size={24} color='#000000' />
          </Animated.View>
        </View>
      </Button>

      {/* Center button - Add task */}
      <Button
        className='flex-1 h-14 rounded-full items-center justify-center'
        onPress={onPressAddTask}
        // disabled={disableAddTask}
      >
        <Plus size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
      </Button>

      {/* Right button - User Menu */}

      <Button className='w-14 h-14 rounded-full items-center justify-center p-0'
        onPress={onPressUserMenu}
        // disabled={disableUserMenu}
      >
        <User size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
      </Button>

    </View>
  );
};

BottomSheetActions.displayName = 'BottomSheetActions';
