import {
  View,
  Dimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  CalendarView,
  type CalendarGridData,
  type GridMode,
  GRID_COLUMNS_YEAR,
  GRID_COLUMNS_MONTH,
  MS_PER_DAY,
} from '@/components/organisms/calendar';
import { BottomSheetContent } from '@/components/templates/bottom-sheet-content';
import { AddTaskSheet, type AddTaskSheetRef } from '@/components/templates/add-task-sheet';

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

export default function HomeScreen() {
  const { user } = useUser();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const whiteDefaults = colorScheme === 'dark' ? '#fff' : '#000';
  const blackDefaults = colorScheme === 'dark' ? '#000' : '#fff';
  const [today, setToday] = useState(() => new Date());
  const todayTimestamp = today.getTime();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3);
  const dayMonth = today.toLocaleDateString('en-US', { month: 'long', day: '2-digit' });
  const year = today.getFullYear();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const addTaskSheetRef = useRef<AddTaskSheetRef>(null);
  const isMountedRef = useRef(false);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1);
  const animatedPosition = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const defaultStatusBarStyle: 'light' | 'dark' = colorScheme === 'dark' ? 'light' : 'dark';
  const invertedStatusBarStyle: 'light' | 'dark' =
  defaultStatusBarStyle === 'light' ? 'dark' : 'light';

  const [statusBarStyle, setStatusBarStyle] = useState<'light' | 'dark'>(defaultStatusBarStyle);
  const [headerHeight, setHeaderHeight] = useState(0);

  const setStatusBarStyleIfNeeded = useCallback((nextStyle: 'light' | 'dark') => {
    if (!isMountedRef.current) {
      return;
    }

    setStatusBarStyle((current) => (current === nextStyle ? current : nextStyle));
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const calendarData = useMemo<Record<GridMode, CalendarGridData>>(() => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const totalDaysInYear = Math.round((endOfYear.getTime() - startOfYear.getTime()) / MS_PER_DAY);
    const daysElapsedInYear = Math.floor((todayTimestamp - startOfYear.getTime()) / MS_PER_DAY);
    const completedDaysInYear = Math.min(daysElapsedInYear + 1, totalDaysInYear);
    const remainingDaysInYear = Math.max(totalDaysInYear - completedDaysInYear, 0);

    const yearData: CalendarGridData = {
      dayCells: Array.from({ length: totalDaysInYear }, (_, index) => ({
        index,
        isCompleted: index < completedDaysInYear,
      })),
      gridColumns: GRID_COLUMNS_YEAR,
      daysRemainingLabel: `${remainingDaysInYear} day${remainingDaysInYear === 1 ? '' : 's'} left this year`,
    };

    const monthIndex = today.getMonth();
    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 1);
    const totalDaysInMonth = Math.round(
      (endOfMonth.getTime() - startOfMonth.getTime()) / MS_PER_DAY
    );
    const daysElapsedInMonth = Math.floor(
      (todayTimestamp - startOfMonth.getTime()) / MS_PER_DAY
    );
    const completedDaysInMonth = Math.min(daysElapsedInMonth + 1, totalDaysInMonth);
    const remainingDaysInMonth = Math.max(totalDaysInMonth - completedDaysInMonth, 0);

    const monthData: CalendarGridData = {
      dayCells: Array.from({ length: totalDaysInMonth }, (_, index) => ({
        index,
        isCompleted: index < completedDaysInMonth,
      })),
      gridColumns: GRID_COLUMNS_MONTH,
      daysRemainingLabel: `${remainingDaysInMonth} day${remainingDaysInMonth === 1 ? '' : 's'} left this month`,
    };

    return {
      year: yearData,
      month: monthData,
    };
  }, [todayTimestamp, year]);

  const filledColor = whiteDefaults;
  const upcomingColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';

  useEffect(() => {
    const now = new Date();
    const startOfNextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const timeoutMs = Math.max(1000, startOfNextDay.getTime() - now.getTime());
    const timeoutId = setTimeout(() => setToday(new Date()), timeoutMs);
    return () => clearTimeout(timeoutId);
  }, [today]);

  // Status bar style effect
  useEffect(() => {
    setStatusBarStyleIfNeeded(defaultStatusBarStyle);
  }, [defaultStatusBarStyle, setStatusBarStyleIfNeeded]);
  // Status bar style effect
  useAnimatedReaction(
    () => {
      const transitionStartHeight = SCREEN_HEIGHT * 0.05;
      const transitionEndHeight = SCREEN_HEIGHT * 0;

      const progress = getProgressByHeight(
        animatedPosition.value,
        transitionStartHeight,
        transitionEndHeight
      );

      return progress >= 0.5 ? invertedStatusBarStyle : defaultStatusBarStyle;
    },
    (nextStyle, previousStyle) => {
      if (nextStyle !== previousStyle) {
        runOnJS(setStatusBarStyleIfNeeded)(nextStyle);
      }
    },
    [setStatusBarStyleIfNeeded, defaultStatusBarStyle, invertedStatusBarStyle]
  );
  // Status bar style effect
  useEffect(() => {
    const transitionStartHeight = SCREEN_HEIGHT * 0.2;
    const transitionEndHeight = SCREEN_HEIGHT * 0;
    const progress = getProgressByHeight(
      animatedPosition.value,
      transitionStartHeight,
      transitionEndHeight
    );

    const nextStyle: 'light' | 'dark' =
      progress >= 0.5 ? invertedStatusBarStyle : defaultStatusBarStyle;
    setStatusBarStyleIfNeeded(nextStyle);
  }, [animatedPosition, SCREEN_HEIGHT, setStatusBarStyleIfNeeded, defaultStatusBarStyle, invertedStatusBarStyle]);

  // Text and content animations
  const animatedTextStyle = useAnimatedStyle(() => {
    const transitionStartHeight = SCREEN_HEIGHT * 0.15; // Start transition when the sheet's top is at 60% of the screen
    const transitionEndHeight = SCREEN_HEIGHT * 0.1; // Complete transition when the sheet settles at 10% (top snap point)

    const progress = getProgressByHeight(
      animatedPosition.value,
      transitionStartHeight,
      transitionEndHeight
    );

    const color = interpolateColor(
      progress,
      [0, 1],
      [whiteDefaults, blackDefaults]
    );

    return {
      color,
    };
  });
  // Muted text animation
  const animatedMutedTextStyle = useAnimatedStyle(() => {
    const transitionStartHeight = SCREEN_HEIGHT * 0.15;
    const transitionEndHeight = SCREEN_HEIGHT * 0.1;

    const progress = getProgressByHeight(
      animatedPosition.value,
      transitionStartHeight,
      transitionEndHeight
    );

    const color = interpolateColor(
      progress,
      [0, 1],
      [whiteDefaults, blackDefaults]
    );

    return {
      color,
    };
  });
  // Bottom sheet content animation

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight((current) => (Math.abs(current - height) < 0.5 ? current : height));
  }, []);

  const handlePressAddTask = useCallback(() => {
    addTaskSheetRef.current?.present();
  }, []);

  const handleAddTask = useCallback((taskTitle: string) => {
    // Handle adding the task here - you can integrate with your state management or database
    console.log('New task:', taskTitle);
    // TODO: Add task to your task list/database
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className='flex-1 bg-background'>
        <StatusBar
          style={statusBarStyle}
          animated
          backgroundColor='transparent'
          translucent
        />
        {/* HEADER */}
        <View
          pointerEvents='none'
          className='absolute left-0 right-0 px-6'
          style={{
            paddingTop: insets.top + 24,
            zIndex: 6,
            elevation: 0,
          }}
          onLayout={handleHeaderLayout}
        >
          <View className="flex flex-row justify-between">
            <Animated.Text
              className="text-6xl font-nothing"
              style={animatedTextStyle}
            >
              {dayName}
            </Animated.Text>
            <Animated.Text
              className="text-3xl text-right leading-[30px] font-nothing"
              style={animatedMutedTextStyle}
              adjustsFontSizeToFit
            >
              {dayMonth}{'\n'} <Animated.Text className='text-4xl font-nothing' style={animatedMutedTextStyle}>{year}</Animated.Text>
            </Animated.Text>
          </View>
        </View>
        <View
          className='absolute left-0 right-0 px-6'
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: 24,
            zIndex: 4,
            elevation: 0,
          }}
          pointerEvents='box-none'
        >
          {/* BODY */}
          <CalendarView
            calendarData={calendarData}
            filledColor={filledColor}
            upcomingColor={upcomingColor}
          />
        </View>

        <AddTaskSheet
          ref={addTaskSheetRef}
          colorScheme={colorScheme}
          onAddTask={handleAddTask}
        />
        <BottomSheetContent
          bottomSheetRef={bottomSheetRef}
          animatedPosition={animatedPosition}
          whiteDefaults={whiteDefaults}
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
          headerHeight={headerHeight}
          onPressAddTask={handlePressAddTask}
        />

      </View>
    </GestureHandlerRootView>
  );
}
