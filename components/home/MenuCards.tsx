import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const menuItems = [
  {
    title: 'Korean Community',
    korTitle: '커뮤니티 보러가기',
    color: '#9013FE', // 버튼 기본 색상
    pressedColor: '#7310C8', // 버튼 눌렸을 때 색상
    icon: <MaterialIcons name="forum" size={24} color="white" />,
    route: '/(tabs)/feed',
  },
  {
    title: 'Ask Bera Questions 1:1',
    korTitle: 'Bera 선생님한테 1:1 질문하러 가기',
    color: '#4A90E2',
    pressedColor: '#357ABD',
    icon: <Ionicons name="school" size={24} color="white" />,
    route: '/consultations',
  },
  {
    title: 'Study Korean Game',
    korTitle: '한국어 게임 하러가기',
    color: '#FF9F40',
    pressedColor: '#E6842A',
    icon: <FontAwesome5 name="gamepad" size={24} color="white" />,
    route: '/game',
  },
];

export default function MenuCards() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <AnimatedButton
            key={index}
            title={item.title}
            korTitle={item.korTitle}
            color={item.color}
            pressedColor={item.pressedColor}
            icon={item.icon}
            route={item.route}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

function AnimatedButton({
  title,
  korTitle,
  color,
  pressedColor,
  icon,
  route,
}: {
  title: string;
  korTitle: string;
  color: string;
  pressedColor: string;
  icon: React.ReactNode;
  route: string;
}) {
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        setIsPressed(true); // 눌림 상태 활성화
        scale.value = withSpring(0.97, { damping: 6 });
      }}
      onPressOut={() => {
        setIsPressed(false); // 눌림 상태 해제
        scale.value = withSpring(1, { damping: 6 });
      }}
      onPress={() => router.push(route as any)}>
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: isPressed ? pressedColor : color }, // 배경색 변경
          animatedStyle,
        ]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>{icon}</View>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{korTitle}</Text>
          </View>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 배경색
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  menuContainer: {
    flex: 1,
  },
  button: {
    height: 60, // 버튼 높이 조정
    borderRadius: 16, // 버튼을 둥글게
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000', // 그림자 색상
    shadowOpacity: 0.4, // 그림자 투명도를 높임 (기존 0.15 → 0.4)
    shadowRadius: 3, // 그림자의 부드러움 조정 (기존 5 → 8)
    shadowOffset: { width: 4, height: 4 }, // 그림자의 방향과 거리 조정 (기존 높이 3 → 4)
    elevation: 7, // 안드로이드에서 그림자 강화 (기존 5 → 10)
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
  },
});
