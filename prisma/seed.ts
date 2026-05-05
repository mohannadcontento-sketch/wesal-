import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

const DOCTORS = [
  {
    email: 'dr.sara@wesal.com',
    password: 'Doctor123!',
    role: 'doctor',
    realName: 'د. سارة أحمد',
    username: 'dr-sara',
    specialty: 'طب نفسي',
    bio: 'أخصائية في الطب النفسي وعلاج الاكتئاب والقلق. خبرة أكثر من 10 سنوات في العلاج المعرفي السلوكي',
    location: 'القاهرة، مصر',
    avatarUrl: '/doctors/dr-sara.png',
    rating: 4.8,
    isVerified: true,
  },
  {
    email: 'dr.omar@wesal.com',
    password: 'Doctor123!',
    role: 'doctor',
    realName: 'د. عمر خالد',
    username: 'dr-omar',
    specialty: 'علاج سلوكي',
    bio: 'معالج سلوكي متخصص في اضطرابات القلق والوسواس. أساعدك تتغلب على مخاوفك بطريقة علمية',
    location: 'الرياض، السعودية',
    avatarUrl: '/doctors/dr-omar.png',
    rating: 4.6,
    isVerified: true,
  },
  {
    email: 'dr.nora@wesal.com',
    password: 'Doctor123!',
    role: 'doctor',
    realName: 'د. نورة محمد',
    username: 'dr-nora',
    specialty: 'إرشاد أسري',
    bio: 'أخصائية إرشاد أسري وزواجي. أساعد الأسر في حل الخلافات وبناء علاقات صحية',
    location: 'دبي، الإمارات',
    avatarUrl: '/doctors/dr-nora.png',
    rating: 4.9,
    isVerified: true,
  },
  {
    email: 'dr.karim@wesal.com',
    password: 'Doctor123!',
    role: 'doctor',
    realName: 'د. كريم حسن',
    username: 'dr-karim',
    specialty: 'طب نفسي للأطفال',
    bio: 'أخصائي في الصحة النفسية للأطفال والمراهقين. متخصص في اضطراب فرط الحركة وتوهم Autism',
    location: 'عمّان، الأردن',
    avatarUrl: '/doctors/dr-karim.png',
    rating: 4.7,
    isVerified: true,
  },
];

// Test user account
const TEST_USER = {
  email: 'test@wesal.com',
  password: 'Test123!',
  role: 'user',
  realName: 'أحمد محمد',
  username: 'ahmed-test',
  bio: 'عضو في مجتمع وصال',
  avatarUrl: '/avatars/test-user.png',
};

async function main() {
  console.log('🌱 Seeding Wesal database...');

  // Create doctor accounts
  const createdDoctors: { id: string; realName: string; email: string; password: string; chatUrl: string }[] = [];

  for (const doc of DOCTORS) {
    const existing = await db.user.findUnique({ where: { email: doc.email } });
    if (existing) {
      console.log(`  ⏭️  Doctor ${doc.realName} already exists (${doc.email})`);
      const profile = await db.profile.findUnique({ where: { userId: existing.id } });
      if (profile) {
        // Force-update avatarUrl if it doesn't match
        if (profile.avatarUrl !== doc.avatarUrl) {
          await db.profile.update({
            where: { userId: existing.id },
            data: {
              avatarUrl: doc.avatarUrl,
              realName: doc.realName,
              specialty: doc.specialty,
              bio: doc.bio,
              location: doc.location,
              rating: doc.rating,
              isVerified: doc.isVerified,
            },
          });
          console.log(`  🔄 Updated ${doc.realName} profile with avatar and data`);
        }
        createdDoctors.push({
          id: existing.id,
          realName: doc.realName,
          email: doc.email,
          password: doc.password,
          chatUrl: `https://wesal-omega.vercel.app/chat/`,
        });
      }
      continue;
    }

    const passwordHash = await hash(doc.password, 12);
    const user = await db.user.create({
      data: {
        email: doc.email,
        passwordHash,
        role: doc.role,
        emailVerified: true,
        profile: {
          create: {
            username: doc.username,
            realName: doc.realName,
            specialty: doc.specialty,
            bio: doc.bio,
            location: doc.location,
            avatarUrl: doc.avatarUrl,
            rating: doc.rating,
            isVerified: doc.isVerified,
          },
        },
      },
    });

    createdDoctors.push({
      id: user.id,
      realName: doc.realName,
      email: doc.email,
      password: doc.password,
      chatUrl: `https://wesal-omega.vercel.app/chat/`,
    });
    console.log(`  ✅ Created doctor: ${doc.realName} (${doc.email})`);
  }

  // Create test user
  const existingUser = await db.user.findUnique({ where: { email: TEST_USER.email } });
  let testUserId: string;

  if (existingUser) {
    console.log(`  ⏭️  Test user already exists (${TEST_USER.email})`);
    testUserId = existingUser.id;
    // Force-update avatarUrl if it doesn't match
    const existingProfile = await db.profile.findUnique({ where: { userId: existingUser.id } });
    if (existingProfile && existingProfile.avatarUrl !== TEST_USER.avatarUrl) {
      await db.profile.update({
        where: { userId: existingUser.id },
        data: {
          avatarUrl: TEST_USER.avatarUrl,
          realName: TEST_USER.realName,
          bio: TEST_USER.bio,
        },
      });
      console.log(`  🔄 Updated test user profile with avatar`);
    }
  } else {
    const passwordHash = await hash(TEST_USER.password, 12);
    const user = await db.user.create({
      data: {
        email: TEST_USER.email,
        passwordHash,
        role: TEST_USER.role,
        emailVerified: true,
        profile: {
          create: {
            username: TEST_USER.username,
            realName: TEST_USER.realName,
            bio: TEST_USER.bio,
            avatarUrl: TEST_USER.avatarUrl,
          },
        },
      },
    });
    testUserId = user.id;
    console.log(`  ✅ Created test user: ${TEST_USER.realName} (${TEST_USER.email})`);
  }

  // Create a test appointment + chat room between test user and first doctor
  if (createdDoctors.length > 0) {
    const doctorId = createdDoctors[0].id;

    // Check if appointment already exists
    const existingAppointment = await db.appointment.findFirst({
      where: { patientId: testUserId, doctorId },
    });

    if (!existingAppointment) {
      const appointment = await db.appointment.create({
        data: {
          patientId: testUserId,
          doctorId,
          appointmentDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          reason: 'أعاني من ضغوط شغل وحاجة أتكلم مع متخصص',
          status: 'confirmed',
        },
      });

      const chatRoom = await db.chatRoom.create({
        data: {
          appointmentId: appointment.id,
          patientId: testUserId,
          doctorId,
          status: 'open',
        },
      });

      await db.appointment.update({
        where: { id: appointment.id },
        data: { chatRoomId: chatRoom.id },
      });

      // Add some test messages
      await db.chatMessage.createMany({
        data: [
          {
            roomId: chatRoom.id,
            senderId: testUserId,
            messageType: 'text',
            content: 'مرحباً دكتورة سارة، أنا عاوز أتكلم عن مشكلة بتواجهني في الشغل',
          },
          {
            roomId: chatRoom.id,
            senderId: doctorId,
            messageType: 'text',
            content: 'أهلاً بيك أحمد، أنا هنا عشان أساعدك. خليك مرتاح وقولي إيه اللي بيحصل معاك',
          },
          {
            roomId: chatRoom.id,
            senderId: testUserId,
            messageType: 'text',
            content: 'من فترة حس بضغط كبير وقلق مستمر و مش قادر أنام كويس',
          },
          {
            roomId: chatRoom.id,
            senderId: doctorId,
            messageType: 'text',
            content: 'فهمتك. الأعراض دي ممكن تكون مؤشر على قلق عام. خلينا ننفصل أكتر - من أول وين بدأت الإحساس بالضغط ده؟',
          },
        ],
      });

      // Update chat URL
      createdDoctors[0].chatUrl = `https://wesal-omega.vercel.app/chat/${chatRoom.id}`;

      console.log(`  ✅ Created test appointment + chat room with ${createdDoctors[0].realName}`);
      console.log(`  💬 Chat URL: https://wesal-omega.vercel.app/chat/${chatRoom.id}`);
    } else {
      // Find existing chat room
      const existingRoom = await db.chatRoom.findFirst({
        where: { patientId: testUserId, doctorId },
      });
      if (existingRoom) {
        createdDoctors[0].chatUrl = `https://wesal-omega.vercel.app/chat/${existingRoom.id}`;
        console.log(`  ⏭️  Appointment/chat already exists. Chat URL: https://wesal-omega.vercel.app/chat/${existingRoom.id}`);
      }
    }
  }

  console.log('\n📋 Seed complete! Here are the login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('👤 TEST USER:');
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
  console.log('');
  console.log('👨‍⚕️  DOCTORS:');
  for (const doc of createdDoctors) {
    console.log(`   ${doc.realName}: ${doc.email} / ${doc.password}`);
  }
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 To test the chat, login as test user and go to the chat URL above');
  console.log('   Or login as a doctor to see appointments');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
