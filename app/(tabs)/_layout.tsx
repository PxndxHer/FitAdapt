import { Tabs } from "expo-router";

import { AnimatedTabIcon } from "@/components/AnimatedTabIcon";
import { useAppTheme } from "@/components/theme";

/**
 * Navegación principal de la app: 4 pestañas inferiores.
 * Cada archivo hermano en esta carpeta (tabs) es una pestaña.
 */
export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="entrenar"
        options={{
          title: "Entrenar",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="barbell" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progreso"
        options={{
          title: "Progreso",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="stats-chart" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="person" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
