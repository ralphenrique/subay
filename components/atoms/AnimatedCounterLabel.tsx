import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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

export type AnimatedCounterLabelProps = {
  value: string;
  direction: 'up' | 'down';
  className?: string;
  textClassName?: string;
};

export const AnimatedCounterLabel: React.FC<AnimatedCounterLabelProps> = ({
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
    <View className={className} style={styles.container}>
      {outgoingChars && (
        <View pointerEvents='none' style={styles.absoluteRow}>
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
      <View style={styles.row}>
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

const styles = StyleSheet.create({
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

AnimatedCounterLabel.displayName = 'AnimatedCounterLabel';
