
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IAuthState, LoginResult } from '@/store/auth/data';
import { RootState } from '@/store';

const initialState: IAuthState = {
};

export const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthToken: (state, action: PayloadAction<LoginResult>) => {
      state.authUser = action.payload;
    },
    logOut: (state) => {
      state.authUser = undefined;
    },
  },
});

export const { setAuthToken, logOut } = slice.actions;

export const selectAuthState = (state: RootState) => ({ ...state.auth });
export const selectAuthToken = (state: RootState) => state.auth.authUser;

export const authReducer = slice.reducer;
