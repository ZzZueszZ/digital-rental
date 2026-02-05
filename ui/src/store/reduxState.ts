export interface ReduxState<T> {
  params?: unknown,
  data?: T,
  currentRequestId: string,
  loading: boolean,
  error?: unknown
}

export const InitialState = {
  currentRequestId: '',
  loading: false,
  error: undefined,
};
