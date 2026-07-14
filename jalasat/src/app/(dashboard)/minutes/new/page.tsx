import { db } from "@/lib/db";
import { NewMinuteForm } from "@/components/minutes/NewMinuteForm";
import { redirect } from "next/navigation";

export default async function NewMinutePage({ searchParams }: { searchParams: { meetingId?: string } }) {
  if (!searchParams.meetingId) redirect("/meetings");

  const meeting = await db.meeting.findUnique({ where: { id: searchParams.meetingId } });
  if (!meeting) redirect("/meetings");

  const units = await db.unit.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-navy-800 mb-1">ثبت صورتجلسه</h1>
      <p className="text-sm text-navy-400 mb-6">برای جلسه: {meeting.title}</p>
      <NewMinuteForm meetingId={meeting.id} units={units.map((u) => ({ id: u.id, name: u.name, code: u.code }))} />
    </div>
  );
}
