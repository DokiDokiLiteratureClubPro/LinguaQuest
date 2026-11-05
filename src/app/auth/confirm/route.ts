import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/features/auth/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Point d'arrivée des liens envoyés par e-mail (confirmation d'inscription,
 * mot de passe oublié). Gère les deux formats de lien de Supabase.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  if (!ok) return NextResponse.redirect(`${origin}/login?error=lien`);
  return NextResponse.redirect(`${origin}${next}`);
}
