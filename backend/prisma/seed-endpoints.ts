import {
  ExamStatus,
  GroupStatus,
  HomeworkStatus,
  PrismaClient,
  Status,
  StudentStatus,
  UserRole,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for endpoint seed.");
}

const DEFAULT_PASSWORD =
  process.env.SEED_ENDPOINTS_PASSWORD ??
  process.env.SEED_SUPERADMIN_PASSWORD ??
  "12345678";

const BULK_STUDENTS_COUNT = Number(
  process.env.SEED_BULK_STUDENTS_COUNT ?? "20",
);
const BULK_TEACHERS_COUNT = Number(
  process.env.SEED_BULK_TEACHERS_COUNT ?? "10",
);
const BULK_COURSES_COUNT = Number(
  process.env.SEED_BULK_COURSES_COUNT ?? "10",
);
const BULK_ROOMS_COUNT = Number(process.env.SEED_BULK_ROOMS_COUNT ?? "10");
const BULK_GROUPS_COUNT = Number(process.env.SEED_BULK_GROUPS_COUNT ?? "10");
const GROUP_STUDENTS_EACH = Number(
  process.env.SEED_GROUP_STUDENTS_EACH ?? "10",
);

const TEACHER_NAMES = [
  "Akmal Tursunov",
  "Dilshod Karimov",
  "Sherzod Raximov",
  "Jahongir Ismoilov",
  "Ulugbek Xasanov",
  "Farrux Mamatov",
  "Bobur Qodirov",
  "Sardor Ergashev",
  "Azamjon Nematov",
  "Rustam Gafurov",
  "Temur Abdullayev",
  "Bekzod Yuldashev",
];

const STUDENT_NAMES = [
  "Aziza Abdullayeva",
  "Shahzoda Rasulova",
  "Nilufar Tohirova",
  "Muhammadali Ergashev",
  "Jasurbek Xolmatov",
  "Asilbek Karimov",
  "Sardorbek Usmonov",
  "Komiljon Qosimov",
  "Oybek Turdiyev",
  "Mirjalol Sultonov",
  "Madina Niyozova",
  "Shoxrux Rahmatov",
  "Muslima Sobirova",
  "Diyora Axmedova",
  "Abdulaziz Yusupov",
  "Sanjar Toirov",
  "Suhrob Valiyev",
  "Mubina Olimova",
  "Feruza Murodova",
  "Zafar Fayziev",
  "Umid Islomov",
  "Sarvinoz Xudoyberdiyeva",
  "Dilnoza Ruzmetova",
  "Anvarbek Tursunboyev",
  "Nozimjon Xasanov",
  "Saidazim Raxmonov",
  "Mohira Jalolova",
  "Ibrohim Rustamov",
  "Mansur Ergashov",
  "Sabina Mirzayeva",
];

const COURSE_CATALOG = [
  { code: "FND", name: "Frontend React", description: "React va zamonaviy frontend texnologiyalari", price: 1600000, duration_month: 6, duration_hours: 240 },
  { code: "BND", name: "Backend Node.js", description: "Node.js, NestJS va REST API amaliyoti", price: 1800000, duration_month: 7, duration_hours: 270 },
  { code: "PYB", name: "Python Backend", description: "Python, FastAPI/Django asoslari va amaliyot", price: 1700000, duration_month: 6, duration_hours: 240 },
  { code: "JVS", name: "Java Spring", description: "Java Spring Boot va enterprise yondashuv", price: 1900000, duration_month: 8, duration_hours: 300 },
  { code: "DEV", name: "DevOps Foundation", description: "Linux, Docker, CI/CD va deploy jarayonlari", price: 1750000, duration_month: 5, duration_hours: 210 },
  { code: "FLU", name: "Flutter Mobile", description: "Flutter orqali mobil ilovalar yaratish", price: 1650000, duration_month: 6, duration_hours: 240 },
  { code: "UIX", name: "UI/UX Design", description: "Interfeys va foydalanuvchi tajribasi dizayni", price: 1400000, duration_month: 4, duration_hours: 180 },
  { code: "QAT", name: "QA Automation", description: "Testlash va avtomatlashtirish amaliyoti", price: 1500000, duration_month: 5, duration_hours: 210 },
  { code: "DTA", name: "Data Analytics", description: "SQL, BI va tahliliy fikrlash ko'nikmalari", price: 1550000, duration_month: 5, duration_hours: 210 },
  { code: "ENG", name: "English for IT", description: "IT sohasiga yo'naltirilgan ingliz tili", price: 1200000, duration_month: 4, duration_hours: 160 },
];

const ROOM_NAMES = [
  "N-101",
  "N-102",
  "N-103",
  "N-104",
  "N-201",
  "N-202",
  "N-203",
  "N-204",
  "N-301",
  "N-302",
  "N-303",
];

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertUserByIdentity(params: {
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
}) {
  const candidates = await prisma.user.findMany({
    where: {
      OR: [{ phone: params.phone }, { email: params.email }],
    },
    select: { id: true },
  });

  if (candidates.length > 1) {
    throw new Error(
      `Conflicting User records for ${params.phone}/${params.email}. Please clean DB first.`,
    );
  }

  if (candidates.length === 1) {
    return prisma.user.update({
      where: { id: candidates[0].id },
      data: {
        full_name: params.full_name,
        email: params.email,
        phone: params.phone,
        role: params.role,
        password: params.passwordHash,
        status: Status.active,
      },
    });
  }

  return prisma.user.create({
    data: {
      full_name: params.full_name,
      email: params.email,
      phone: params.phone,
      role: params.role,
      password: params.passwordHash,
      status: Status.active,
    },
  });
}

async function upsertTeacher(params: {
  full_name: string;
  email: string;
  phone: string;
  passwordHash: string;
}) {
  const candidates = await prisma.teachers.findMany({
    where: {
      OR: [{ phone: params.phone }, { email: params.email }],
    },
    select: { id: true },
  });

  if (candidates.length > 1) {
    throw new Error(
      `Conflicting Teacher records for ${params.phone}/${params.email}. Please clean DB first.`,
    );
  }

  if (candidates.length === 1) {
    return prisma.teachers.update({
      where: { id: candidates[0].id },
      data: {
        full_name: params.full_name,
        email: params.email,
        phone: params.phone,
        password: params.passwordHash,
        status: Status.active,
      },
    });
  }

  return prisma.teachers.create({
    data: {
      full_name: params.full_name,
      email: params.email,
      phone: params.phone,
      password: params.passwordHash,
      status: Status.active,
    },
  });
}

async function upsertStudent(params: {
  full_name: string;
  email: string;
  phone: string;
  passwordHash: string;
  birth_date: Date;
}) {
  const candidates = await prisma.students.findMany({
    where: {
      OR: [{ phone: params.phone }, { email: params.email }],
    },
    select: { id: true },
  });

  if (candidates.length > 1) {
    throw new Error(
      `Conflicting Student records for ${params.phone}/${params.email}. Please clean DB first.`,
    );
  }

  if (candidates.length === 1) {
    return prisma.students.update({
      where: { id: candidates[0].id },
      data: {
        full_name: params.full_name,
        email: params.email,
        phone: params.phone,
        password: params.passwordHash,
        birth_date: params.birth_date,
        status: StudentStatus.active,
      },
    });
  }

  return prisma.students.create({
    data: {
      full_name: params.full_name,
      email: params.email,
      phone: params.phone,
      password: params.passwordHash,
      birth_date: params.birth_date,
      status: StudentStatus.active,
    },
  });
}

async function main() {
  console.log("Realistik seed started...");
  console.log(`Default password: ${DEFAULT_PASSWORD}`);

  const passHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const superadmin = await upsertUserByIdentity({
    full_name: process.env.SEED_SUPERADMIN_FULL_NAME ?? "Super Admin",
    email: process.env.SEED_SUPERADMIN_EMAIL ?? "superadmin@crm.uz",
    phone: process.env.SEED_SUPERADMIN_PHONE ?? "+998900000001",
    role: UserRole.SUPERADMIN,
    passwordHash: passHash,
  });

  const admin = await upsertUserByIdentity({
    full_name: "Jahongir Rahimov",
    email: "admin@crm.uz",
    phone: "+998900000002",
    role: UserRole.ADMIN,
    passwordHash: passHash,
  });

  const teacher = await upsertTeacher({
    full_name: "Akmal Tursunov",
    email: "akmal.tursunov@crm.uz",
    phone: "+998900000010",
    passwordHash: passHash,
  });

  const studentsSeed = [
    { full_name: "Aziza Abdullayeva", email: "aziza.abdullayeva@crm.uz", phone: "+998901111001" },
    { full_name: "Jasurbek Xolmatov", email: "jasurbek.xolmatov@crm.uz", phone: "+998901111002" },
    { full_name: "Shahzoda Rasulova", email: "shahzoda.rasulova@crm.uz", phone: "+998901111003" },
    { full_name: "Muhammadali Ergashev", email: "muhammadali.ergashev@crm.uz", phone: "+998901111004" },
    { full_name: "Nilufar Tohirova", email: "nilufar.tohirova@crm.uz", phone: "+998901111005" },
  ];

  const students = [];
  for (let i = 0; i < studentsSeed.length; i++) {
    const item = studentsSeed[i];
    students.push(
      await upsertStudent({
        ...item,
        passwordHash: passHash,
        birth_date: new Date(2003, i, i + 1),
      }),
    );
  }

  const extraTeachers = [];
  for (let i = 1; i <= BULK_TEACHERS_COUNT; i++) {
    const teacherNo = String(i).padStart(2, "0");
    const fullName = TEACHER_NAMES[i] ?? `Ustoz ${teacherNo}`;
    const emailSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, ".");
    extraTeachers.push(
      await upsertTeacher({
        full_name: fullName,
        email: `${emailSlug}.${teacherNo}@crm.uz`,
        phone: `+99891${String(2000000 + i).padStart(7, "0")}`,
        passwordHash: passHash,
      }),
    );
  }

  const extraStudents = [];
  for (let i = 1; i <= BULK_STUDENTS_COUNT; i++) {
    const studentNo = String(i).padStart(2, "0");
    const fullName = STUDENT_NAMES[i + 4] ?? `Talaba ${studentNo}`;
    const emailSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, ".");
    extraStudents.push(
      await upsertStudent({
        full_name: fullName,
        email: `${emailSlug}.${studentNo}@crm.uz`,
        phone: `+99890${String(3000000 + i).padStart(7, "0")}`,
        passwordHash: passHash,
        birth_date: new Date(2002, (i - 1) % 12, ((i - 1) % 28) + 1),
      }),
    );
  }

  const allTeachers = [teacher, ...extraTeachers];
  const allStudents = [...students, ...extraStudents];

  const baseCourse = COURSE_CATALOG[0];
  const course = await prisma.courses.upsert({
    where: { name: baseCourse.name },
    update: {
      description: baseCourse.description,
      price: baseCourse.price,
      duration_month: baseCourse.duration_month,
      duration_hours: baseCourse.duration_hours,
      status: Status.active,
    },
    create: {
      name: baseCourse.name,
      description: baseCourse.description,
      price: baseCourse.price,
      duration_month: baseCourse.duration_month,
      duration_hours: baseCourse.duration_hours,
      status: Status.active,
    },
  });

  const baseRoomName = ROOM_NAMES[0];
  const room = await prisma.rooms.upsert({
    where: { name: baseRoomName },
    update: {
      capacity: 20,
      status: Status.active,
    },
    create: {
      name: baseRoomName,
      capacity: 20,
      status: Status.active,
    },
  });

  const extraCourses = [];
  for (let i = 1; i <= BULK_COURSES_COUNT; i++) {
    const courseItem = COURSE_CATALOG[i % COURSE_CATALOG.length];
    const no = String(i).padStart(2, "0");
    const courseName = `${courseItem.name} ${no}`;
    extraCourses.push(
      await prisma.courses.upsert({
        where: { name: courseName },
        update: {
          description: `${courseItem.description} (${no}-guruh uchun)`,
          price: courseItem.price + i * 20000,
          duration_month: courseItem.duration_month,
          duration_hours: courseItem.duration_hours,
          status: Status.active,
        },
        create: {
          name: courseName,
          description: `${courseItem.description} (${no}-guruh uchun)`,
          price: courseItem.price + i * 20000,
          duration_month: courseItem.duration_month,
          duration_hours: courseItem.duration_hours,
          status: Status.active,
        },
      }),
    );
  }

  const extraRooms = [];
  for (let i = 1; i <= BULK_ROOMS_COUNT; i++) {
    const roomName = ROOM_NAMES[i % ROOM_NAMES.length] ?? `N-${100 + i}`;
    extraRooms.push(
      await prisma.rooms.upsert({
        where: { name: roomName },
        update: {
          capacity: 18 + (i % 8),
          status: Status.active,
        },
        create: {
          name: roomName,
          capacity: 18 + (i % 8),
          status: Status.active,
        },
      }),
    );
  }

  const allCourses = [course, ...extraCourses];
  const allRooms = [room, ...extraRooms];

  const mainGroupName = "N120-FND";
  let group = await prisma.groups.findFirst({ where: { name: mainGroupName } });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 5);

  if (group) {
    group = await prisma.groups.update({
      where: { id: group.id },
      data: {
        name: mainGroupName,
        description: "Frontend React asosiy guruhi",
        course_id: course.id,
        room_id: room.id,
        start_date: startDate,
        end_date: endDate,
        week_day: ["Monday", "Wednesday", "Friday"],
        start_time: "18:30",
        max_students: 20,
        status: GroupStatus.active,
      },
    });
  } else {
    group = await prisma.groups.create({
      data: {
        name: mainGroupName,
        description: "Frontend React asosiy guruhi",
        course_id: course.id,
        room_id: room.id,
        start_date: startDate,
        end_date: endDate,
        week_day: ["Monday", "Wednesday", "Friday"],
        start_time: "18:30",
        max_students: 20,
        status: GroupStatus.active,
      },
    });
  }

  await prisma.teachersGroup.upsert({
    where: {
      teacher_id_group_id: {
        teacher_id: teacher.id,
        group_id: group.id,
      },
    },
    update: {},
    create: {
      teacher_id: teacher.id,
      group_id: group.id,
    },
  });

  for (const student of students) {
    await prisma.studentGroup.upsert({
      where: {
        student_id_group_id: {
          student_id: student.id,
          group_id: group.id,
        },
      },
      update: { status: Status.active },
      create: {
        student_id: student.id,
        group_id: group.id,
        status: Status.active,
      },
    });
  }

  let lesson = await prisma.lesson.findFirst({
    where: {
      group_id: group.id,
      topic: "React komponentlar va state",
    },
  });

  if (lesson) {
    lesson = await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        teacher_id: teacher.id,
        description: "React komponentlar, props va state bo'yicha dars",
        date: new Date(),
        status: Status.active,
      },
    });
  } else {
    lesson = await prisma.lesson.create({
      data: {
        group_id: group.id,
        teacher_id: teacher.id,
        topic: "React komponentlar va state",
        description: "React komponentlar, props va state bo'yicha dars",
        type: "offline",
        date: new Date(),
        status: Status.active,
      },
    });
  }

  let homework = await prisma.homeWork.findFirst({
    where: {
      group_id: group.id,
      lesson_id: lesson.id,
      title: "Uyga vazifa: React Todo App",
    },
  });

  if (homework) {
    homework = await prisma.homeWork.update({
      where: { id: homework.id },
      data: {
        teacher_id: teacher.id,
        description: "React Todo App loyihasini state va localStorage bilan yakunlang",
        file: "seed-homework.pdf",
      },
    });
  } else {
    homework = await prisma.homeWork.create({
      data: {
        group_id: group.id,
        lesson_id: lesson.id,
        teacher_id: teacher.id,
        title: "Uyga vazifa: React Todo App",
        description: "React Todo App loyihasini state va localStorage bilan yakunlang",
        file: "seed-homework.pdf",
      },
    });
  }

  const oldAnswers = await prisma.homeWorkAnswer.findMany({
    where: { homwork_id: homework.id },
    select: { id: true },
  });

  if (oldAnswers.length > 0) {
    await prisma.homeWorkResult.deleteMany({
      where: {
        homework_answer_id: {
          in: oldAnswers.map((a) => a.id),
        },
      },
    });
    await prisma.homeWorkAnswer.deleteMany({
      where: { homwork_id: homework.id },
    });
  }

  const answers = [];
  answers.push(
    await prisma.homeWorkAnswer.create({
      data: {
        student_id: students[0].id,
        homwork_id: homework.id,
        title: "Todo App topshirildi",
        file: JSON.stringify(["answer-1.png"]),
        homeworkStatus: HomeworkStatus.ACCEPTED,
      },
    }),
  );
  answers.push(
    await prisma.homeWorkAnswer.create({
      data: {
        student_id: students[1].id,
        homwork_id: homework.id,
        title: "Loyiha tekshiruvda",
        file: JSON.stringify(["answer-2.png"]),
        homeworkStatus: HomeworkStatus.PENDING,
      },
    }),
  );
  answers.push(
    await prisma.homeWorkAnswer.create({
      data: {
        student_id: students[2].id,
        homwork_id: homework.id,
        title: "Qayta ishlashga yuborildi",
        file: JSON.stringify(["answer-3.png"]),
        homeworkStatus: HomeworkStatus.RETURNED,
      },
    }),
  );

  await prisma.homeWorkResult.create({
    data: {
      homework_answer_id: answers[0].id,
      techer_id: teacher.id,
      grade: 90,
      title: "A'lo bajarilgan",
    },
  });

  await prisma.homeWorkResult.create({
    data: {
      homework_answer_id: answers[2].id,
      techer_id: teacher.id,
      grade: 45,
      title: "Qayta ishlash kerak",
    },
  });

  let video = await prisma.videos.findFirst({
    where: {
      group_id: group.id,
      title: "React Hooks dars yozuvi",
    },
  });

  if (video) {
    video = await prisma.videos.update({
      where: { id: video.id },
      data: {
        lesson_id: lesson.id,
        teacher_id: teacher.id,
        video_url: "seed-video.mp4",
        file_size: BigInt(12 * 1024 * 1024),
        description: "React Hooks bo'yicha dars yozuvi",
      },
    });
  } else {
    video = await prisma.videos.create({
      data: {
        group_id: group.id,
        lesson_id: lesson.id,
        teacher_id: teacher.id,
        title: "React Hooks dars yozuvi",
        video_url: "seed-video.mp4",
        file_size: BigInt(12 * 1024 * 1024),
        description: "React Hooks bo'yicha dars yozuvi",
      },
    });
  }

  let exam = await prisma.exam.findFirst({
    where: {
      group_id: group.id,
      title: "Oraliq imtihon: Frontend React",
    },
  });

  const examStart = new Date();
  const examEnd = new Date(examStart);
  examEnd.setDate(examEnd.getDate() + 2);

  if (exam) {
    exam = await prisma.exam.update({
      where: { id: exam.id },
      data: {
        teacher_id: teacher.id,
        description: "React bo'yicha oraliq nazorat savollari",
        file: "seed-exam.pdf",
        start_date: examStart,
        end_date: examEnd,
      },
    });
  } else {
    exam = await prisma.exam.create({
      data: {
        group_id: group.id,
        teacher_id: teacher.id,
        title: "Oraliq imtihon: Frontend React",
        description: "React bo'yicha oraliq nazorat savollari",
        file: "seed-exam.pdf",
        start_date: examStart,
        end_date: examEnd,
      },
    });
  }

  await prisma.examAnswer.deleteMany({ where: { exam_id: exam.id } });

  await prisma.examAnswer.create({
    data: {
      student_id: students[0].id,
      exam_id: exam.id,
      title: "Imtihon javobi topshirildi",
      file: "exam-answer-1.pdf",
      examStatus: ExamStatus.ACCEPTED,
      score: 87,
      feedback: "Yaxshi bajarilgan",
      checked_at: new Date(),
    },
  });

  await prisma.examAnswer.create({
    data: {
      student_id: students[1].id,
      exam_id: exam.id,
      title: "Javob tekshiruvda",
      file: "exam-answer-2.pdf",
      examStatus: ExamStatus.PENDING,
      score: 0,
      feedback: "Tekshiruv kutilmoqda",
    },
  });

  await prisma.examAnswer.create({
    data: {
      student_id: students[2].id,
      exam_id: exam.id,
      title: "Javob qayta topshirishga berildi",
      file: "exam-answer-3.pdf",
      examStatus: ExamStatus.RETURNED,
      score: 40,
      feedback: "Qayta ishlash tavsiya etildi",
      checked_at: new Date(),
    },
  });

  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  await prisma.attendance.deleteMany({
    where: { group_id: group.id, date: attendanceDate },
  });

  for (let i = 0; i < students.length; i++) {
    await prisma.attendance.create({
      data: {
        group_id: group.id,
        teacher_id: teacher.id,
        student_id: students[i].id,
        isPresent: i !== students.length - 1,
        date: attendanceDate,
      },
    });
  }

  const schedulePresets = [
    { week_day: ["Monday", "Wednesday", "Friday"], start_time: "09:00" },
    { week_day: ["Tuesday", "Thursday", "Saturday"], start_time: "11:00" },
    { week_day: ["Monday", "Thursday"], start_time: "14:00" },
    { week_day: ["Wednesday", "Friday"], start_time: "16:00" },
  ];

  const bulkGroups = [];
  for (let i = 1; i <= BULK_GROUPS_COUNT; i++) {
    const no = String(i).padStart(2, "0");
    const preset = schedulePresets[(i - 1) % schedulePresets.length];
    const teacherForGroup = allTeachers[(i - 1) % allTeachers.length];
    const courseForGroup = allCourses[(i - 1) % allCourses.length];
    const roomForGroup = allRooms[(i - 1) % allRooms.length];
    const matchedCourse =
      COURSE_CATALOG.find((c) => courseForGroup.name.startsWith(c.name)) ??
      COURSE_CATALOG[0];
    const groupName = `${matchedCourse.code}-N${String(200 + i).padStart(3, "0")}`;

    const groupStart = new Date();
    groupStart.setDate(groupStart.getDate() - (i % 7));
    const groupEnd = new Date(groupStart);
    groupEnd.setMonth(groupEnd.getMonth() + (courseForGroup.duration_month || 5));

    const groupStatus = i % 5 === 0 ? GroupStatus.cancelled : GroupStatus.active;

    let seedGroup = await prisma.groups.findFirst({
      where: { name: groupName },
    });

    if (seedGroup) {
      seedGroup = await prisma.groups.update({
        where: { id: seedGroup.id },
        data: {
          name: groupName,
          description: `${courseForGroup.name} yo'nalishi uchun ${no}-guruh`,
          course_id: courseForGroup.id,
          room_id: roomForGroup.id,
          start_date: groupStart,
          end_date: groupEnd,
          week_day: preset.week_day,
          start_time: preset.start_time,
          max_students: Math.max(GROUP_STUDENTS_EACH, 20),
          status: groupStatus,
        },
      });
    } else {
      seedGroup = await prisma.groups.create({
        data: {
          name: groupName,
          description: `${courseForGroup.name} yo'nalishi uchun ${no}-guruh`,
          course_id: courseForGroup.id,
          room_id: roomForGroup.id,
          start_date: groupStart,
          end_date: groupEnd,
          week_day: preset.week_day,
          start_time: preset.start_time,
          max_students: Math.max(GROUP_STUDENTS_EACH, 20),
          status: groupStatus,
        },
      });
    }

    await prisma.teachersGroup.deleteMany({
      where: {
        group_id: seedGroup.id,
        teacher_id: { not: teacherForGroup.id },
      },
    });

    await prisma.teachersGroup.upsert({
      where: {
        teacher_id_group_id: {
          teacher_id: teacherForGroup.id,
          group_id: seedGroup.id,
        },
      },
      update: {},
      create: {
        teacher_id: teacherForGroup.id,
        group_id: seedGroup.id,
      },
    });

    const assignCount = Math.min(GROUP_STUDENTS_EACH, allStudents.length);
    const targetStudentIds = [];
    for (let j = 0; j < assignCount; j++) {
      targetStudentIds.push(allStudents[(i - 1 + j) % allStudents.length].id);
    }

    await prisma.studentGroup.deleteMany({
      where: {
        group_id: seedGroup.id,
        student_id: { notIn: targetStudentIds },
      },
    });

    for (const studentId of targetStudentIds) {
      await prisma.studentGroup.upsert({
        where: {
          student_id_group_id: {
            student_id: studentId,
            group_id: seedGroup.id,
          },
        },
        update: {
          status: Status.active,
        },
        create: {
          student_id: studentId,
          group_id: seedGroup.id,
          status: Status.active,
        },
      });
    }

    bulkGroups.push(seedGroup);
  }

  console.log("Realistik seed completed.");
  console.log(`SUPERADMIN: ${process.env.SEED_SUPERADMIN_PHONE ?? "+998900000001"} / ${DEFAULT_PASSWORD}`);
  console.log(`ADMIN:      +998900000002 / ${DEFAULT_PASSWORD}`);
  console.log(`TEACHER:    +998900000010 / ${DEFAULT_PASSWORD}`);
  console.log(`STUDENT:    +998901111001 / ${DEFAULT_PASSWORD}`);
  console.log(`Bulk Teachers: ${extraTeachers.length}, Bulk Students: ${extraStudents.length}`);
  console.log(`Bulk Courses: ${extraCourses.length}, Bulk Rooms: ${extraRooms.length}, Bulk Groups: ${bulkGroups.length}`);
  console.log(`courseId=${course.id}, roomId=${room.id}, groupId=${group.id}, lessonId=${lesson.id}`);
  console.log(`homeworkId=${homework.id}, videoId=${video.id}, examId=${exam.id}`);
  console.log(`superadminId=${superadmin.id}, adminId=${admin.id}, teacherId=${teacher.id}`);
}

main()
  .catch((error) => {
    console.error("Realistik seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
