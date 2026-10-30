# SaaS Menú Digital & Pantalla de Cocina KDS en Tiempo Real

Proyecto listo para producción desplegado con Next.js 14 (App Router), Supabase y Vercel.

## 1. Configuración de Base de Datos
- Abre el archivo `supabase/schema.sql`.
- Cópialo y pégalo en el SQL Editor de tu proyecto Supabase: `https://supabase.com/dashboard/project/jmqqkgshwwycercknzgy/sql/new`.
- Haz clic en **Run**. Ya incluye datos de prueba para el restaurante con slug `demo`.

## 2. Ejecución Local
```bash
npm install
npm run dev
```

Abre en tu navegador:
- Menú digital del cliente: `http://localhost:3000/r/demo`
- Pantalla KDS de cocina: `http://localhost:3000/dashboard/demo/kitchen`

## 3. Despliegue en Vercel
1. Sube este repositorio a GitHub.
2. Impórtalo en Vercel.
3. Copia las variables de entorno de tu archivo `.env.local` en Vercel Settings -> Environment Variables.
4. Despliega con un clic.
