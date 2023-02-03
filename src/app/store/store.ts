import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../store/cartSlice';
import productsReducer from '../store/productsSlice';

const reducer = { cart: cartReducer, products: productsReducer };

export const store = configureStore({ reducer });

export const getStoreWithState = (preloadedState?: RootState) => {
  return configureStore({ reducer, preloadedState });
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
