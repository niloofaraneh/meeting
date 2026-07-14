import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const smsEnabled = process.env.FARAPAYAMAK_ENABLED === "true";

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-navy-800">تنظیمات سامانه</h1>
        <p className="text-sm text-navy-400 mt-1">تنظیمات کلی و اتصال به سرویس‌های بیرونی</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-navy-800">پنل پیامک فراپیامک</h2>
          <Badge color={smsEnabled ? "#3f9e5e" : "#8a94a6"}>{smsEnabled ? "فعال" : "غیرفعال (حالت توسعه)"}</Badge>
        </div>
        <p className="text-sm text-navy-500 leading-7">
          برای فعال‌سازی ارسال واقعی پیامک، فایل <code dir="ltr" className="bg-navy-50 px-1.5 py-0.5 rounded">.env</code> را
          باز کرده و مقادیر زیر را تکمیل کنید:
        </p>
        <pre dir="ltr" className="bg-navy-900 text-navy-50 text-xs rounded-xl p-4 mt-3 overflow-x-auto">
{`FARAPAYAMAK_USERNAME="نام کاربری پنل"
FARAPAYAMAK_PASSWORD="رمز عبور پنل"
FARAPAYAMAK_SENDER_NUMBER="شماره خط اختصاصی"
FARAPAYAMAK_ENABLED="true"`}
        </pre>
        <p className="text-xs text-navy-400 mt-3">
          پس از تغییر .env حتما یک‌بار سرویس Next.js را ری‌استارت کنید. جزئیات کامل در فایل README.md پروژه موجود است.
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-navy-800 mb-3">یادآوری‌های خودکار جلسات</h2>
        <p className="text-sm text-navy-500 leading-7">
          سیستم به‌صورت خودکار یک روز قبل، یک ساعت قبل و ۵ دقیقه قبل از هر جلسه‌ی تاییدشده
          به حاضرین اعلان می‌فرستد. این فرآیند نیاز به اجرای مداوم دارد؛ برای فعال‌سازی
          روی سرور، ورکر زیر را با pm2 اجرا کنید:
        </p>
        <pre dir="ltr" className="bg-navy-900 text-navy-50 text-xs rounded-xl p-4 mt-3 overflow-x-auto">
{`pm2 start "npm run notify:worker" --name adabvisa-notifier`}
        </pre>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-navy-800 mb-3">تم رنگی برند</h2>
        <div className="flex gap-3">
          {[
            { name: "سرمه‌ای اصلی", hex: "#1f2c4d" },
            { name: "سرمه‌ای تیره", hex: "#0c1226" },
            { name: "طلایی تاکیدی", hex: "#c1911f" },
            { name: "موفقیت", hex: "#3f9e5e" },
            { name: "هشدار", hex: "#e0a72e" },
            { name: "خطر", hex: "#d64545" }
          ].map((c) => (
            <div key={c.hex} className="text-center">
              <div className="w-12 h-12 rounded-xl mb-1.5 border border-navy-50" style={{ backgroundColor: c.hex }} />
              <p className="text-[10px] text-navy-400">{c.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
