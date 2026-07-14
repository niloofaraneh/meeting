"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { phone, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("شماره موبایل یا رمز عبور اشتباه است.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, #d8ab35 0, transparent 35%), radial-gradient(circle at 80% 70%, #3d4f80 0, transparent 40%)"
      }} />
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-card p-8 relative z-10">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.svg" alt="ادب‌ویزا" width={160} height={44} />
        </div>
        <h1 className="text-lg font-bold text-navy-800 text-center mb-1">ورود به سامانه</h1>
        <p className="text-sm text-navy-400 text-center mb-6">سامانه جلسات و صورتجلسات ادب‌ویزا</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-navy-700 mb-1.5">شماره موبایل</label>
            <input
              type="text"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-navy-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-navy-700 mb-1.5">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              required
            />
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-800 hover:bg-navy-700 text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="text-xs text-navy-300 text-center mt-6">
          برای دریافت اطلاعات ورود آزمایشی، به فایل README.md پروژه مراجعه کنید.
        </p>
      </div>
    </div>
  );
}
