import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

export type GridMode = 'year' | 'month';

export type DayCell = {
  index: number;
  isCompleted: boolean;
};

export type CalendarGridData = {
  dayCells: DayCell[];
  gridColumns: number;
  daysRemainingLabel: string;
};

export const GRID_COLUMNS_YEAR = 20;
export const GRID_COLUMNS_MONTH = 7;
const GRID_SPACING = 4;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const GRID_MODES: GridMode[] = ['year', 'month'];
const DOUBLE_TAP_DELAY = 300;

// Counter animation constants
const CHAR_TRAVEL = 18;
const CHAR_DELAY = 18;
const CHAR_DURATION = 220;

type CounterChar = {
  id: string;
  raw: string;
  char: string;
};

type AnimatedCounterCharacterProps = {
  char: string;
  index: number;
  mode: 'in' | 'out';
  offsetMultiplier: number;
  textClassName?: string;
};

const AnimatedCounterCharacter = React.memo(
  ({ char, index, mode, offsetMultiplier, textClassName }: AnimatedCounterCharacterProps) => {
    const progress = useSharedValue(mode === 'in' ? 0 : 1);

    useEffect(() => {
      progress.value = withDelay(
        index * CHAR_DELAY,
        withTiming(mode === 'in' ? 1 : 0, {
          duration: CHAR_DURATION,
          easing: Easing.out(Easing.cubic),
        })
      );
    }, [index, mode, progress]);

    const animatedStyle = useAnimatedStyle(
      () => ({
        opacity: progress.value,
        transform: [
          {
            translateY:
              offsetMultiplier * (1 - progress.value) * CHAR_TRAVEL,
          },
        ],
      }),
      [offsetMultiplier]
    );

    return (
      <Animated.Text className={textClassName} style={animatedStyle}>
        {char}
      </Animated.Text>
    );
  }
);

AnimatedCounterCharacter.displayName = 'AnimatedCounterCharacter';

type AnimatedCounterLabelProps = {
  value: string;
  direction: 'up' | 'down';
  className?: string;
  textClassName?: string;
};

const AnimatedCounterLabel: React.FC<AnimatedCounterLabelProps> = ({
  value,
  direction,
  className,
  textClassName,
}) => {
  const idRef = useRef(0);
  const makeEntries = useCallback(
    (text: string): CounterChar[] =>
      text.split('').map((raw, index) => ({
        id: `${idRef.current++}-${index}`,
        raw,
        char: raw === ' ' ? '\u00A0' : raw,
      })),
    []
  );

  const [currentChars, setCurrentChars] = useState<CounterChar[]>(() => makeEntries(value));
  const [outgoingChars, setOutgoingChars] = useState<CounterChar[] | null>(null);

  useEffect(() => {
    const currentValue = currentChars.map((item) => item.raw).join('');
    if (currentValue === value) {
      return;
    }

    setOutgoingChars(currentChars);
    setCurrentChars(makeEntries(value));
  }, [value, currentChars, makeEntries]);

  useEffect(() => {
    if (!outgoingChars?.length) {
      return;
    }

    const timeout = setTimeout(() => setOutgoingChars(null), CHAR_DURATION + CHAR_DELAY * Math.max(outgoingChars.length - 1, 0) + 60);
    return () => clearTimeout(timeout);
  }, [outgoingChars]);

  const incomingMultiplier = direction === 'up' ? 1 : -1;
  const outgoingMultiplier = direction === 'up' ? -1 : 1;

  return (
    <View className={className} style={counterStyles.container}>
      {outgoingChars && (
        <View pointerEvents='none' style={counterStyles.absoluteRow}>
          {outgoingChars.map((item, index) => (
            <AnimatedCounterCharacter
              key={`out-${item.id}`}
              char={item.char}
              index={index}
              mode='out'
              offsetMultiplier={outgoingMultiplier}
              textClassName={textClassName}
            />
          ))}
        </View>
      )}
      <View style={counterStyles.row}>
        {currentChars.map((item, index) => (
          <AnimatedCounterCharacter
            key={`in-${item.id}`}
            char={item.char}
            index={index}
            mode='in'
            offsetMultiplier={incomingMultiplier}
            textClassName={textClassName}
          />
        ))}
      </View>
    </View>
  );
};

const counterStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  absoluteRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
});

type CalendarGridProps = {
  data: CalendarGridData;
  filledColor: string;
  upcomingColor: string;
};

const calendarGridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    aspectRatio: 1,
  },
  dot: {
    flex: 1,
    borderRadius: 9999,
  },
});

export const CalendarGrid = React.memo(({ data, filledColor, upcomingColor }: CalendarGridProps) => {
  const [gridWidth, setGridWidth] = useState<number | null>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setGridWidth((previous) => {
      if (previous !== null && Math.abs(previous - width) < 0.5) {
        return previous;
      }

      return width;
    });
  }, []);

  const cellSize = useMemo(() => {
    if (gridWidth === null) {
      return null;
    }

    const availableWidth = gridWidth - GRID_SPACING * (data.gridColumns - 1);
    return availableWidth / data.gridColumns;
  }, [gridWidth, data.gridColumns]);

  const totalRows = useMemo(
    () => Math.ceil(data.dayCells.length / data.gridColumns),
    [data.dayCells.length, data.gridColumns]
  );

  const cells = useMemo(() => {
    if (cellSize === null) {
      return null;
    }

    return data.dayCells.map((cell) => {
      const columnIndex = cell.index % data.gridColumns;
      const rowIndex = Math.floor(cell.index / data.gridColumns);

      return (
        <View
          key={cell.index}
          style={[
            calendarGridStyles.cell,
            {
              width: cellSize,
              marginRight: columnIndex === data.gridColumns - 1 ? 0 : GRID_SPACING,
              marginBottom: rowIndex === totalRows - 1 ? 0 : GRID_SPACING,
              opacity: cell.isCompleted ? 1 : 0.5,
            },
          ]}
        >
          <View
            style={[
              calendarGridStyles.dot,
              {
                backgroundColor: cell.isCompleted ? filledColor : upcomingColor,
              },
            ]}
          />
        </View>
      );
    });
  }, [cellSize, data.dayCells, data.gridColumns, filledColor, upcomingColor, totalRows]);

  return (
    <View onLayout={handleLayout} style={calendarGridStyles.container}>
      {cells}
    </View>
  );
});

CalendarGrid.displayName = 'CalendarGrid';

// Main Calendar Component Props
type CalendarViewProps = {
  calendarData: Record<GridMode, CalendarGridData>;
  filledColor: string;
  upcomingColor: string;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendarData,
  filledColor,
  upcomingColor,
}) => {
  const [gridMode, setGridMode] = useState<GridMode>('year');
  const [previousMode, setPreviousMode] = useState<GridMode | null>(null);
  const [isSwitchingModes, setIsSwitchingModes] = useState(false);
  const [labelDirection, setLabelDirection] = useState<'up' | 'down'>('down');
  const gridTransition = useSharedValue(1);
  const previousGridOpacity = useSharedValue(0);
  const lastTapRef = useRef<number>(0);

  const daysRemainingLabel = calendarData[gridMode].daysRemainingLabel;

  const handleGridModeChange = useCallback(
    (mode: GridMode) => {
      if (mode === gridMode || isSwitchingModes) {
        return;
      }

      setIsSwitchingModes(true);
      setPreviousMode(gridMode);
      previousGridOpacity.value = 1;
      gridTransition.value = 0;
      setLabelDirection(mode === 'year' ? 'up' : 'down');
      setGridMode(mode);
    },
    [gridMode, isSwitchingModes, previousGridOpacity, gridTransition]
  );

  const animatedCurrentGridStyle = useAnimatedStyle(() => ({
    opacity: gridTransition.value,
    transform: [
      {
        scale: 0.94 + 0.06 * gridTransition.value,
      },
    ],
  }));

  const animatedPreviousGridStyle = useAnimatedStyle(() => ({
    opacity: previousGridOpacity.value,
    transform: [
      {
        scale: 1 - 0.04 * (1 - previousGridOpacity.value),
      },
    ],
  }));

  const toggleGridMode = useCallback(() => {
    const nextMode = gridMode === 'year' ? 'month' : 'year';
    handleGridModeChange(nextMode);
  }, [gridMode, handleGridModeChange]);

  const handleGridDoubleTap = useCallback(() => {
    if (isSwitchingModes) {
      return;
    }

    toggleGridMode();
  }, [isSwitchingModes, toggleGridMode]);

  const handleGridPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0;
      handleGridDoubleTap();
    } else {
      lastTapRef.current = now;
    }
  }, [handleGridDoubleTap]);

  const finishGridTransition = useCallback(() => {
    setPreviousMode(null);
    setIsSwitchingModes(false);
  }, []);

  useEffect(() => {
    gridTransition.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    if (previousMode) {
      previousGridOpacity.value = withTiming(
        0,
        {
          duration: 220,
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishGridTransition)();
          }
        }
      );
    } else {
      previousGridOpacity.value = 0;
      finishGridTransition();
    }
  }, [gridMode, gridTransition, previousMode, previousGridOpacity, finishGridTransition]);

  return (
    <View className='flex flex-col mt-24'>
      <View className='flex flex-row items-start justify-between mb-4'>
        <View>
          <AnimatedCounterLabel
            value={daysRemainingLabel}
            direction={labelDirection}
            className='mt-1'
            textClassName='text-sm font-nothing text-muted-foreground'
          />
        </View>
      </View>
      <Pressable
        onPress={handleGridPress}
        accessibilityRole='button'
        accessibilityLabel='Toggle calendar view'
        accessibilityHint={`Double tap to switch to ${gridMode === 'year' ? 'monthly' : 'yearly'} view`}
        accessibilityState={{ busy: isSwitchingModes }}
      >
        <View style={{ position: 'relative' }}>
          {previousMode && (
            <Animated.View
              pointerEvents='none'
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                },
                animatedPreviousGridStyle,
              ]}
            >
              <CalendarGrid
                data={calendarData[previousMode]}
                filledColor={filledColor}
                upcomingColor={upcomingColor}
              />
            </Animated.View>
          )}
          <Animated.View style={[animatedCurrentGridStyle]}>
            <CalendarGrid
              data={calendarData[gridMode]}
              filledColor={filledColor}
              upcomingColor={upcomingColor}
            />
          </Animated.View>
        </View>
      </Pressable>
      <View className='rounded-full border border-muted/40 bg-muted/10 px-3 py-1 flex items-center mt-3 self-center'>
        <Text className='text-xs font-nothing text-muted-foreground'>
          Double tap the calendar to switch to {gridMode === 'year' ? 'month' : 'year'} view
        </Text>
      </View>
    </View>
  );
};

CalendarView.displayName = 'CalendarView';
