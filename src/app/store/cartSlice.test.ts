import cartReducer, {
  CartState,
  addToCart,
  removeFromCart,
  updateQuantity,
  getNumItems,
} from './cartSlice';
import type { RootState } from './store';

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
});
