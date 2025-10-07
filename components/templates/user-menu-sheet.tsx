import React, { useRef, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Cloud, LogIn, LogOut, Settings, User } from 'lucide-react-native';

export type UserMenuSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type UserMenuSheetProps = {
  colorScheme: 'light' | 'dark' | undefined;
  onDismiss?: () => void;
  onDismissStart?: () => void;
};

export const UserMenuSheet = forwardRef<UserMenuSheetRef, UserMenuSheetProps>(
  ({ colorScheme, onDismiss, onDismissStart }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { user, isSignedIn } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const snapPoints = useMemo(() => ['50%'], []);

    const animationConfigs = useBottomSheetSpringConfigs({
      damping: 80,
      stiffness: 500,
    });

    const bgColor = useMemo(() => colorScheme === 'dark' ? '#ffffff' : '#000000', [colorScheme]);
    const textColor = useMemo(() => colorScheme === 'dark' ? '#000000' : '#ffffff', [colorScheme]);
    const iconColor = useMemo(() => colorScheme === 'dark' ? '#000000' : '#666666', [colorScheme]);

    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetModalRef.current?.present();
      },
      dismiss: () => {
        onDismissStart?.();
        bottomSheetModalRef.current?.dismiss();
      },
    }), [onDismissStart]);

    const handleSignIn = useCallback(() => {
      onDismissStart?.();
      bottomSheetModalRef.current?.dismiss();
      router.push('/(auth)/sign-in');
    }, [router, onDismissStart]);

    const handleSignOut = useCallback(async () => {
      try {
        await signOut();
      } finally {
        onDismissStart?.();
        bottomSheetModalRef.current?.dismiss();
      }
    }, [signOut, onDismissStart]);

    const handleSettings = useCallback(() => {
      onDismissStart?.();
      bottomSheetModalRef.current?.dismiss();
      console.log('Navigate to settings');
    }, [onDismissStart]);

    const handleClose = useCallback(() => {
      onDismissStart?.();
      bottomSheetModalRef.current?.dismiss();
    }, [onDismissStart]);

    const handleModalDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

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

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        animationConfigs={animationConfigs}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: bgColor,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          elevation: 5,
        }}
        handleIndicatorStyle={{ backgroundColor: textColor, width: 40, height: 4 }}
        containerStyle={{ zIndex: 11 }}
        stackBehavior="push"
        enableContentPanningGesture={false}
        onDismiss={handleModalDismiss}
        onChange={(index) => {
          if (index === -1) {
            onDismissStart?.();
          }
        }}
      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          {isSignedIn && user ? (
            <View className="gap-4">
              {/* User Profile Section */}
              <View className="flex-row items-center gap-3 pb-3 border-b border-border">
                <Avatar
                  alt={user.fullName || user.emailAddresses?.[0]?.emailAddress || 'User'}
                  className="w-10 h-10"
                >
                  {user.imageUrl ? (
                    <AvatarImage source={{ uri: user.imageUrl }} />
                  ) : (
                    <AvatarFallback>
                      <User size={20} color={iconColor} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <View className="flex-1">
                  <Text className="text-sm font-nothing font-semibold" style={{ color: textColor }}>
                    {user.fullName || 'User'}
                  </Text>
                  <Text className="text-xs font-nothing text-muted-foreground">
                    {user.emailAddresses?.[0]?.emailAddress || ''}
                  </Text>
                </View>
              </View>

              {/* Cloud Sync Status */}
              <View className="flex-row items-center gap-2 p-2 rounded-lg bg-muted/20">
                <Cloud size={16} color="#10b981" />
                <Text className="text-xs font-nothing text-muted-foreground">
                  Synced to cloud
                </Text>
              </View>

              {/* Menu Options */}
              <View className="gap-1">
                <Button variant="ghost" className="justify-start h-10" onPress={handleSettings}>
                  <View className="flex-row items-center gap-3">
                    <Settings size={16} color={iconColor} />
                    <Text className="text-sm font-nothing" style={{ color: textColor }}>
                      Settings
                    </Text>
                  </View>
                </Button>

                <Button variant="ghost" className="justify-start h-10" onPress={handleSignOut}>
                  <View className="flex-row items-center gap-3">
                    <LogOut size={16} color={iconColor} />
                    <Text className="text-sm font-nothing" style={{ color: textColor }}>
                      Sign Out
                    </Text>
                  </View>
                </Button>
              </View>
            </View>
          ) : (
            <View className="gap-4">
              {/* Guest Mode Info */}
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Cloud size={16} color={iconColor} />
                  <Text className="text-sm font-nothing font-semibold" style={{ color: textColor }}>
                    Guest Mode
                  </Text>
                </View>
                <Text className="text-xs font-nothing text-muted-foreground">
                  Your tasks are saved locally. Sign in to sync across devices and back up to the
                  cloud.
                </Text>
              </View>

              {/* Sign In Button */}
              <Button className="w-full h-10" onPress={handleSignIn}>
                <View className="flex-row items-center gap-2">
                  <LogIn size={16} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
                  <Text>Sign In</Text>
                </View>
              </Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

UserMenuSheet.displayName = 'UserMenuSheet';
