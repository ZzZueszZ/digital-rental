import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PropsWithChildren, useEffect } from 'react';
import { IExtraReducers } from '@/store/rootReducer';
import { addExtraReducers, store } from '@/store/index';

export interface AppConfigProviderProps {
  extraReducers?: IExtraReducers;
}
persistStore(store);

export function ReduxProvider({ extraReducers, children }: AppConfigProviderProps & PropsWithChildren) {
  useEffect(() => {
    if (extraReducers) {
      addExtraReducers(extraReducers);
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
