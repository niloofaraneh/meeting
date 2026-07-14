import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJalaliDate, relativeDaysFa } from "@/lib/jalali";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { canViewOrgWideReports } from "@/lib/permissions";
import { ExportButton } from "@/components/minutes/ExportButton";
import { TaskRowActions } from "@/components/tasks/TaskRowActions";

export default async function TasksPage({ searchParams }: { searchParams: { scope?: string } }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const scope = searchParams.scope ?? "mine";
  const orgWide = canViewOrgWideReports(user);

  let where: any = { responsibleId: user.id };
  if (scope === "team") where = { responsible: { unitId: user.unitId } };
  if (scope === "all" && orgWide) where = {};

  const tasks = await db.task.findMany({
    where,
    include: { responsible: true, assigner: true, minute: { include: { meeting: true } } },
    orderBy: { dueDate: "asc" }
  });

  const tabs = [
    { key: "mine", label: "تسک‌های من" },
    { key: "team", label: "تسک‌های هم‌گروهی‌ها" },
    ...(orgWide ? [{ key: "all", label: "همه تسک‌های سازمان" }] : [])
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-800">مصوبات و تسک‌ها</h1>
          <p className="text-sm text-navy-400 mt-1">پیگیری تسک‌های شخصی و هم‌گروهی به همراه ددلاین‌ها</p>
        </div>
        <ExportButton unitId={scope === "team" ? user.unitId ?? undefined : undefined} responsibleId={scope === "mine" ? user.id : undefined} />
      </div>

      <div className="flex gap-2 border-b border-navy-50">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/tasks?scope=${t.key}`}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              scope === t.key ? "border-navy-700 text-navy-800 font-medium" : "border-transparent text-navy-400"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card><EmptyState title="تسکی یافت نشد" /></Card>
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <Card key={t.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-navy-800 truncate">{t.title}</p>
                <Badge color={PRIORITY_COLORS[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge>
              </div>
              <p className="text-xs text-navy-400">
                مسئول: {t.responsible.fullName} — مهلت: {formatJalaliDate(t.dueDate)} ({relativeDaysFa(t.dueDate)})
                {t.minute && <> — {t.minute.meeting.title}</>}
              </p>
              {t.approvalStatus === "PENDING" && t.responsibleId === user.id && (
                <p className="text-xs text-status-warning mt-1">این تسک منتظر تایید شماست</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
              {t.responsibleId === user.id && (
                <TaskRowActions taskId={t.id} approvalStatus={t.approvalStatus} isDone={!!t.doneAt} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
