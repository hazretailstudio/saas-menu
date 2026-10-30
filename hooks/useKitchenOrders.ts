'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface OrderItemDetail {
  id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes: string;
  dishes?: { name: string };
}

export interface OrderWithItems {
  id: string;
  tenant_id: string;
  table_number: string;
  status: 'pending' | 'in_kitchen' | 'served' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
  order_items: OrderItemDetail[];
}

export function useKitchenOrders(tenantId: string) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const fetchInitialOrders = useCallback(async () => {
    if (!tenantId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        tenant_id,
        table_number,
        status,
        total,
        created_at,
        order_items (
          id,
          dish_id,
          quantity,
          unit_price,
          notes,
          dishes ( name )
        )
      `)
      .eq('tenant_id', tenantId)
      .in('status', ['pending', 'in_kitchen'])
      .order('created_at', { ascending: true });

    if (!error && data) {
      setOrders(data as unknown as OrderWithItems[]);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;

    fetchInitialOrders();

    const channel = supabase
      .channel(`kitchen-orders-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenantId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            playBeep();
            const { data } = await supabase
              .from('orders')
              .select(`
                id,
                tenant_id,
                table_number,
                status,
                total,
                created_at,
                order_items (
                  id,
                  dish_id,
                  quantity,
                  unit_price,
                  notes,
                  dishes ( name )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setOrders((prev) => [...prev, data as unknown as OrderWithItems]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as OrderWithItems;
            setOrders((prev) => {
              if (['served', 'completed', 'cancelled'].includes(updated.status)) {
                return prev.filter((o) => o.id !== updated.id);
              }
              return prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o));
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, fetchInitialOrders, playBeep]);

  const updateOrderStatus = async (orderId: string, nextStatus: 'in_kitchen' | 'served') => {
    setOrders((prev) =>
      prev
        .map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        .filter((o) => nextStatus !== 'served' || o.id !== orderId)
    );

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId);

    if (error) {
      fetchInitialOrders();
    }
  };

  return { orders, isConnected, updateOrderStatus };
}
