import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

const LOGIN_PATH = "/admin/login";

/**
 * Renova a sessão do Supabase (cookies) e bloqueia o acesso às rotas /admin
 * para quem não está logado. A checagem de "é admin" é feita também no layout
 * do painel, em cada Server Action e, principalmente, pelo RLS do banco.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === LOGIN_PATH;

  if (!isSupabaseConfigured) {
    return isLoginPage ? NextResponse.next() : redirectTo(request, LOGIN_PATH);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Não coloque código entre createServerClient e getClaims().
  // getClaims() valida a assinatura do JWT (não confia cegamente no cookie).
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  if (!isLoggedIn && !isLoginPage) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", pathname + search);
    return redirectWithCookies(url, response);
  }

  if (isLoggedIn && isLoginPage) {
    return redirectWithCookies(new URL("/admin", request.url), response);
  }

  return response;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

/** Redireciona preservando cookies de sessão renovados. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
