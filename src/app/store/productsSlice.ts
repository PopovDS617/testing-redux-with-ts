import { createSlice } from '@reduxjs/toolkit';
import type { Product } from '../api';

export interface ProductState {
  products: { [id: string]: Product };
}

const initialState: ProductState = {
  products: {
    one: {
      name: 'testprod',
    },
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
});

export default productsSlice.reducer;
