import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import { useAuthUser } from '../hooks/useAuthStore';

export type RootStackParamList = {
  Main: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 🚧 DEV ONLY — set to true to skip login and go straight to the home screen
const DEV_BYPASS_AUTH = true;

function RootNavigator() {
  const user = useAuthUser();

  if (!DEV_BYPASS_AUTH && !user) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
