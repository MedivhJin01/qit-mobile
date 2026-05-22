import { useSyncExternalStore } from 'react';
import { authStore } from '../store/authStore';

export function useAuthUser() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getUser,
  );
}
