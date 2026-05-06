import { BlurView } from 'expo-blur';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import TaskListScreen from '../screens/tasks/TaskListScreen';
import RoutineListScreen from '../screens/routines/RoutineListScreen';
import GroupListScreen from '../screens/groups/GroupListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabIcon = (name: IoniconName, focusedName: IoniconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={24} color={color} />
  );

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
});

const screenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: '#8E8E93',
  tabBarStyle: styles.tabBar,
  tabBarBackground: () => (
    <BlurView intensity={80} tint="systemChromeMaterial" style={StyleSheet.absoluteFill} />
  ),
};

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{ tabBarIcon: tabIcon('checkmark-circle-outline', 'checkmark-circle') }}
      />
      <Tab.Screen
        name="Routines"
        component={RoutineListScreen}
        options={{ tabBarIcon: tabIcon('repeat-outline', 'repeat') }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupListScreen}
        options={{ tabBarIcon: tabIcon('people-outline', 'people') }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person-circle-outline', 'person-circle') }}
      />
    </Tab.Navigator>
  );
}
