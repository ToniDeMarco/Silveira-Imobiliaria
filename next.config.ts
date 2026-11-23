import type { NextConfig } from "next";

// Fotos servidas pelo Supabase Storage (bucket público `fotos-imoveis`).
// Além de *.supabase.co, libera o host exato de NEXT_PUBLIC_SUPABASE_URL
// (útil para domínio customizado ou Supabase self-hosted).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostProprio = supabaseUrl
  ? [new URL("/storage/v1/object/public/fotos-imoveis/**", supabaseUrl)]
  : [];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/fotos-imoveis/**",
      },
      ...hostProprio,
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
