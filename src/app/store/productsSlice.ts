import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { Product } from '../api';

export interface ProductState {
  products: { [id: string]: Product };
}

const initialState: ProductState = {
  products: {},
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    receivedProducts(state, action: PayloadAction<Product[]>) {
      const products = action.payload;
      products.forEach((product) => {
        state.products[product.id] = product;
      });
    },
  },
});

export default productsSlice.reducer;
export const { receivedProducts } = productsSlice.actions;
