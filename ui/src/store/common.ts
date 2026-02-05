export type ReduxState<T> = T & {
  currentRequestId: string;
  loading: boolean;
  error?: unknown;
};
export const InitialState: ReduxState<unknown> = {
  currentRequestId: '',
  loading: false,
};
