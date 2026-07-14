/**
 * ورکر مستقل یادآوری‌ها.
 *
 * روی سرور واقعی این اسکریپت را به‌صورت یک پروسه‌ی جدا (مثلا با pm2) اجرا کنید تا
 * هر ۲ دقیقه یک‌بار جلسات/تسک‌های نزدیک به موعد را بررسی و اعلان (پنل + پیامک) بفرستد:
 *
 *   npm run notify:worker
 *   یا برای اجرای دائمی روی سرور:
 *   pm2 start "npm run notify:worker" --name adabvisa-notifier
 *
 * جایگزین: اگر ترجیح می‌دهید از کرون سیستم‌عامل استفاده کنید، به‌جای این فایل
 * می‌توانید هر ۲ دقیقه یک‌بار با curl آدرس API زیر را با هدر Secret صدا بزنید:
 *   POST /api/notifications/cron   Header: x-cron-secret: <NOTIFICATION_CRON_SECRET>
 */
import cron from "node-cron";
import { runMeetingReminderSweep } from "../src/modules/notifications/reminder.service";

async function tick() {
  try {
    const result = await runMeetingReminderSweep();
    console.log(
      `[${new Date().toISOString()}] بررسی یادآوری‌ها انجام شد - ${result.sentCount} اعلان جدید ارسال شد ` +
        `(از بین ${result.checkedMeetings} جلسه و ${result.checkedTasks} تسک بررسی‌شده)`
    );
  } catch (err) {
    console.error("خطا در اجرای ورکر یادآوری:", err);
  }
}

console.log("ورکر یادآوری ادب‌ویزا شروع به کار کرد - هر ۲ دقیقه یک‌بار بررسی می‌شود...");
tick();
cron.schedule("*/2 * * * *", tick);
