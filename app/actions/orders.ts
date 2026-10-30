'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CartItem {
  dish_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export async function createOrderAction(data: {
  tenantId: string;
  tableNumber: string;
  items: CartItem[];
}) {
  const { tenantId, tableNumber, items } = data;

  if (!tableNumber || items.length === 0) {
    return { success: false, error: 'Datos de orden incompletos.' };
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 1. Crear Orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenantId,
      table_number: tableNumber,
      status: 'pending',
      total,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Error al crear la comanda' };
  }

  // 2. Crear Items
  const orderItemsData = items.map((item) => ({
    order_id: order.id,
    dish_id: item.dish_id,
    quantity: item.quantity,
    unit_price: item.price,
    notes: item.notes || '',
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  return { success: true, orderId: order.id };
}
