import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Animated, KeyboardAvoidingView, Alert, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useSharedValue,
  configureReanimatedLogger,
  ReanimatedLogLevel,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboarding';

import '../global.css';
import { healthCheckApi } from '~/services/authService';
import { checkAppVersion } from '~/services/checkVersionService';
import { useCountryData } from '~/store/countryStore';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

// 앱 최상단에 알림 핸들러 설정 -----------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
// -----------------------------
export default function RootLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const logoScale = useSharedValue(0);
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 버전 체크 useEffect 추가
  useEffect(() => {
    const checkVersion = async () => {
      const { needsUpdate, storeUrl } = await checkAppVersion();

      if (needsUpdate) {
        Alert.alert(
          'Update Required',
          'There is a new version available. Please update from the store.',
          [
            {
              text: 'Update',
              onPress: () => Linking.openURL(storeUrl),
            },
          ],
          { cancelable: false } // 사용자가 알림을 무시할 수 없게 설정
        );
      }
    };

    checkVersion();
  }, []); // 앱 시작시 한번만 실행

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1분
        gcTime: 1000 * 60 * 5, // 5분
      },
    },
  });

  // 애니메이션 스타일 정의
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const userInfo = useAuthStore((state) => state.userInfo);
  //console.log('userInfo', userInfo);

  const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
  //console.log('hasSeenOnboarding', hasSeenOnboarding);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // await healthCheckApi();
        await checkAuth();

        if (isAuthenticated && userInfo) {
          // 약관 동의 체크
          if (!userInfo.terms_agreed || !userInfo.privacy_agreed) {
            //console.log('약관 동의 안됨');
            router.replace('/terms-check');
          }
        } else if (!loading && isAuthenticated === false) {
          //console.log('인증 실패');
          if (hasSeenOnboarding) {
            router.replace('/login');
          } else {
            router.replace('/first');
          }
        }
      } catch (error) {
        //console.log('인증 실패');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, loading]);

  // expo-notifications 설정 -----------------------------
  useEffect(() => {
    // 알림 수신 리스너 설정
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      //console.log('Notification received:', notification);
    });

    // 알림 응답 리스너 설정 (사용자가 알림을 탭했을 때)
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      //console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  // -----------------------------

  if (loading || isAuthenticated === null) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}>
          <Animated.Image
            source={require('../assets/icon.png')}
            style={[{ width: 150, height: 150 }, animatedStyle]}
          />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <Stack>
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(stack)" options={{ headerShown: false }} />
              <Stack.Screen name="game" options={{ headerShown: false }} />
              <Stack.Screen
                name="voca"
                options={{
                  headerTitle: 'Voca Section',
                  headerShown: false,
                  headerTintColor: '#D812DC',
                }}
              />
              <Stack.Screen name="event" options={{ headerShown: false }} />
              <Stack.Screen name="write" options={{ headerShown: false }} />
              <Stack.Screen name="consultations" options={{ headerShown: false }} />
              <Stack.Screen name="board" options={{ headerShown: false }} />
              <Stack.Screen name="setting" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />

              {/* <Stack.Screen name="consultations" options={{ headerShown: false }} /> */}
            </Stack>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
