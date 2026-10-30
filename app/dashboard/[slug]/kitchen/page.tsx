'use client';

import React, { useEffect, useState } from 'react';
import { useKitchenOrders, OrderWithItems } from '@/hooks/useKitchenOrders';
import { Clock, Wifi, WifiOff, CheckCircle2, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function ElapsedTimer({ createdAt }: { createdAt: string }) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
      setMinutes(diff >= 0 ? diff : 0);
    };
    calculate();
    const interval = setInterval(calculate, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const isUrgent = minutes >= 15;

  return (
    <div className={`flex items-center gap-1 font-mono font-bold text-sm ${isUrgent ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`}>
      <Clock size={16} />
      <span>{minutes}m</span>
    </div>
  );
}

export default function KitchenDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', params.slug)
        .single();
      if (data) setTenantId(data.id);
    }
    loadTenant();
  }, [params.slug]);

  const { orders, isConnected, updateOrderStatus } = useKitchenOrders(tenantId || '');

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono">
        Cargando terminal de cocina...
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const inKitchenOrders = orders.filter((o) => o.status === 'in_kitchen');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-900/50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-wider uppercase text-white">
            KDS Cocina — {params.slug}
          </h1>
          <span className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full font-mono">
            {orders.length} comandas activas
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              <Wifi size={14} /> EN VIVO
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full animate-pulse">
              <WifiOff size={14} /> RECONECTANDO...
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {/* Columna 1: Pendientes */}
        <div className="flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-amber-500/10 flex justify-between items-center">
            <h2 className="font-bold text-amber-400 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Por Preparar ({pendingOrders.length})
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={() => updateOrderStatus(order.id, 'in_kitchen')}
                actionLabel="Comenzar Preparación"
                actionColor="bg-amber-500 hover:bg-amber-600 text-neutral-950"
                icon={<Flame size={18} />}
              />
            ))}
          </div>
        </div>

        {/* Columna 2: En Preparación */}
        <div className="flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-blue-500/10 flex justify-between items-center">
            <h2 className="font-bold text-blue-400 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              En Fuego ({inKitchenOrders.length})
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {inKitchenOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={() => updateOrderStatus(order.id, 'served')}
                actionLabel="Comanda Servida"
                actionColor="bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                icon={<CheckCircle2 size={18} />}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  actionLabel,
  actionColor,
  icon,
}: {
  order: OrderWithItems;
  onAdvance: () => void;
  actionLabel: string;
  actionColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-white">{order.table_number}</h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              ID: {order.id.slice(0, 8)}
            </span>
          </div>
          <ElapsedTimer createdAt={order.created_at} />
        </div>

        <ul className="mt-4 space-y-3">
          {order.order_items.map((item) => (
            <li key={item.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-lg text-amber-400">
                  {item.quantity}x
                </span>
                <span className="font-semibold text-neutral-200">
                  {item.dishes?.name || 'Platillo'}
                </span>
              </div>
              {item.notes && (
                <p className="ml-7 text-xs bg-amber-500/10 text-amber-300 font-medium px-2 py-1 rounded mt-1 border border-amber-500/20 inline-block">
                  ⚠️ {item.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onAdvance}
        className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] ${actionColor}`}
      >
        {icon}
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
