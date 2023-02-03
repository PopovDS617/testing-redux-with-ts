import React from 'react';
import testUtils from '../../../test-utils';
import { Products } from '../Products';
import {
  screen,
  waitFor,
  findByRole,
  getByRole,
  getByTestId,
} from '@testing-library/react';
import * as api from '../../../app/api';
import mockProducts from '../../../../public/products.json';
import userEvent from '@testing-library/user-event';

const getProductsSpy = jest.spyOn(api, 'getProducts');
getProductsSpy.mockResolvedValue(mockProducts);

test('a list of products should be fetched', async () => {
  const { debug } = testUtils.renderWithContext(<Products />);
  // debug();
  await waitFor(() => expect(getProductsSpy).toHaveBeenCalledTimes(1));
  // debug();
  const articles = screen.getAllByRole('article');
  expect(articles.length).toEqual(mockProducts.length);
});

test('each individual product should contain a heading', async () => {
  testUtils.renderWithContext(<Products />);
  for (let product of mockProducts) {
    await screen.findByRole('heading', { name: product.name }); // find by role waits for headings
  }
});

test('should be able to add a banan to the cart v1', async () => {
  const { store } = testUtils.renderWithContext(<Products />);
  const heading = await screen.findByRole('heading', { name: /Bananas/i });
  expect(heading).toBeInTheDocument();
  const parentDiv = heading.parentNode;
  const button = getByRole(parentDiv as HTMLDivElement, 'button');
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect(store.getState().cart.items['207']).toEqual(1);
  await userEvent.click(button);
  await userEvent.click(button);
  expect(store.getState().cart.items['207']).toEqual(3);
});

test('should be able to add a banan to the cart v2', async () => {
  const { store } = testUtils.renderWithContext(<Products />);
  const button = await screen.findByRole('button', { name: /Bananas/i }); // name in button's aria-label
  //const button = await screen.findByLabelText('button', { name: /Bananas/i }); // name in button's aria-label

  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect(store.getState().cart.items['207']).toEqual(1);
  await userEvent.click(button);

  expect(store.getState().cart.items['207']).toEqual(2);
});
