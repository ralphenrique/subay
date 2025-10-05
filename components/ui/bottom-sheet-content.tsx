import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AnimatedBottomSheetView = Animated.createAnimatedComponent(BottomSheetView);

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
};

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  bottomSheetRef,
  animatedPosition,
  whiteDefaults,
  colorScheme,
  toggleColorScheme,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const snapPoints = useMemo(() => ['30%', '60%', '100%'], []);

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
    const offsetEnd = 98;
    const translateY = offsetStart + (offsetEnd - offsetStart) * progress;

    return {
      transform: [{ translateY }],
    };
  });

  const textColorClass = colorScheme === 'dark' ? 'text-black' : 'text-white';

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      animatedPosition={animatedPosition}
      topInset={0}
      enableOverDrag={false}
      containerStyle={{ zIndex: 5 }}
      backgroundComponent={AnimatedBackground}
      handleStyle={{ display: 'none' }}
    >
      <AnimatedBottomSheetView
        className='flex-1 h-full p-6'
        style={animatedBottomSheetContentStyle}
      >
        <Text className={cn('text-2xl font-nothing', textColorClass)}>Tasks</Text>
        <Button
          variant='outline'
          className='self-start'
          onPress={toggleColorScheme}
        >
          <Text className='text-base font-semibold '>
            {colorScheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Text>
        </Button>
      </AnimatedBottomSheetView>
    </BottomSheet>
  );
};

BottomSheetContent.displayName = 'BottomSheetContent';
