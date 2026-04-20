import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// ─── Server-side Supabase client — للـ API routes ───
// بيقرأ الـ cookies تلقائياً وبيقدر يتحقق من الـ JWT token
export async function createServerSupabase(request?: NextRequest) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll ممكن تفشل في Server Components — طبيعي
          }
        },
      },
    }
  );
}

// ─── Helper: التحقق من المستخدم من الـ JWT token ───
// بيُرجّع auth.uid() اللي هو نفسه users.id في قاعدة البيانات
export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const client = await createServerSupabase();
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) return null;
    return user; // user.id = users.id في قاعدة البيانات
  } catch {
    return null;
  }
}

// ─── Helper: رفض الطلب لو المستخدم مش مسجل دخول ───
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ success: false, error: 'لازم تسجل دخول أولاً' }, { status: 401 }) };
  }
  return { user, response: null };
}
