"use client";

import { FormEvent, useState } from "react";

import QRCode from "react-qr-code";

import { authClient } from "@/lib/auth-client";

export function Setup2FA() {
  const [password, setPassword] = useState("");
  const [uri, setUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function begin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await authClient.twoFactor.enable({ password, method: "totp" });
      if (response.error || !response.data || !("totpURI" in response.data))
        throw new Error("enable");
      setUri(response.data.totpURI || "");
      setBackupCodes(response.data.backupCodes ?? []);
      setPassword("");
    } catch {
      setError("Не вдалося активувати 2FA. Перевірте пароль.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
      if (response.error) throw new Error("verify");
      // Enrollment sessions aren't MFA-authenticated. Require a fresh login.
      await authClient.signOut();
      window.location.assign("/login");
    } catch {
      setError("Неправильний код. Перевірте час на телефоні.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1d1513] px-5 py-12 text-[#efe0d1]">
      <div className="w-full max-w-xl rounded-[24px] border border-[#523a30] bg-[#271b18] p-7 sm:p-10">
        <p className="text-xs tracking-[0.22em] text-[#2caa91] uppercase">Захист адміністратора</p>
        <h1 className="mt-3 font-serif text-4xl">Увімкнути 2FA</h1>
        <p className="mt-3 text-sm leading-7 text-[#c6aa9b]">
          Адмін-панель стане доступною тільки після налаштування двофакторної перевірки й повторного
          входу.
        </p>
        {!uri ? (
          <form onSubmit={begin} className="mt-6 space-y-4">
            <label className="block text-sm">
              Підтвердьте пароль
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#65483b] bg-[#1b1412] p-3 outline-none focus:border-[#2caa91]"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[#279b85] px-5 py-3 font-semibold text-[#101d19] disabled:opacity-60"
            >
              {busy ? "Зачекайте…" : "Створити QR-код →"}
            </button>
          </form>
        ) : (
          <>
            <p className="mt-6 text-sm">
              1. Відскануйте QR-код у Google Authenticator або іншому TOTP-застосунку.
            </p>
            <div className="mt-4 inline-block rounded-xl bg-white p-4">
              <QRCode value={uri} size={190} />
            </div>
            <p className="mt-4 text-sm">
              2. Збережіть резервні коди в менеджері паролів. Вони відображаються тільки зараз.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#65483b] bg-[#1b1412] p-4 font-mono text-xs sm:grid-cols-3">
              {backupCodes.map((backup, i) => (
                <span key={i} className="break-all">
                  {backup}
                </span>
              ))}
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={saved}
                onChange={(e) => setSaved(e.target.checked)}
                className="mt-1 accent-[#279b85]"
              />{" "}
              Я зберіг(ла) резервні коди у безпечному місці.
            </label>
            <form onSubmit={confirm} className="mt-5 space-y-4">
              <label className="block text-sm">
                3. Введіть шестизначний код
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#65483b] bg-[#1b1412] p-3 tracking-widest outline-none focus:border-[#2caa91]"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || !saved}
                className="rounded-xl bg-[#279b85] px-5 py-3 font-semibold text-[#101d19] disabled:opacity-60"
              >
                {busy ? "Перевіряємо…" : "Підтвердити 2FA →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
