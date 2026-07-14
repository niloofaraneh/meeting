/**
 * داده‌های اولیه سیستم - واحدها و کاربران نمونه
 * اجرا: npm run db:seed
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("در حال ایجاد داده‌های نمونه...");

  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  // ---------------- واحدها ----------------
  const management = await prisma.unit.upsert({
    where: { code: "م" },
    update: {},
    create: { name: "مدیریت داخلی", code: "م", colorHex: "#1f2c4d" }
  });

  const marketing = await prisma.unit.upsert({
    where: { code: "الف" },
    update: {},
    create: { name: "واحد مارکتینگ", code: "الف", colorHex: "#8654c9" }
  });

  const sales = await prisma.unit.upsert({
    where: { code: "ب" },
    update: {},
    create: { name: "واحد فروش", code: "ب", colorHex: "#2f9e6e" }
  });

  const finance = await prisma.unit.upsert({
    where: { code: "ج" },
    update: {},
    create: { name: "واحد مالی", code: "ج", colorHex: "#c07a2b" }
  });

  const hr = await prisma.unit.upsert({
    where: { code: "د" },
    update: {},
    create: { name: "منابع انسانی", code: "د", colorHex: "#c94f8f" }
  });

  const it = await prisma.unit.upsert({
    where: { code: "ه" },
    update: {},
    create: { name: "فناوری اطلاعات", code: "ه", colorHex: "#2f8bc9" }
  });

  // ---------------- کاربران ----------------
  const usersData = [
    { fullName: "مدیرکل سامانه", phone: "09120000001", role: Role.SUPER_ADMIN, unitId: management.id, position: "مدیرکل" },
    { fullName: "مدیرعامل", phone: "09120000002", role: Role.CEO, unitId: management.id, position: "مدیرعامل" },
    { fullName: "قائم مقام", phone: "09120000003", role: Role.DEPUTY, unitId: management.id, position: "قائم مقام مدیرعامل" },
    { fullName: "مدیر واحد مارکتینگ", phone: "09120000004", role: Role.UNIT_MANAGER, unitId: marketing.id, position: "مدیر مارکتینگ" },
    { fullName: "سرپرست مارکتینگ", phone: "09120000005", role: Role.SUPERVISOR, unitId: marketing.id, position: "سرپرست تیم محتوا" },
    { fullName: "کارشناس مارکتینگ", phone: "09120000006", role: Role.STAFF, unitId: marketing.id, position: "کارشناس مارکتینگ" },
    { fullName: "مدیر واحد فروش", phone: "09120000007", role: Role.UNIT_MANAGER, unitId: sales.id, position: "مدیر فروش" },
    { fullName: "کارشناس فروش", phone: "09120000008", role: Role.STAFF, unitId: sales.id, position: "کارشناس فروش" },
    { fullName: "مدیر مالی", phone: "09120000009", role: Role.UNIT_MANAGER, unitId: finance.id, position: "مدیر مالی" },
    { fullName: "کارشناس منابع انسانی", phone: "09120000010", role: Role.STAFF, unitId: hr.id, position: "کارشناس HR" },
    { fullName: "کارشناس فناوری اطلاعات", phone: "09120000011", role: Role.STAFF, unitId: it.id, position: "کارشناس IT" }
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: { ...u, passwordHash }
    });
  }

  console.log("داده‌های نمونه با موفقیت ایجاد شدند.");
  console.log("---------------------------------------------");
  console.log("ورود آزمایشی با هر یک از شماره‌های بالا، رمز عبور: Admin@12345");
  console.log("---------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
