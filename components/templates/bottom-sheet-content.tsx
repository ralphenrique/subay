import React, { useMemo, useCallback } from 'react';
import { Dimensions, View, type ListRenderItem } from 'react-native';
import Animated, {
  useAnimatedStyle,
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
import { TaskSyncIndicator } from '@/components/atoms/TaskSyncIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import { observer, useObservable } from '@legendapp/state/react';
import { getTasksArray } from '@/lib/state/tasks';
import type { Task as SupabaseTask } from '@/lib/types';

const FALLBACK_HEADER_OFFSET = 98;

// Helper function to transform Supabase tasks to UI tasks
const transformTaskToUITask = (task: SupabaseTask): Task => {
  return {
    id: task.id.toString(),
    icon: task.is_done ? 'check' : 'calendar',
    title: task.task,
    time: '', // You can add time parsing logic here if needed
    completed: task.is_done,
    color: task.is_done ? '#6BCF7F' : '#A0A0A0',
  };
};

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
  onPressUserMenu?: () => void;
  disableAddTask?: boolean;
  disableUserMenu?: boolean;
};

export const BottomSheetContent: React.FC<BottomSheetContentProps> = observer(({
  bottomSheetRef,
  animatedPosition,
  whiteDefaults,
  colorScheme,
  toggleColorScheme,
  headerHeight,
  onPressAddTask,
  onPressUserMenu,
  disableAddTask,
  disableUserMenu,
}) => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const snapPoints = useMemo(() => ['30%', '100%'], []);
  
  // Get tasks from the global state and transform them - direct reactive access
  const supabaseTasks = getTasksArray();
  const tasks = supabaseTasks.map(transformTaskToUITask);

  // Day selector data
  const dayItems = useMemo<DayItem[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + index);

      return {
        day: current.getDate(),
        label: current.toLocaleDateString(undefined, {
          weekday: 'short',
        }).toUpperCase(),
        active: current.getTime() === today.getTime(),
      } as DayItem;
    });
  }, []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 120,
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

  // Gradient colors based on color scheme
  const gradientColors = useMemo<readonly [string, string]>(() => {
    if (colorScheme === 'dark') {
      return ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'];
    }
    return ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)'];
  }, [colorScheme]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
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
          {/* Day selector */}
          <View className='px-4 pt-2'>
            <DaySelector
              days={dayItems}
              textColorClass={textColorClass}
            />
          </View>

          {/* Task list */}
          <BottomSheetFlatList<Task>
            data={tasks}
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

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={gradientColors}
          locations={[0, 1]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 }}
          pointerEvents="none"
        />

        {/* Bottom action buttons */}
        <BottomSheetActions
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
          onPressAddTask={onPressAddTask}
          onPressUserMenu={onPressUserMenu}
          disableAddTask={disableAddTask}
          disableUserMenu={disableUserMenu}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

BottomSheetContent.displayName = 'BottomSheetContent';
