import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { authReducer } from '@/store/auth/slice';
import { commonReducer } from '@/store/common/slice';
import { encryptTransform } from 'redux-persist-transform-encrypt';

const encryptor = encryptTransform({
  secretKey: '123456789oO#!@#',
  onError: function (error) {
    // Handle the error here
    console.error(error);
  },
})

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: number) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const authPersistConfig = {
  key: "auth",
  storage: storage,
  transforms: [encryptor],
  whitelist: ["authUser"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export interface IExtraReducers {
  [key: string]: unknown;
  auth?: never;
  myUser?: never;
  setting?: never;
  config?: never;
}

export const defaultReducers = {
  auth: persistedAuthReducer,
  common: commonReducer,
};

const rootReducer = combineReducers(defaultReducers);

export default rootReducer;
