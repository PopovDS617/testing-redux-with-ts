import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartLink.module.css';
import { getMomizedNumItems } from '../../app/store/cartSlice';
import { useAppSelector } from '../../app/hooks/hooks';

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
