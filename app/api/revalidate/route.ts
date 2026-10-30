import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const slug = req.nextUrl.searchParams.get('slug');

  if (secret !== process.env.REVALIDATION_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Token de invalidación inválido' }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ message: 'Parámetro slug faltante' }, { status: 400 });
  }

  try {
    revalidatePath(`/r/${slug}`);
    return NextResponse.json({ revalidated: true, slug, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error al revalidar', error: String(err) }, { status: 500 });
  }
}
