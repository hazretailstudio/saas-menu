import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-950 text-white text-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-black tracking-tight">SaaS Menú Digital & KDS</h1>
        <p className="text-sm text-neutral-400">
          Base de datos Supabase conectada con éxito. Puedes ingresar a las rutas de prueba preconfiguradas:
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/r/demo"
            className="w-full bg-white text-black py-3 px-4 rounded-xl font-bold hover:bg-neutral-200 transition"
          >
            🍽️ Ver Menú del Comensal (/r/demo)
          </Link>
          <Link
            href="/dashboard/demo/kitchen"
            className="w-full bg-neutral-800 text-white border border-neutral-700 py-3 px-4 rounded-xl font-bold hover:bg-neutral-700 transition"
          >
            👨‍🍳 Ver Pantalla de Cocina KDS (/dashboard/demo/kitchen)
          </Link>
        </div>
      </div>
    </main>
  );
}
