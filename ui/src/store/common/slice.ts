
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { CommonState } from '@/store/common/data';
import { RootState } from '@/store';

const initialState: CommonState = {
}

const slice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    }
  },
})

export const { setLanguage } = slice.actions

export const selectLanguage = (state: RootState) => state.common.language;
export const selectPageLoading = (state: RootState) => state.common.pageLoading;

export const commonReducer = slice.reducer;
