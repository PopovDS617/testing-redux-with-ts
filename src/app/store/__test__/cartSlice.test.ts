import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import cartReducer, {
  CartState,
  addToCart,
  removeFromCart,
  updateQuantity,
  getNumItems,
  getMomizedNumItems,
  getTotalPrice,
  checkoutCart,
} from '../cartSlice';
import { ProductState } from '../productsSlice';
import type { RootState } from '../store';
import { getStoreWithState } from '../store';
import products from '../../../../public/products.json';
import * as api from '../../api';

const mockStore = configureStore([thunk]);

jest.mock('../../../app/api', () => {
  return {
    async getProducts() {
      return [];
    },
    async checkout(items: api.CartItems = {}) {
      const empty = Object.keys(items).length === 0;
      if (empty) throw new Error('Must include cart items');
      if (items.evilItem > 0) throw new Error();
      if (items.badItem > 0) return { success: false };
      return { success: true };
    },
  };
});

test('checkout should work', async () => {
  await api.checkout({ fakeItem: 4 });
});

describe('cart reducer', () => {
  test('an empty action', () => {
    const initialState = undefined;
    const action = { type: '' };
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMessage: '',
      items: {},
    });
  });
  test('addToCart', () => {
    const initialState = undefined;
    const action = addToCart('abc');
    let state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMessage: '',
      items: { abc: 1 },
    });
    state = cartReducer(state, action);
    state = cartReducer(state, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMessage: '',
      items: { abc: 3 },
    });
  });
  test('removeFromCart', () => {
    const initialState: CartState = {
      checkoutState: 'READY',
      errorMessage: '',
      items: { abc: 5, def: 5 },
    };

    const action = removeFromCart('abc');
    let state = cartReducer(initialState, action);

    expect(state).toEqual({
      checkoutState: 'READY',
      errorMessage: '',
      items: { def: 5 },
    });
  });

  test('updateQuantity', () => {
    const initialState: CartState = {
      checkoutState: 'READY',
      errorMessage: '',
      items: { abc: 5, def: 5 },
    };
    const action = updateQuantity({ id: 'abc', quantity: 10 });
    let state = cartReducer(initialState, action);
    expect(state.items.abc).toEqual(10);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMessage: '',
      items: { abc: 10, def: 5 },
    });
  });
});

describe('selectors', () => {
  describe('getNumItems', () => {
    it('should return 0 with no items', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: {},
      };
      const result = getNumItems({ cart } as RootState);
      expect(result).toEqual(0);
    });
    it('should add up the total', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: { abc: 3, def: 10 },
      };
      const result = getNumItems({ cart } as RootState);
      expect(result).toEqual(13);
    });
  });
  describe('getMemoizedNumItems', () => {
    it('should  return 0 with no items', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: {},
      };
      const result = getMomizedNumItems({ cart } as RootState);
      expect(result).toEqual(0);
    });
    it('shold add up to the totals', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: { abc: 3 },
      };
      const result = getMomizedNumItems({ cart } as RootState);
      expect(result).toEqual(3);
    });
    it('should not compute again with the same state', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: { abc: 3 },
      };

      getMomizedNumItems.resetRecomputations();
      getMomizedNumItems({ cart } as RootState);
      expect(getMomizedNumItems.recomputations()).toEqual(1);
      getMomizedNumItems({ cart } as RootState);
      getMomizedNumItems({ cart } as RootState);
      getMomizedNumItems({ cart } as RootState);
      getMomizedNumItems({ cart } as RootState);
      expect(getMomizedNumItems.recomputations()).toEqual(1);
    });

    it('should recompute with new state', () => {
      let cart: CartState = {
        checkoutState: 'READY',
        errorMessage: '',
        items: { abc: 3 },
      };

      getMomizedNumItems.resetRecomputations();
      getMomizedNumItems({ cart } as RootState);
      expect(getMomizedNumItems.recomputations()).toEqual(1);

      cart = {
        checkoutState: 'LOADING',
        errorMessage: '',
        items: { abc: 3, def: 5 },
      };

      getMomizedNumItems({ cart } as RootState);

      expect(getMomizedNumItems.recomputations()).toEqual(2);
    });
  });
  describe('getTotalPrice', () => {
    it('should return 0 with an empty array', () => {
      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {},
        },
        products: { products: {} },
      };

      const testTotalPrice = getTotalPrice(state);
      expect(testTotalPrice).toEqual('0.00');
    });
    it('should add up the totals', () => {
      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {
            [products[0].id]: 3,
            [products[1].id]: 5,
          },
        },
        products: {
          products: {
            [products[0].id]: products[0],
            [products[1].id]: products[1],
          },
        },
      };

      const testTotalPrice = getTotalPrice(state);
      expect(testTotalPrice).toEqual('53.22');
    });
    it('should not compute again with the same state', () => {
      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {
            [products[0].id]: 3,
            [products[1].id]: 5,
          },
        },
        products: {
          products: {
            [products[0].id]: products[0],
            [products[1].id]: products[1],
          },
        },
      };
      getTotalPrice.resetRecomputations();
      getTotalPrice(state);
      expect(getTotalPrice.recomputations()).toEqual(1);
      getTotalPrice(state);
      getTotalPrice(state);
      getTotalPrice(state);
      expect(getTotalPrice.recomputations()).toEqual(1);
    });
    it('should recompute with new products', () => {
      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {
            [products[0].id]: 3,
            [products[1].id]: 5,
          },
        },
        products: {
          products: {
            [products[0].id]: products[0],
            [products[1].id]: products[1],
          },
        },
      };
      getTotalPrice.resetRecomputations();
      getTotalPrice(state);
      expect(getTotalPrice.recomputations()).toEqual(1);
      getTotalPrice(state);
      state.products.products = {
        [products[0].id]: products[0],
        [products[1].id]: products[1],
        [products[2].id]: products[2],
      };
      const result = getTotalPrice({ ...state }); // important
      expect(result).toEqual('53.22');
      expect(getTotalPrice.recomputations()).toEqual(2);
    });
    it('should recompute when cart changes', () => {
      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {
            [products[0].id]: 3,
            [products[1].id]: 5,
          },
        },
        products: {
          products: {
            [products[0].id]: products[0],
            [products[1].id]: products[1],
          },
        },
      };

      const firstCalculation = getTotalPrice(state);
      expect(firstCalculation).toEqual('53.22');

      state.cart.items = {
        [products[0].id]: 1,
        [products[1].id]: 1,
      };
      const secondCalcualtion = getTotalPrice({ ...state }); // important
      expect(secondCalcualtion).toEqual('11.08');
    });
  });
});

describe('thunks', () => {
  describe('checkoutCart w/mocked dispatch', () => {
    it('should checkout', async () => {
      const dispatch = jest.fn();
      const state: RootState = {
        products: { products: {} },
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: { abc: 123 },
        },
      };
      const thunk = checkoutCart();
      await thunk(dispatch, () => state, undefined);
      const { calls } = dispatch.mock;
      expect(calls).toHaveLength(2);
      expect(calls[0][0].type).toEqual('cart/checkout/pending');
      expect(calls[1][0].type).toEqual('cart/checkout/fulfilled');
      expect(calls[1][0].payload).toEqual({ success: true });
    });
    it('should fail with no items', async () => {
      const dispatch = jest.fn();
      const state: RootState = {
        products: { products: {} },
        cart: {
          checkoutState: 'READY',
          errorMessage: '',
          items: {},
        },
      };
      const thunk = checkoutCart();
      await thunk(dispatch, () => state, undefined);
      const { calls } = dispatch.mock;
      expect(calls).toHaveLength(2);
      expect(calls[0][0].type).toEqual('cart/checkout/pending');
      expect(calls[1][0].type).toEqual('cart/checkout/rejected');
      expect(calls[1][0].payload).toEqual(undefined);
      expect(calls[1][0].error.message).toEqual('Must include cart items');
    });
  });

  describe('checkoutCart w/mock redux store', () => {
    it('should checkout', async () => {
      const store = mockStore({ cart: { items: { testItem: 3 } } });
      await store.dispatch(checkoutCart() as any);
      const actions = store.getActions();
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toEqual('cart/checkout/pending');
      expect(actions[1].type).toEqual('cart/checkout/fulfilled');
      expect(actions[1].payload).toEqual({ success: true });
    });

    it('should fail with no items', async () => {
      const store = mockStore({ cart: { items: {} } });
      await store.dispatch(checkoutCart() as any);
      const actions = store.getActions();
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toEqual('cart/checkout/pending');
      expect(actions[1].type).toEqual('cart/checkout/rejected');
      expect(actions[1].payload).toEqual(undefined);
      expect(actions[1].error.message).toEqual('Must include cart items');
    });
  });
  describe('checkoutCart w/full redux store', () => {
    it('should checkout with items', async () => {
      const state = getStateWithItems({ testItem: 3 });
      const store = getStoreWithState(state);
      await store.dispatch(checkoutCart());
      expect(store.getState().cart).toEqual({
        items: {},
        errorMessage: '',
        checkoutState: 'READY',
      });
    });
    it('should fail with no items', async () => {
      const state = getStateWithItems({});
      const store = getStoreWithState(state);
      await store.dispatch(checkoutCart());
      expect(store.getState().cart).toEqual({
        items: {},
        errorMessage: 'Must include cart items',
        checkoutState: 'ERROR',
      });
    });
    it('should handle an error response', async () => {
      const state = getStateWithItems({ badItem: 7 });
      const store = getStoreWithState(state);
      await store.dispatch(checkoutCart());

      expect(store.getState().cart).toEqual({
        items: { badItem: 7 },
        checkoutState: 'ERROR',
        errorMessage: '',
      });
    });
    it('should handle an empty error message', async () => {
      const state = getStateWithItems({ evilItem: 66 });
      const store = getStoreWithState(state);
      await store.dispatch(checkoutCart());

      expect(store.getState().cart).toEqual({
        items: { evilItem: 66 },
        checkoutState: 'ERROR',
        errorMessage: '',
      });
    });
    it('should set status Pending before call checkout function', async () => {
      const state = getStateWithItems({ goodItem: 77 });
      const store = getStoreWithState(state);
      expect(store.getState().cart.checkoutState).toEqual('READY');
      const action = store.dispatch(checkoutCart());
      console.log(action);

      expect(store.getState().cart.checkoutState).toEqual('LOADING');
      await action;
      expect(store.getState().cart.checkoutState).toEqual('READY');
    });
  });
});

const getStateWithItems = (items: Record<string, number>): RootState => {
  const state: RootState = {
    products: { products: {} },
    cart: {
      errorMessage: '',
      checkoutState: 'READY',
      items,
    },
  };
  return state;
};
