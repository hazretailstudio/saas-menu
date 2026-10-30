'use client';

import React, { useState } from 'react';
import { createOrderAction, CartItem } from '@/app/actions/orders';
import { ShoppingBag, Plus, Minus, X, CheckCircle } from 'lucide-react';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  order_index: number;
}

export default function MenuClient({
  tenantId,
  restaurantName,
  categories,
  dishes,
}: {
  tenantId: string;
  restaurantName: string;
  categories: Category[];
  dishes: Dish[];
}) {
  const [cart, setCart] = useState<{ [dishId: string]: CartItem }>({});
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const current = prev[dish.id];
      const quantity = current ? current.quantity + 1 : 1;
      return {
        ...prev,
        [dish.id]: {
          dish_id: dish.id,
          name: dish.name,
          price: dish.price,
          quantity,
          notes: current?.notes || '',
        },
      };
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const current = prev[dishId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[dishId];
        return next;
      }
      return {
        ...prev,
        [dishId]: { ...current, quantity: current.quantity - 1 },
      };
    });
  };

  const updateNotes = (dishId: string, notes: string) => {
    setCart((prev) => {
      if (!prev[dishId]) return prev;
      return { ...prev, [dishId]: { ...prev[dishId], notes } };
    });
  };

  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || cartItems.length === 0) return;

    setIsSubmitting(true);
    const result = await createOrderAction({
      tenantId,
      tableNumber,
      items: cartItems,
    });
    setIsSubmitting(false);

    if (result.success) {
      setCart({});
      setIsCartOpen(false);
      setOrderCompleted(true);
    } else {
      alert(`Error al enviar pedido: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-28 text-neutral-900">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">{restaurantName}</h1>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-8">
        {categories.map((category) => {
          const categoryDishes = dishes.filter((d) => d.category_id === category.id);
          if (categoryDishes.length === 0) return null;

          return (
            <section key={category.id} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-wide border-b pb-1 border-neutral-200">
                {category.name}
              </h2>
              <div className="grid gap-3">
                {categoryDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex justify-between items-center bg-white p-4 rounded-xl border border-neutral-200 shadow-sm"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold">{dish.name}</h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{dish.description}</p>
                      <p className="text-sm font-bold text-neutral-800 mt-2">${Number(dish.price).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cart[dish.id] ? (
                        <div className="flex items-center bg-neutral-100 rounded-lg p-1 border border-neutral-300">
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            className="p-1 hover:bg-neutral-200 rounded"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 font-bold text-sm">{cart[dish.id].quantity}</span>
                          <button
                            onClick={() => addToCart(dish)}
                            className="p-1 hover:bg-neutral-200 rounded"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(dish)}
                          className="bg-black text-white p-2 rounded-lg text-sm font-medium hover:bg-neutral-800"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Barra Flotante de Carrito */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-0 right-0 max-w-xl mx-auto px-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-black text-white p-4 rounded-2xl flex justify-between items-center shadow-lg font-semibold"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span>Ver mi orden ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </div>
            <span>${totalAmount.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modal Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Comanda Actual</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-neutral-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {cartItems.map((item) => (
                <div key={item.dish_id} className="border-b pb-3 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Instrucción especial (ej: sin cebolla)"
                    value={item.notes}
                    onChange={(e) => updateNotes(item.dish_id, e.target.value)}
                    className="w-full text-xs p-2 bg-neutral-100 rounded-lg outline-none border border-transparent focus:border-neutral-400"
                  />
                </div>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mesa 4 / Terraza 2"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-xl font-semibold outline-none focus:ring-2 ring-black"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-neutral-50 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total a Pagar</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <button
                disabled={isSubmitting || !tableNumber.trim()}
                onClick={handleSubmitOrder}
                className="w-full py-4 bg-black text-white font-bold rounded-xl disabled:opacity-50 hover:bg-neutral-800 transition"
              >
                {isSubmitting ? 'Enviando comanda...' : 'Enviar Pedido a Cocina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación Exitosa */}
      {orderCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm space-y-4">
            <CheckCircle className="mx-auto text-green-600" size={54} />
            <h3 className="text-xl font-bold">¡Comanda Recibida!</h3>
            <p className="text-sm text-neutral-600">
              Tu pedido ha ingresado directamente a la cocina y pronto será llevado a tu mesa.
            </p>
            <button
              onClick={() => setOrderCompleted(false)}
              className="w-full bg-black text-white py-3 rounded-xl font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
