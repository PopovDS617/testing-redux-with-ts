import React from 'react';
import { screen } from '@testing-library/react';
import { CartLink } from '../CartLink';

import { store } from '../../../app/store/store';

import {
  addToCart,
  updateQuantity,
  removeFromCart,
} from '../../../app/store/cartSlice';
import { act } from '@testing-library/react';
import testUtils from '../../../test-utils';

test('should contain a link', () => {
  testUtils.renderWithContext(<CartLink />);
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
});

test('should show text when there are no items', () => {
  testUtils.renderWithContext(<CartLink />);
  const link = screen.getByRole('link');
  expect(link).toHaveTextContent(/cart/i);
  expect(link).not.toHaveTextContent('1');
  expect(link).not.toHaveTextContent('0');
});
test('should show the correct number of items', () => {
  const state = testUtils.getStateWithItems({ testItem: 1 });
  const { store } = testUtils.renderWithContext(<CartLink />, state);

  const link = screen.getByRole('link');
  expect(link).toHaveTextContent('1');
  act(() => {
    store.dispatch(updateQuantity({ id: 'testItem', quantity: 5 }));
  });

  expect(link).toHaveTextContent('5');
  act(() => {
    store.dispatch(addToCart('secondTestItem'));
  });
  act(() => {
    store.dispatch(updateQuantity({ id: 'secondTestItem', quantity: 10 }));
  });
  expect(link).toHaveTextContent('15');
});
