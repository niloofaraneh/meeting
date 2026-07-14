import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { formatJalaliDateTime } from "@/lib/jalali";
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from "@/lib/constants";

export default async function MeetingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const meetings = await db.meeting.findMany({
    where: { OR: [{ creatorId: user.id }, { attendees: { some: { userId: user.id } } }] },
    include: { creator: true, attendees: { include: { user: true } }, minute: true },
    orderBy: { date: "desc" }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-800">جلسات</h1>
          <p className="text-sm text-navy-400 mt-1">مدیریت درخواست‌ها، تایید حضور و پیگیری جلسات</p>
        </div>
        <Link href="/meetings/new">
          <Button>+ درخواست جلسه جدید</Button>
        </Link>
      </div>

      {meetings.length === 0 && (
        <Card><EmptyState title="هنوز جلسه‌ای ثبت نشده" description="با دکمه‌ی بالا اولین درخواست جلسه را ثبت کنید" /></Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((m) => (
          <Link key={m.id} href={`/meetings/${m.id}`}>
            <Card className="hover:shadow-card transition h-full">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-navy-800">{m.title}</h3>
                <Badge color={MEETING_STATUS_COLORS[m.status]}>{MEETING_STATUS_LABELS[m.status]}</Badge>
              </div>
              <p className="text-xs text-navy-400 mb-3">{formatJalaliDateTime(m.date)} {m.location ? `— ${m.location}` : ""}</p>
              <div className="flex items-center -space-x-2 space-x-reverse">
                {m.attendees.slice(0, 5).map((a) => (
                  <Avatar key={a.id} name={a.user.fullName} url={a.user.avatarUrl} size={28} />
                ))}
                {m.attendees.length > 5 && (
                  <span className="text-xs text-navy-400 mr-2">+{m.attendees.length - 5}</span>
                )}
              </div>
              {m.minute && (
                <p className="text-xs text-navy-400 mt-3">شماره صورتجلسه: {m.minute.number}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
