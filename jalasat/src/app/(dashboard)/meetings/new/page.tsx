import { db } from "@/lib/db";
import { NewMeetingForm } from "@/components/meetings/NewMeetingForm";

export default async function NewMeetingPage() {
  const users = await db.user.findMany({
    where: { isActive: true },
    include: { unit: true },
    orderBy: { fullName: "asc" }
  });

  const simplified = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    unitName: u.unit?.name ?? "بدون واحد",
    avatarUrl: u.avatarUrl
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-navy-800 mb-1">درخواست جلسه جدید</h1>
      <p className="text-sm text-navy-400 mb-6">
        تاریخ را به فرمت شمسی وارد کنید (مثال: ۱۴۰۴/۰۳/۰۱). بعد از انتخاب حاضرین، تایم‌های اشغال آن‌ها به شما نمایش داده می‌شود.
      </p>
      <NewMeetingForm users={simplified} />
    </div>
  );
}
