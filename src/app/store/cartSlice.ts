import {
  PayloadAction,
  createSlice,
  createSelector,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { RootState, AppDispatch } from './store';
import { checkout, CartItems } from '../api';

type ChekoutState = 'LOADING' | 'READY' | 'ERROR';

export interface CartState {
  items: { [productId: string]: number };
  checkoutState: ChekoutState;
  errorMessage: string;
}

const initialState: CartState = {
  items: {},
  checkoutState: 'READY',
  errorMessage: '',
};

export const checkoutCart = createAsyncThunk<
  { success: boolean },
  undefined,
  { state: RootState }
>('cart/checkout', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const items = state.cart.items;
  const response = await checkout(items);
  return response;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
      } else {
        state.items[id] = 1;
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    },
  },
  extraReducers: function (builder) {
    builder.addCase(checkoutCart.pending, (state) => {
      state.checkoutState = 'LOADING';
    }),
      builder.addCase(
        checkoutCart.fulfilled,
        (state, action: PayloadAction<{ success: boolean }>) => {
          const { success } = action.payload;
          if (success) {
            state.checkoutState = 'READY';
            state.items = {};
          } else {
            state.checkoutState = 'ERROR';
          }
          state.checkoutState = 'READY';
        }
      ),
      builder.addCase(checkoutCart.rejected, (state, action) => {
        state.checkoutState = 'ERROR';
        state.errorMessage = action.error.message || '';
      });
  },
});
export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;

export function getNumItems(state: RootState) {
  let numItems = 0;
  for (let id in state.cart.items) {
    numItems += state.cart.items[id];
  }
  return numItems;
}

export const getMomizedNumItems = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let numItems = 0;
    for (let id in items) {
      numItems += items[id];
    }
    return numItems;
  }
);

export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.products.products,
  (items, products) => {
    let total = 0;
    for (let id in items) {
      total += products[id].price * items[id];
    }
    return total.toFixed(2);
  }
);
