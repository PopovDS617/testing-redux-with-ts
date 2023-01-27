import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartLink.module.css';
import { getMomizedNumItems } from '../../app/store/cartSlice';
import { useAppSelector } from '../../app/hooks/hooks';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store/store';

export function CartLink() {
  const numItems = useAppSelector(getMomizedNumItems);
  return (
    <Link to="/cart" className={styles.link}>
      <span className={styles.text}>
        🛒&nbsp;&nbsp;{numItems ? numItems : 'Cart'}
      </span>
    </Link>
  );
}

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
