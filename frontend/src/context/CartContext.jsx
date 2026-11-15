import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (bookId, itemType = 'buy', rentalDays = 7, quantity = 1) => {
    if (!user) {
      throw new Error('Please log in to add books to your cart or rental queue.');
    }
    const res = await api.post('/cart', {
      bookId,
      itemType,
      rentalDays,
      quantity
    });
    if (res.data.success) {
      setCart(res.data.cart);
      return res.data;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const updateRentalDays = async (itemId, rentalDays) => {
    const res = await api.put(`/cart/${itemId}`, { rentalDays });
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const removeFromCart = async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    if (res.data.success) {
      setCart(res.data.cart);
    }
  };

  const clearCart = async () => {
    const res = await api.delete('/cart');
    if (res.data.success) {
      setCart({ user: user ? user.id : null, items: [] });
    }
  };

  const cartCount = cart && cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const totalPrice = cart && cart.items
    ? cart.items.reduce((acc, item) => acc + (item.priceSnapshot * item.quantity), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        totalPrice,
        addToCart,
        updateQuantity,
        updateRentalDays,
        removeFromCart,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
