import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

async function getMenuData(slug: string) {
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) return null;

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, order_index')
    .eq('tenant_id', tenant.id)
    .order('order_index', { ascending: true });

  const { data: dishes } = await supabase
    .from('dishes')
    .select('id, name, description, price, image_url, category_id')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true);

  return {
    tenant,
    categories: categories || [],
    dishes: dishes || [],
  };
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getMenuData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <MenuClient
      tenantId={data.tenant.id}
      restaurantName={data.tenant.name}
      categories={data.categories}
      dishes={data.dishes}
    />
  );
}
