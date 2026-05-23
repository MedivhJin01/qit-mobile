import { User } from '../types/user';

let accessToken: string | null = null;
let currentUser: User | null = null;
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(fn => fn());
}

export const authStore = {
  getToken: () => accessToken,
  setToken: (token: string | null) => {
    accessToken = token;
    notify();
  },
  getUser: () => currentUser,
  setUser: (user: User | null) => {
    currentUser = user;
    notify();
  },
  logout: () => {
    accessToken = null;
    currentUser = null;
    notify();
  },
  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  },
};
