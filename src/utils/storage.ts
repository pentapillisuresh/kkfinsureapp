import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'userData';
const ISLOGIN_KEY = 'isLogin';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const storeToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const storeUser = async (user: User) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<User | null> => {
  const user = await SecureStore.getItemAsync(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user) as User;
  } catch (error) {
    console.error("Failed to parse user data:", error);
    return null;
  }
};

export const removeUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const storeIsLogin = async (isLogin: string) => {
  await SecureStore.setItemAsync(ISLOGIN_KEY, isLogin);
};

export const getIsLogin = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(ISLOGIN_KEY);
};

export const removeIsLogin = async () => {
  await SecureStore.deleteItemAsync(ISLOGIN_KEY);
};