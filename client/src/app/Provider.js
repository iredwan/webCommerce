'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';

export function Provider({ children }) {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
