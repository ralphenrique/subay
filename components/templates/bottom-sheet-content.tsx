import React, { useMemo, useCallback } from 'react';
import { Dimensions, View, type ListRenderItem } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetView,
  BottomSheetFlatList,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { Divider } from '@/components/atoms/divider';
import { DaySelector, type DayItem } from '@/components/molecules/DaySelector';
import { TaskListItem, type Task } from '@/components/molecules/TaskListItem';
import { BottomSheetActions } from '@/components/molecules/BottomSheetActions';
import { UserMenuButton } from '@/components/molecules/UserMenuButton';
import { GuestPrompt } from '@/components/molecules/GuestPrompt';
import { TaskSyncIndicator } from '@/components/atoms/TaskSyncIndicator';

const FALLBACK_HEADER_OFFSET = 98;

// Dummy task data
const DUMMY_TASKS: Task[] = [
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
  onPressAddTask?: () => void;
};

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  bottomSheetRef,
  animatedPosition,
  whiteDefaults,
  colorScheme,
  toggleColorScheme,
  headerHeight,
  onPressAddTask,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const snapPoints = useMemo(() => ['30%', '100%'], []);

  // Day selector data
  const dayItems = useMemo<DayItem[]>(() => [
    { day: 9, label: 'MON', active: true },
    { day: 10, label: 'TUE', active: false },
    { day: 11, label: 'WED', active: false },
    { day: 12, label: 'THU', active: false },
    { day: 13, label: 'FRI', active: false },
    { day: 14, label: 'SAT', active: false },
    { day: 15, label: 'SUN', active: false },
  ], []);

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

    const offsetStart = 30;
    const offsetEnd = headerHeight > 0 ? headerHeight : FALLBACK_HEADER_OFFSET;
    const translateY = offsetStart + (offsetEnd - offsetStart) * progress;

    return {
      transform: [{ translateY }],
    };
  }, [headerHeight]);

  const textColorClass = colorScheme === 'dark' ? 'text-black' : 'text-white';

  const renderTaskItem = useCallback<ListRenderItem<Task>>(
    ({ item }) => (
      <TaskListItem
        task={item}
        textColorClass={textColorClass}
      />
    ),
    [textColorClass]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

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
      keyboardBehavior='extend'
      keyboardBlurBehavior='none'
    >
      <BottomSheetView className='flex-1 h-full'>
        <Animated.View style={animatedBottomSheetContentStyle} className='flex-1'>
          {/* User Menu and Day selector */}
          <View className='px-4 pt-2 pb-2'>
            <UserMenuButton colorScheme={colorScheme} />
          </View>
          
          <DaySelector 
            days={dayItems}
            textColorClass={textColorClass}
          />

          {/* Guest prompt - only shown for non-authenticated users */}
          <GuestPrompt colorScheme={colorScheme} />

          {/* Task list */}
          <BottomSheetFlatList<Task>
            data={DUMMY_TASKS}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
            style={{ flex: 1 }}
            ListHeaderComponent={(
              <View className='mb-3'>
                <TaskSyncIndicator colorScheme={colorScheme} />
              </View>
            )}
            renderItem={renderTaskItem}
            ItemSeparatorComponent={() => <Divider />}
          />
        </Animated.View>

        {/* Bottom action buttons */}
        <BottomSheetActions 
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
          onPressAddTask={onPressAddTask}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

BottomSheetContent.displayName = 'BottomSheetContent';
