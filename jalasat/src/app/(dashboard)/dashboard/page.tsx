import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canViewOrgWideReports } from "@/lib/permissions";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnitTasksBarChart, TaskStatusPieChart } from "@/components/dashboard/DashboardCharts";
import { formatJalaliDateTime, formatJalaliDate, relativeDaysFa } from "@/lib/jalali";
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants";

const quickLinks = [
  { href: "/meetings/new", label: "درخواست جلسه جدید", icon: "➕", color: "#1f2c4d" },
  { href: "/minutes", label: "ثبت صورتجلسه", icon: "📝", color: "#8654c9" },
  { href: "/tasks", label: "مصوبات من", icon: "✅", color: "#2f9e6e" },
  { href: "/tasks/export".replace("/tasks", "/api/tasks"), label: "خروجی اکسل مصوبات", icon: "📊", color: "#c07a2b" }
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orgWide = canViewOrgWideReports(user);
  const taskWhere = orgWide ? {} : { responsible: { unitId: user.unitId } };
  const meetingWhere = orgWide
    ? {}
    : { OR: [{ creatorId: user.id }, { attendees: { some: { userId: user.id } } }] };

  const [totalMeetings, confirmedMeetings, pendingMeetings, totalTasks, doneTasks, overdueTasks, dueSoonTasks, units] =
    await Promise.all([
      db.meeting.count({ where: meetingWhere }),
      db.meeting.count({ where: { ...meetingWhere, status: "CONFIRMED" } }),
      db.meeting.count({ where: { ...meetingWhere, status: "PENDING_APPROVAL" } }),
      db.task.count({ where: taskWhere }),
      db.task.count({ where: { ...taskWhere, status: "GREEN_DONE" } }),
      db.task.count({ where: { ...taskWhere, status: "RED_OVERDUE" } }),
      db.task.count({ where: { ...taskWhere, status: "YELLOW_DUE_SOON" } }),
      db.unit.findMany()
    ]);

  const upcomingMeetings = await db.meeting.findMany({
    where: { ...meetingWhere, status: "CONFIRMED", date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 5,
    include: { creator: true }
  });

  const myOpenTasks = await db.task.findMany({
    where: { responsibleId: user.id, doneAt: null },
    orderBy: { dueDate: "asc" },
    take: 6
  });

  const unitTaskCounts = await Promise.all(
    units.map(async (u) => ({
      unitName: u.name,
      color: u.colorHex,
      taskCount: await db.task.count({ where: { responsible: { unitId: u.id } } })
    }))
  );

  const inProgressTasks = totalTasks - doneTasks - overdueTasks - dueSoonTasks;
  const pieData = [
    { name: TASK_STATUS_LABELS.GREEN_DONE, value: doneTasks, color: TASK_STATUS_COLORS.GREEN_DONE },
    { name: TASK_STATUS_LABELS.YELLOW_DUE_SOON, value: dueSoonTasks, color: TASK_STATUS_COLORS.YELLOW_DUE_SOON },
    { name: TASK_STATUS_LABELS.RED_OVERDUE, value: overdueTasks, color: TASK_STATUS_COLORS.RED_OVERDUE },
    { name: TASK_STATUS_LABELS.IN_PROGRESS, value: Math.max(inProgressTasks, 0), color: TASK_STATUS_COLORS.IN_PROGRESS }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-800">سلام {user.name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-navy-400 mt-1">خلاصه‌ی وضعیت جلسات و مصوبات {orgWide ? "کل سازمان" : "واحد شما"}</p>
      </div>

      {/* دسترسی سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className="bg-white rounded-2xl shadow-soft border border-navy-50 p-4 flex items-center gap-3 hover:shadow-card transition"
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${q.color}1a` }}
            >
              {q.icon}
            </span>
            <span className="text-sm font-medium text-navy-700">{q.label}</span>
          </Link>
        ))}
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="کل جلسات" value={totalMeetings} color="#1f2c4d" />
        <StatCard label="جلسات تاییدشده" value={confirmedMeetings} color="#3f9e5e" />
        <StatCard label="در انتظار تایید" value={pendingMeetings} color="#e0a72e" />
        <StatCard label="مصوبات معوق" value={overdueTasks} color="#d64545" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-bold text-navy-800 mb-4">مصوبات به تفکیک واحد</h2>
          {unitTaskCounts.length ? <UnitTasksBarChart data={unitTaskCounts} /> : <EmptyState title="داده‌ای وجود ندارد" />}
        </Card>
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-4">وضعیت کلی مصوبات</h2>
          {totalTasks ? <TaskStatusPieChart data={pieData} /> : <EmptyState title="مصوبه‌ای ثبت نشده است" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy-800">جلسات پیش رو</h2>
            <Link href="/meetings" className="text-xs text-navy-400 hover:text-navy-700">مشاهده همه</Link>
          </div>
          {upcomingMeetings.length === 0 && <EmptyState title="جلسه‌ی تاییدشده‌ای در پیش نیست" />}
          <div className="space-y-3">
            {upcomingMeetings.map((m) => (
              <Link key={m.id} href={`/meetings/${m.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-navy-50/60">
                <div>
                  <p className="text-sm font-medium text-navy-800">{m.title}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{formatJalaliDateTime(m.date)} — برگزارکننده: {m.creator.fullName}</p>
                </div>
                <Badge color={MEETING_STATUS_COLORS[m.status]}>{MEETING_STATUS_LABELS[m.status]}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy-800">تسک‌های باز من</h2>
            <Link href="/tasks" className="text-xs text-navy-400 hover:text-navy-700">مشاهده همه</Link>
          </div>
          {myOpenTasks.length === 0 && <EmptyState title="تسک بازی ندارید 🎉" />}
          <div className="space-y-3">
            {myOpenTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-navy-50/60">
                <div>
                  <p className="text-sm font-medium text-navy-800">{t.title}</p>
                  <p className="text-xs text-navy-400 mt-0.5">مهلت: {formatJalaliDate(t.dueDate)} — {relativeDaysFa(t.dueDate)}</p>
                </div>
                <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
