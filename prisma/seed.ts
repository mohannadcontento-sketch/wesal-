import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// Load .env manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const eqIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIndex).replace(/^["']|["']$/g, '');
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...\n');

  // ── 1. Admin Account ──
  const adminPasswordHash = await hash('Admin123!', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@wesal.com' },
    update: {},
    create: {
      email: 'admin@wesal.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      emailVerified: true,
      profile: {
        create: {
          realName: 'مدير وصال',
          reputationScore: 500,
          reputationTier: 'notable',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Admin: ${admin.email} (role: ${admin.role})`);

  // ── 2. Doctor Account ──
  const doctorPasswordHash = await hash('Doctor123!', 12);
  const doctor = await db.user.upsert({
    where: { email: 'doctor@wesal.com' },
    update: {},
    create: {
      email: 'doctor@wesal.com',
      passwordHash: doctorPasswordHash,
      role: 'doctor',
      emailVerified: true,
      profile: {
        create: {
          realName: 'د. أحمد محمود',
          username: null,
          specialty: 'طب نفسي',
          isVerified: true,
          rating: 4.8,
          reputationScore: 320,
          reputationTier: 'eligible',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Doctor: ${doctor.email} (role: ${doctor.role}, specialty: ${doctor.profile?.specialty})`);

  // ── 3. Regular User Account ──
  const userPasswordHash = await hash('User123!', 12);
  const user = await db.user.upsert({
    where: { email: 'user@wesal.com' },
    update: {},
    create: {
      email: 'user@wesal.com',
      passwordHash: userPasswordHash,
      role: 'user',
      emailVerified: true,
      profile: {
        create: {
          realName: 'مستخدم تجريبي',
          username: 'test_user',
          reputationScore: 120,
          reputationTier: 'active',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ User: ${user.email} (role: ${user.role}, username: ${user.profile?.username})`);

  // ── 4. Trusted User Account ──
  const trustedPasswordHash = await hash('Trusted123!', 12);
  const trusted = await db.user.upsert({
    where: { email: 'trusted@wesal.com' },
    update: {},
    create: {
      email: 'trusted@wesal.com',
      passwordHash: trustedPasswordHash,
      role: 'trusted',
      emailVerified: true,
      profile: {
        create: {
          realName: 'عضو موثوق',
          username: 'trusted_member',
          reputationScore: 280,
          reputationTier: 'notable',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Trusted: ${trusted.email} (role: ${trusted.role}, username: ${trusted.profile?.username})`);

  console.log('\n🎉 Seed completed! Test accounts created.');
  console.log('\nCredentials:');
  console.log('  Admin:   admin@wesal.com / Admin123!');
  console.log('  Doctor:  doctor@wesal.com / Doctor123!');
  console.log('  User:    user@wesal.com / User123!');
  console.log('  Trusted: trusted@wesal.com / Trusted123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
