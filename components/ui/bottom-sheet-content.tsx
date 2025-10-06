import React, { useMemo, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetView,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Asterisk, Sun, Calendar, Check, Moon, Plus, MoreHorizontal } from 'lucide-react-native';

const AnimatedBottomSheetView = Animated.createAnimatedComponent(BottomSheetView);
const AnimatedBottomSheetScrollView = Animated.createAnimatedComponent(BottomSheetScrollView);
const FALLBACK_HEADER_OFFSET = 98;

// Dummy task data
const DUMMY_TASKS = [
  { id: '1', icon: 'asterisk', title: "Daria's 20th Birthday", time: '', completed: false, color: '#FF6B6B' },
  { id: '2', icon: 'sun', title: 'Wake up', time: '09:00', completed: false, color: '#FFD93D' },
  { id: '3', icon: 'calendar', title: 'Design Crit', time: '10:00', completed: false, color: '#A0A0A0' },
  { id: '4', icon: 'calendar', title: 'Haircut with Vincent', time: '13:00', completed: false, color: '#A0A0A0' },
  { id: '5', icon: 'check', title: 'Make pasta', time: '', completed: true, color: '#6BCF7F' },
  { id: '6', icon: 'calendar', title: 'Pushups ×100', time: '', completed: false, color: '#E0E0E0' },
  { id: '7', icon: 'moon', title: 'Wind down', time: '21:00', completed: false, color: '#6B5CE7' },
];

const clamp01 = (value: number) => {
  'worklet';
  return Math.max(0, Math.min(1, value));
};

const getProgressByHeight = (
  position: number,
  startHeight: number,
  endHeight: number
) => {
  'worklet';
  if (startHeight === endHeight) {
    return position <= endHeight ? 1 : 0;
  }

  const rawProgress = (position - startHeight) / (endHeight - startHeight);
  return clamp01(rawProgress);
};

type BottomSheetContentProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  animatedPosition: SharedValue<number>;
  whiteDefaults: string;
  colorScheme: 'light' | 'dark' | undefined;
  toggleColorScheme: () => void;
  headerHeight: number;
};

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  bottomSheetRef,
  animatedPosition,
  whiteDefaults,
  colorScheme,
  toggleColorScheme,
  headerHeight,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const snapPoints = useMemo(() => ['30%', '100%'], []);

  // Animation for icon transition
  const iconTransition = useSharedValue(colorScheme === 'dark' ? 1 : 0);

  useEffect(() => {
    iconTransition.value = withTiming(colorScheme === 'dark' ? 1 : 0, {
      duration: 300,
    });
  }, [colorScheme]);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    stiffness: 500,
  });

  // Animated background for Bottom Sheet
  const AnimatedBackground = ({
    style,
    animatedPosition: sheetAnimatedPosition,
  }: BottomSheetBackgroundProps) => {
    const animatedStyle = useAnimatedStyle(() => {
      const transitionStartHeight = SCREEN_HEIGHT * 0.2;
      const transitionEndHeight = SCREEN_HEIGHT * 0;
      const startRadius = 50;

      const progress = getProgressByHeight(
        sheetAnimatedPosition.value,
        transitionStartHeight,
        transitionEndHeight
      );

      const borderRadius = startRadius - startRadius * progress;

      return {
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        backgroundColor: whiteDefaults,
      };
    }, [whiteDefaults]);

    return <Animated.View style={[style, animatedStyle]} />;
  };

  // Bottom sheet content animation
  const animatedBottomSheetContentStyle = useAnimatedStyle(() => {
    const transitionStartHeight = SCREEN_HEIGHT * 0.2;
    const transitionEndHeight = SCREEN_HEIGHT * 0;

    const progress = getProgressByHeight(
      animatedPosition.value,
      transitionStartHeight,
      transitionEndHeight
    );

    const offsetStart = 0;
    const offsetEnd = headerHeight > 0 ? headerHeight : FALLBACK_HEADER_OFFSET;
    const translateY = offsetStart + (offsetEnd - offsetStart) * progress;

    return {
      transform: [{ translateY }],
    };
  }, [headerHeight]);

  const textColorClass = colorScheme === 'dark' ? 'text-black' : 'text-white';

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

  const getIconComponent = (iconName: string, color: string, completed: boolean) => {
    const iconColor = completed ? '#A0A0A0' : color;
    const iconSize = 24;

    switch (iconName) {
      case 'asterisk':
        return <Asterisk size={iconSize} color={iconColor} />;
      case 'sun':
        return <Sun size={iconSize} color={iconColor} />;
      case 'calendar':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'check':
        return <Check size={iconSize} color={iconColor} />;
      case 'moon':
        return <Moon size={iconSize} color={iconColor} />;
      default:
        return <Calendar size={iconSize} color={iconColor} />;
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      animatedPosition={animatedPosition}
      topInset={0}
      enableOverDrag={false}
      containerStyle={{ zIndex: 5 }}
      handleComponent={null}
      backgroundComponent={AnimatedBackground}
      handleStyle={{ display: 'none', height: 0 }}
    >
      <BottomSheetView className='flex-1 h-full'>
        <Animated.View style={animatedBottomSheetContentStyle} className='flex-1'>
          {/* Day selector */}
          <View className='flex-row px-4 py-6 gap-2'>
            {[
              { day: 9, label: 'MON', active: true },
              { day: 10, label: 'TUE', active: false },
              { day: 11, label: 'WED', active: false },
              { day: 12, label: 'THU', active: false },
              { day: 13, label: 'MON', active: false },
              { day: 14, label: 'SAT', active: false },
              { day: 15, label: 'SUN', active: false },
            ].map((item, index) => (
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

          {/* Task list */}
          <BottomSheetScrollView className='flex-1 px-4' contentContainerStyle={{ paddingBottom: 100 }}>
            {DUMMY_TASKS.map((task, index) => (
              <View key={task.id}>
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

                {/* Divider */}
                {index < DUMMY_TASKS.length - 1 && (
                  <View className='h-[1px] bg-gray-200 opacity-30' />
                )}
              </View>
            ))}
          </BottomSheetScrollView>
        </Animated.View>

        {/* Bottom action buttons */}
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
            onPress={() => {
              // Template for adding new tasks - will be implemented later
            }}
          >
            <Plus size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
          </Button>

          {/* Right button - More options */}
          <Button
            className='w-14 h-14 rounded-full items-center justify-center p-0'
            onPress={() => {
              // Template for more options - will be implemented later
            }}
          >
            <MoreHorizontal size={24} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

BottomSheetContent.displayName = 'BottomSheetContent';
