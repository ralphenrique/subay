import React, { useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View, Keyboard, TextInput } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react-native';

export type AddTaskSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type AddTaskSheetProps = {
  colorScheme: 'light' | 'dark' | undefined;
  onAddTask?: (taskTitle: string) => void;
  onDismiss?: () => void;
  onDismissStart?: () => void;
};

export const AddTaskSheet = forwardRef<AddTaskSheetRef, AddTaskSheetProps>(
  ({ colorScheme, onAddTask, onDismiss, onDismissStart }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [taskTitle, setTaskTitle] = React.useState('');

    const snapPoints = useMemo(() => ['80%'], []);

    const animationConfigs = useBottomSheetSpringConfigs({
      damping: 80,
      stiffness: 500,
    });

    const bgColor = useMemo(() => colorScheme === 'dark' ? '#ffffff' : '#000000', [colorScheme]);
    const textColor = useMemo(() => colorScheme === 'dark' ? '#000000' : '#ffffff', [colorScheme]);
    const inputBgColor = useMemo(() => colorScheme === 'dark' ? '#f5f5f5' : '#1a1a1a', [colorScheme]);
    const inputTextColor = useMemo(() => colorScheme === 'dark' ? '#000000' : '#ffffff', [colorScheme]);
    const placeholderColor = useMemo(() => colorScheme === 'dark' ? '#666666' : '#999999', [colorScheme]);

    const resetForm = useCallback(() => {
      setTaskTitle('');
      Keyboard.dismiss();
    }, []);

    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        onDismissStart?.();
        bottomSheetModalRef.current?.dismiss();
      },
    }), [onDismissStart]);

    const handleAddTask = () => {
      if (taskTitle.trim()) {
        onAddTask?.(taskTitle.trim());
      }
      console.log('AddTaskSheet: handleAddTask - calling dismiss');
      onDismissStart?.();
      bottomSheetModalRef.current?.dismiss();
    };

    const handleClose = useCallback(() => {
      console.log('AddTaskSheet: handleClose - calling dismiss');
      onDismissStart?.();
      bottomSheetModalRef.current?.dismiss();
    }, [onDismissStart]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.8}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleDismiss = useCallback(() => {
      console.log('AddTaskSheet: handleDismiss called');
      resetForm();
      onDismiss?.();
    }, [resetForm, onDismiss]);

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        animationConfigs={animationConfigs}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: bgColor, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5 }}
        handleIndicatorStyle={{ display: 'none' }}
        containerStyle={{ zIndex: 12 }}
        keyboardBehavior='extend'
        keyboardBlurBehavior='none'
        onDismiss={handleDismiss}
        onChange={(index) => {
          if (index === -1) {
            onDismissStart?.();
          }
        }}

      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text
              className="text-2xl font-nothing"
              style={{ color: textColor }}
            >
              Add task · Today
            </Text>
            <Button
              className="w-10 h-10 rounded-full items-center justify-center p-0"
              onPress={handleClose}
              style={{ backgroundColor: inputBgColor }}
            >
              <View pointerEvents="none">
                <X size={20} color={textColor} />
              </View>
            </Button>
          </View>

          {/* Text Input */}
          <TextInput
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Task title"
            placeholderTextColor={placeholderColor}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
            blurOnSubmit

            className="font-nothing text-lg mb-6 p-4 rounded-2xl min-h-[120px]"
            style={{
              backgroundColor: inputBgColor,
              color: inputTextColor,
            }}
          />

          {/* Action Buttons */}
          <View className="flex-row gap-4">
            <Button
              className="flex-1 h-14 rounded-full items-center justify-center"
              onPress={handleAddTask}
              disabled={!taskTitle.trim()}
              style={{
                opacity: taskTitle.trim() ? 1 : 0.5,
              }}
            >
              <Text className="font-nothing text-lg" style={{ color: textColor }}>
                Add Task
              </Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

AddTaskSheet.displayName = 'AddTaskSheet';
