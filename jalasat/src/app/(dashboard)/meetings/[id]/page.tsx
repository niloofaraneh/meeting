import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatJalaliDateTime } from "@/lib/jalali";
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from "@/lib/constants";
import { MeetingActions } from "@/components/meetings/MeetingActions";
import Link from "next/link";

const responseLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پاسخ", color: "#8a94a6" },
  ACCEPTED: { label: "تایید حضور", color: "#3f9e5e" },
  REJECTED: { label: "عدم حضور", color: "#d64545" },
  PROPOSED_NEW_TIME: { label: "پیشنهاد زمان جدید", color: "#3574c4" }
};

export default async function MeetingDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const meeting = await db.meeting.findUnique({
    where: { id: params.id },
    include: {
      creator: true,
      attendees: { include: { user: true } },
      minute: { include: { tasks: { include: { responsible: true } } } }
    }
  });

  if (!meeting) notFound();

  const myAttendance = meeting.attendees.find((a) => a.userId === user.id);
  const isCreator = meeting.creatorId === user.id;
  const canManage = isCreator || ["SUPER_ADMIN", "CEO", "DEPUTY"].includes(user.role);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-800">{meeting.title}</h1>
          <p className="text-sm text-navy-400 mt-1">{formatJalaliDateTime(meeting.date)} {meeting.location ? `— ${meeting.location}` : ""}</p>
        </div>
        <Badge color={MEETING_STATUS_COLORS[meeting.status]}>{MEETING_STATUS_LABELS[meeting.status]}</Badge>
      </div>

      {meeting.description && (
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-2">دستور جلسه / توضیحات</h2>
          <p className="text-sm text-navy-600 whitespace-pre-line">{meeting.description}</p>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-bold text-navy-800 mb-3">حاضرین و وضعیت پاسخ</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5">
            <div className="flex items-center gap-2.5">
              <Avatar name={meeting.creator.fullName} url={meeting.creator.avatarUrl} size={32} />
              <p className="text-sm text-navy-800">{meeting.creator.fullName} <span className="text-xs text-navy-400">(برگزارکننده)</span></p>
            </div>
          </div>
          {meeting.attendees.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-navy-50/50">
              <div className="flex items-center gap-2.5">
                <Avatar name={a.user.fullName} url={a.user.avatarUrl} size={32} />
                <p className="text-sm text-navy-800">{a.user.fullName}</p>
              </div>
              <Badge color={responseLabels[a.response].color}>{responseLabels[a.response].label}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <MeetingActions
        meetingId={meeting.id}
        myResponse={myAttendance?.response ?? null}
        isAttendee={!!myAttendance}
        canManage={canManage}
        status={meeting.status}
        hasMinute={!!meeting.minute}
      />

      {meeting.minute && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-navy-800">صورتجلسه ثبت‌شده</h2>
            <Link href={`/minutes/${meeting.minute.id}`} className="text-xs text-navy-600 hover:underline">
              مشاهده صورتجلسه (شماره {meeting.minute.number})
            </Link>
          </div>
          <p className="text-xs text-navy-400">{meeting.minute.tasks.length} مصوبه ثبت شده است</p>
        </Card>
      )}
    </div>
  );
}
