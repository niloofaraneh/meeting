import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatJalaliDate } from "@/lib/jalali";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { ExportButton } from "@/components/minutes/ExportButton";

export default async function MinuteDetailPage({ params }: { params: { id: string } }) {
  const minute = await db.meetingMinute.findUnique({
    where: { id: params.id },
    include: {
      meeting: true,
      recorder: true,
      tasks: { include: { responsible: true, assigner: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!minute) notFound();

  const users = await db.user.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-800">صورتجلسه {minute.number}</h1>
          <p className="text-sm text-navy-400 mt-1">{minute.meeting.title} — {formatJalaliDate(minute.meeting.date)}</p>
        </div>
        <ExportButton />
      </div>

      {minute.summary && (
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-2">خلاصه مذاکرات</h2>
          <p className="text-sm text-navy-600 whitespace-pre-line">{minute.summary}</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-navy-800">مصوبات و تسک‌های این جلسه</h2>
          <Badge color="#3574c4">{minute.tasks.length} مورد</Badge>
        </div>

        {minute.tasks.length === 0 && (
          <p className="text-sm text-navy-300 text-center py-6">هنوز مصوبه‌ای برای این جلسه ثبت نشده است</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-navy-400 border-b border-navy-50">
                <th className="text-right py-2 px-2">ردیف</th>
                <th className="text-right py-2 px-2">موضوع مصوبه</th>
                <th className="text-right py-2 px-2">مسئول پیگیری</th>
                <th className="text-right py-2 px-2">اولویت</th>
                <th className="text-right py-2 px-2">مهلت اجرا</th>
                <th className="text-right py-2 px-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {minute.tasks.map((t, idx) => (
                <tr key={t.id} className="border-b border-navy-50/70 hover:bg-navy-50/40">
                  <td className="py-2.5 px-2 text-navy-400">{idx + 1}</td>
                  <td className="py-2.5 px-2 text-navy-800">
                    {t.title}
                    {t.explanation && <p className="text-xs text-navy-400 mt-0.5">{t.explanation}</p>}
                  </td>
                  <td className="py-2.5 px-2 text-navy-600">{t.responsible.fullName}</td>
                  <td className="py-2.5 px-2 text-navy-600">{PRIORITY_LABELS[t.priority]}</td>
                  <td className="py-2.5 px-2 text-navy-600">{formatJalaliDate(t.dueDate)}</td>
                  <td className="py-2.5 px-2">
                    <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-navy-800 mb-4">افزودن مصوبه/تسک جدید</h2>
        <AddTaskForm
          minuteId={minute.id}
          users={users.map((u) => ({ id: u.id, fullName: u.fullName }))}
        />
      </Card>
    </div>
  );
}
