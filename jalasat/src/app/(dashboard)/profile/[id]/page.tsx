import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJalaliDate, relativeDaysFa } from "@/lib/jalali";
import { ROLE_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const profile = await db.user.findUnique({
    where: { id: params.id },
    include: {
      unit: true,
      responsibleTasks: { include: { minute: { include: { meeting: true } } }, orderBy: { dueDate: "asc" } }
    }
  });
  if (!profile) notFound();

  const teamTasks = profile.unitId
    ? await db.task.findMany({
        where: { responsible: { unitId: profile.unitId }, responsibleId: { not: profile.id } },
        include: { responsible: true },
        orderBy: { dueDate: "asc" },
        take: 10
      })
    : [];

  const openTasks = profile.responsibleTasks.filter((t) => !t.doneAt);
  const doneTasks = profile.responsibleTasks.filter((t) => t.doneAt);
  const isSelf = currentUser.id === profile.id;

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-5">
        <Avatar name={profile.fullName} url={profile.avatarUrl} size={72} />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-navy-800">{profile.fullName}</h1>
          <p className="text-sm text-navy-400 mt-0.5">{profile.position ?? ROLE_LABELS[profile.role]} — {profile.unit?.name ?? "بدون واحد"}</p>
          <div className="flex gap-2 mt-2">
            <Badge color="#1f2c4d">{ROLE_LABELS[profile.role]}</Badge>
            <Badge color="#3f9e5e">{openTasks.length} تسک باز</Badge>
            <Badge color="#8a94a6">{doneTasks.length} تسک انجام‌شده</Badge>
          </div>
        </div>
      </Card>

      {profile.bio && (
        <Card><p className="text-sm text-navy-600">{profile.bio}</p></Card>
      )}

      {isSelf && <ProfileEditForm userId={profile.id} bio={profile.bio ?? ""} avatarUrl={profile.avatarUrl ?? ""} notifyByInApp={profile.notifyByInApp} notifyBySms={profile.notifyBySms} />}

      <Card>
        <h2 className="text-sm font-bold text-navy-800 mb-4">تسک‌های {isSelf ? "من" : "این شخص"}</h2>
        {openTasks.length === 0 && <EmptyState title="تسک بازی وجود ندارد" />}
        <div className="space-y-2">
          {openTasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-50/50">
              <div>
                <p className="text-sm text-navy-800">{t.title}</p>
                <p className="text-xs text-navy-400">مهلت: {formatJalaliDate(t.dueDate)} — {relativeDaysFa(t.dueDate)}</p>
              </div>
              <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {teamTasks.length > 0 && (
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-4">تسک‌های هم‌گروهی‌ها ({profile.unit?.name})</h2>
          <div className="space-y-2">
            {teamTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-50/50">
                <div>
                  <p className="text-sm text-navy-800">{t.title}</p>
                  <p className="text-xs text-navy-400">مسئول: {t.responsible.fullName} — مهلت: {formatJalaliDate(t.dueDate)}</p>
                </div>
                <Badge color={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
