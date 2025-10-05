import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, type DimensionValue } from 'react-native';
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
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const GRID_MODES: GridMode[] = ['year', 'month'];

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
    marginHorizontal: -1,
  },
  cell: {
    aspectRatio: 1,
    padding: 1,
  },
  dot: {
    flex: 1,
    borderRadius: 9999,
  },
});

export const CalendarGrid = React.memo(({ data, filledColor, upcomingColor }: CalendarGridProps) => {
  const cellWidth = useMemo<DimensionValue>(
    () => (`${100 / data.gridColumns}%` as DimensionValue),
    [data.gridColumns]
  );

  const cells = useMemo(
    () =>
      data.dayCells.map((cell) => (
        <View
          key={cell.index}
          style={[
            calendarGridStyles.cell,
            {
              width: cellWidth,
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
      )),
    [data.dayCells, cellWidth, filledColor, upcomingColor]
  );

  return <View style={calendarGridStyles.container}>{cells}</View>;
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
        <View className='flex flex-row overflow-hidden rounded-full border border-muted/40 bg-muted/10'>
          {GRID_MODES.map((mode) => {
            const isActive = gridMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => handleGridModeChange(mode)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: isActive,
                  busy: isSwitchingModes && isActive,
                }}
                disabled={isSwitchingModes && !isActive}
                className={`px-3 py-1 ${isActive ? 'bg-foreground' : 'bg-transparent'} ${isSwitchingModes && !isActive ? 'opacity-60' : ''
                  }`}
              >
                <Text
                  className={`text-xs font-nothing ${isActive ? 'text-background' : 'text-muted-foreground'
                    }`}
                >
                  {mode === 'year' ? 'Year' : 'Month'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
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
        <Animated.View
          style={[
            animatedCurrentGridStyle,
          ]}
        >
          <CalendarGrid
            data={calendarData[gridMode]}
            filledColor={filledColor}
            upcomingColor={upcomingColor}
          />
        </Animated.View>
      </View>
    </View>
  );
};

CalendarView.displayName = 'CalendarView';
