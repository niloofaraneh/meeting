import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatJalaliDate } from "@/lib/jalali";

export default async function MinutesPage() {
  const minutes = await db.meetingMinute.findMany({
    include: { meeting: true, recorder: true, tasks: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">صورتجلسات</h1>
        <p className="text-sm text-navy-400 mt-1">فهرست صورتجلسات ثبت‌شده و مصوبات هر یک — مطابق شماره‌گذاری فرم پایش G20</p>
      </div>

      {minutes.length === 0 && (
        <Card><EmptyState title="صورتجلسه‌ای ثبت نشده" description="از داخل صفحه‌ی هر جلسه‌ی تایید‌شده می‌توانید صورتجلسه ثبت کنید" /></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {minutes.map((m) => {
          const doneCount = m.tasks.filter((t) => t.status === "GREEN_DONE").length;
          return (
            <Link key={m.id} href={`/minutes/${m.id}`}>
              <Card className="hover:shadow-card transition h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-navy-400">شماره {m.number}</span>
                  <Badge color="#3574c4">{m.tasks.length} مصوبه</Badge>
                </div>
                <h3 className="font-bold text-navy-800 mb-1">{m.meeting.title}</h3>
                <p className="text-xs text-navy-400">تاریخ جلسه: {formatJalaliDate(m.meeting.date)} — تنظیم‌کننده: {m.recorder.fullName}</p>
                <p className="text-xs text-status-success mt-2">{doneCount} از {m.tasks.length} مصوبه انجام شده</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
