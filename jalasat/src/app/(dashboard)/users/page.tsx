import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import { NewUserForm } from "@/components/users/NewUserForm";
import Link from "next/link";

export default async function UsersPage() {
  const [users, units] = await Promise.all([
    db.user.findMany({ include: { unit: true }, orderBy: { fullName: "asc" } }),
    db.unit.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">پرسنل</h1>
        <p className="text-sm text-navy-400 mt-1">مدیریت اعضای سازمان، نقش‌ها و واحد هر شخص</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-navy-400 border-b border-navy-50">
                <th className="text-right py-3 px-4">نام</th>
                <th className="text-right py-3 px-4">واحد</th>
                <th className="text-right py-3 px-4">نقش</th>
                <th className="text-right py-3 px-4">شماره موبایل</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-navy-50/70 hover:bg-navy-50/40">
                  <td className="py-2.5 px-4">
                    <Link href={`/profile/${u.id}`} className="flex items-center gap-2.5">
                      <Avatar name={u.fullName} url={u.avatarUrl} size={28} />
                      <span className="text-navy-800">{u.fullName}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-navy-600">{u.unit?.name ?? "-"}</td>
                  <td className="py-2.5 px-4"><Badge color="#1f2c4d">{ROLE_LABELS[u.role]}</Badge></td>
                  <td className="py-2.5 px-4 text-navy-400" dir="ltr">{u.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-3">افزودن پرسنل جدید</h2>
          <NewUserForm units={units.map((u) => ({ id: u.id, name: u.name }))} />
        </Card>
      </div>
    </div>
  );
}
