import { Action, combineReducers, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import rootReducer, { IExtraReducers } from '@/store/rootReducer';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }).concat(thunk),
})

setupListeners(store.dispatch);

export const addExtraReducers = (extraReducers: IExtraReducers) => {
  store.replaceReducer(combineReducers({
    ...extraReducers,
    ...store.getState(), // Get existing state
    // [sliceName]: sliceReducer, // Add new slice
  }));
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
export default store;
export type AppStore = typeof store;
