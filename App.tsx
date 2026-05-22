import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { authStore } from './src/store/authStore';

// TODO: remove when real auth is wired up
authStore.setUser({
  id: 1,
  username: 'Haoning Jin',
  email: 'medivhjin@gmail.com',
  authProvider: 'EMAIL',
  createdAt: '2025-01-01T00:00:00',
});

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
