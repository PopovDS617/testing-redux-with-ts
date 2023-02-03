import React from 'react';
import { screen, waitFor } from '@testing-library/dom';
import testUtils from '../../../test-utils';
import { Cart } from '../Cart';
import userEvent from '@testing-library/user-event';

import * as api from '../../../app/api';

type Product = api.Product;
const checkoutSpy = jest.spyOn(api, 'checkout');

test('an empty cart should not have any items', () => {
  testUtils.renderWithContext(<Cart />);
  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(2);
  screen.getByText('$0.00', { selector: '.total' });
});

test('cart should display correct total', () => {
  const state = testUtils.getStateWithItems(
    { testItem: 3 },
    {
      testItem: { name: 'test prod', price: 5 } as Product,
    }
  );
  testUtils.renderWithContext(<Cart />, state);
  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(3);
  const price = screen.getByText('$15.00', { selector: '.total' });
});

test('updating product quantity should update total', async () => {
  const user = userEvent.setup();
  const state = testUtils.getStateWithItems(
    { testItem: 3 },
    {
      testItem: { name: 'test prod', price: 5 } as Product,
    }
  );
  testUtils.renderWithContext(<Cart />, state);
  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(3);
  screen.getByText('$15.00', { selector: '.total' });
  const input = screen.getByLabelText(/test prod quantity/i);
  await user.clear(input);
  await user.tab();
  screen.getByText('$0.00', { selector: '.total' });
  await user.type(input, '20');
  await user.tab();
  screen.getByText('$100.00', { selector: '.total' });
});

test('removing items should update total', async () => {
  const user = userEvent.setup();
  const state = testUtils.getStateWithItems(
    { carrots: 2, cherries: 45 },
    {
      carrots: { name: 'carrots', price: 5 } as Product,
      cherries: { name: 'cherries', price: 1 } as Product,
    }
  );
  testUtils.renderWithContext(<Cart />, state);
  screen.getByText('$55.00', { selector: '.total' });
  const removeCherriesButton = screen.getByTitle(/remove cherries/i); // title, not label as usual
  const removeCarrotsButton = screen.getByTitle(/remove carrots/i); //
  await user.click(removeCherriesButton);

  screen.getByText('$10.00', { selector: '.total' });
  await user.click(removeCarrotsButton);

  screen.getByText('$0.00', { selector: '.total' });
});

test('cannot checkout if the cart is empty', async () => {
  checkoutSpy.mockRejectedValueOnce(new Error('Cart must not be empty')); // new reject value provided by spy
  const user = userEvent.setup();
  testUtils.renderWithContext(<Cart />);
  const checkout = screen.getByRole('button', { name: /checkout/i });
  expect(checkout).toBeInTheDocument();
  const table = screen.getByRole('table');
  expect(table).not.toHaveClass('checkoutLoading');
  await user.click(checkout);
  await screen.findByText(/cart must not be empty/i, { selector: '.errorBox' });
  expect(table).toHaveClass('checkoutError');
});

test('should clear items after cleanup', async () => {
  checkoutSpy.mockResolvedValueOnce({ success: true });
  const user = userEvent.setup();
  const state = testUtils.getStateWithItems(
    { carrots: 2, cherries: 45 },
    {
      carrots: { name: 'carrots', price: 5 } as Product,
      cherries: { name: 'cherries', price: 1 } as Product,
    }
  );
  testUtils.renderWithContext(<Cart />, state);
  screen.getByText('$55.00', { selector: '.total' });
  expect(screen.getAllByRole('row')).toHaveLength(4);
  const checkoutButton = screen.getByRole('button', { name: /checkout/i });
  const table = screen.getByRole('table');

  await user.click(checkoutButton);
  // await waitFor(() => expect(table).toHaveClass('checkoutLoading'));
  await waitFor(() => {
    screen.getByText('$0.00', { selector: '.total' });
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(table).not.toHaveClass('checkoutError');
  });
});
