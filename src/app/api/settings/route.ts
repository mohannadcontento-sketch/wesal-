import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

const DEFAULT_SETTINGS: Record<string, string> = {
  maintenance_mode: 'false',
  allow_registration: 'true',
  allow_posts: 'true',
  allow_comments: 'true',
  max_posts_per_day: '10',
};

// GET /api/settings — public endpoint to read settings
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Settings GET error:', error);
    // Return defaults on error so the app doesn't break
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

// PUT /api/settings — admin only, update settings
export async function PUT(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const updates: { key: string; value: string }[] = [];

    for (const [key, value] of Object.entries(settings)) {
      if (!allowedKeys.includes(key)) continue;

      // Validate boolean settings
      if (['maintenance_mode', 'allow_registration', 'allow_posts', 'allow_comments'].includes(key)) {
        if (value !== 'true' && value !== 'false') continue;
      }

      // Validate numeric settings
      if (key === 'max_posts_per_day') {
        const num = parseInt(value as string);
        if (isNaN(num) || num < 1 || num > 100) continue;
      }

      updates.push({ key, value: String(value) });
    }

    // Upsert all settings
    await Promise.all(
      updates.map(({ key, value }) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    // Build response with all current settings
    const allSettings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of allSettings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
