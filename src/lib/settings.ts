import { db } from './db';

const settingsCache: Record<string, string> = {};
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

const DEFAULT_SETTINGS: Record<string, string> = {
  maintenance_mode: 'false',
  allow_registration: 'true',
  allow_posts: 'true',
  allow_comments: 'true',
  max_posts_per_day: '10',
};

async function loadSettings(): Promise<Record<string, string>> {
  if (Date.now() - cacheTime < CACHE_TTL && Object.keys(settingsCache).length > 0) {
    return settingsCache;
  }

  try {
    const settings = await db.siteSetting.findMany();
    for (const s of settings) {
      settingsCache[s.key] = s.value;
    }
    cacheTime = Date.now();
  } catch {
    // Use defaults on error
  }

  return { ...DEFAULT_SETTINGS, ...settingsCache };
}

export async function getSetting(key: string): Promise<string> {
  const settings = await loadSettings();
  return settings[key] ?? DEFAULT_SETTINGS[key] ?? '';
}

export async function isMaintenanceMode(): Promise<boolean> {
  return (await getSetting('maintenance_mode')) === 'true';
}

export async function isRegistrationAllowed(): Promise<boolean> {
  return (await getSetting('allow_registration')) === 'true';
}

export async function arePostsAllowed(): Promise<boolean> {
  return (await getSetting('allow_posts')) === 'true';
}

export async function areCommentsAllowed(): Promise<boolean> {
  return (await getSetting('allow_comments')) === 'true';
}

export async function getMaxPostsPerDay(): Promise<number> {
  const val = await getSetting('max_posts_per_day');
  return parseInt(val) || 10;
}
