import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TaskListScreen    from '../screens/tasks/TaskListScreen';
import RoutineListScreen from '../screens/routines/RoutineListScreen';
import GroupListScreen   from '../screens/groups/GroupListScreen';
import ProfileScreen     from '../screens/profile/ProfileScreen';
import { LiquidGlassTabBar } from './LiquidGlassTabBar';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Tasks"    component={TaskListScreen} />
      <Tab.Screen name="Routines" component={RoutineListScreen} />
      <Tab.Screen name="Groups"   component={GroupListScreen} />
      <Tab.Screen name="Account"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}
