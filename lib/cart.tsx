'use client'

import React, {
  useContext,
  createContext,
  useReducer,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import type { VariationAttribute } from './woocommerceApi' // type-only import, safe [web:50]

export type Product = {
  id: number
  name: string
  price: string
  regular_price: string
  images: { src: string; alt?: string }[]
  variationId?: number
  attributes?: VariationAttribute[]
}

export type CartItem = Product & { quantity: number }
export type CartState = { items: CartItem[] }

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; id: number; variationId?: number }
  | { type: 'increment'; id: number; variationId?: number }
  | { type: 'decrement'; id: number; variationId?: number }
  | { type: 'clear' }
  | { type: 'load'; items: CartItem[] }

type CartContextValue = CartState & {
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (product: Product) => void
  removeFromCart: (id: number, variationId?: number) => void
  increment: (id: number, variationId?: number) => void
  decrement: (id: number, variationId?: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

// Helper: compare by id + variationId
function isSameItem(item: CartItem, id: number, variationId?: number): boolean {
  if (variationId !== undefined) {
    return item.id === id && item.variationId === variationId
  }
  // simple product (no variation)
  return item.id === id && item.variationId === undefined
}

// Helper: compare with product
function isSameProduct(item: CartItem, product: Product): boolean {
  if (product.variationId !== undefined) {
    return item.id === product.id && item.variationId === product.variationId
  }
  return item.id === product.id && item.variationId === undefined
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const exists = state.items.find((i) => isSameProduct(i, action.product))
      if (exists) {
        return {
          items: state.items.map((i) =>
            isSameProduct(i, action.product)
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] }
    }

    case 'remove':
      return {
        items: state.items.filter(
          (i) => !isSameItem(i, action.id, action.variationId),
        ),
      }

    case 'increment':
      return {
        items: state.items.map((i) =>
          isSameItem(i, action.id, action.variationId)
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      }

    case 'decrement':
      return {
        items: state.items
          .map((i) =>
            isSameItem(i, action.id, action.variationId)
              ? { ...i, quantity: Math.max(i.quantity - 1, 1) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      }

    case 'clear':
      return { items: [] }

    case 'load':
      return { items: action.items }
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const pathname = usePathname()

  // Close cart synchronously on every route change (before paint, no flash)
  useLayoutEffect(() => {
    setIsCartOpen(false)
  }, [pathname])

  // Load from localStorage
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
    if (stored) {
      try {
        const items = JSON.parse(stored) as CartItem[]
        dispatch({ type: 'load', items })
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items))
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [state.items])

  const addToCart = (product: Product) => {
    dispatch({ type: 'add', product })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: number, variationId?: number) =>
    dispatch({ type: 'remove', id, variationId })

  const increment = (id: number, variationId?: number) =>
    dispatch({ type: 'increment', id, variationId })

  const decrement = (id: number, variationId?: number) =>
    dispatch({ type: 'decrement', id, variationId })

  const clear = () => dispatch({ type: 'clear' })

  return (
    <CartContext.Provider
      value={{
        ...state,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        increment,
        decrement,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
