import React from 'react';
import { render, screen } from '@testing-library/react';

import { Provider } from 'react-redux';
import { RootState } from './app/store/store';
import { Redirect, BrowserRouter as Router } from 'react-router-dom';
import { getStoreWithState } from './app/store/store';
import { Product } from './app/api';

const renderWithContext = (element: React.ReactElement, state?: RootState) => {
  const store = getStoreWithState(state);

  const utils = render(
    <Provider store={store}>
      <Router>{element}</Router>
    </Provider>
  );
  return { store, ...utils };
};

const getStateWithItems = (
  items: Record<string, number>,
  products: Record<string, Product> = {}
): RootState => {
  const state: RootState = {
    products: { products },
    cart: {
      errorMessage: '',
      checkoutState: 'READY',
      items,
    },
  };
  return state;
};

const testUtils = { renderWithContext, getStateWithItems };

export default testUtils;
