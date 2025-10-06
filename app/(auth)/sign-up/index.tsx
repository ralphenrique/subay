import { SignUpForm } from '@/components/pages/sign-up-form';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();

  // Redirect to home if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe ios:mt-0"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <SignUpForm />
      </View>
    </ScrollView>
  );
}
