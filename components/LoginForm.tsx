"use client";

import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

type Step = "password" | "totp" | "backup";

export function LoginForm() {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error("auth-error");
      setPassword("");
      if (result.data && "twoFactorRedirect" in result.data && result.data.twoFactorRedirect) {
        setStep("totp");
        return;
      }
      // First account sign-in is only allowed to reach the 2FA setup page.
      window.location.assign("/admin");
    } catch {
      setError("Не вдалося увійти. Перевірте дані або спробуйте пізніше.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response =
        step === "backup"
          ? await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice: false })
          : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: false });
      if (response.error) throw new Error("2fa-error");
      window.location.assign("/admin");
    } catch {
      setError("Код не прийнято. Спробуйте ще раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1d1513] px-5 py-12 text-[#efe0d1]">
      <div className="w-full max-w-[430px] rounded-[24px] border border-[#523a30] bg-[#271b18] p-7 shadow-2xl sm:p-10">
        <div className="mb-7 text-xs font-semibold tracking-[0.27em] text-[#2caa91] uppercase">
          СН · Тільки для адміністратора
        </div>
        <h1 className="font-serif text-4xl">{step === "password" ? "Вхід" : "Другий крок"}</h1>
        <p className="mt-3 text-sm leading-7 text-[#c6aa9b]">
          {step === "password"
            ? "Введіть email та пароль."
            : step === "totp"
              ? "Введіть код із застосунку-автентифікатора."
              : "Введіть один із резервних кодів."}
        </p>
        <form onSubmit={step === "password" ? signIn : verify} className="mt-7 space-y-5">
          {step === "password" ? (
            <>
              <label className="block text-sm">
                Email
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#65483b] bg-[#1b1412] p-3 outline-none focus:border-[#2caa91]"
                />
              </label>
              <label className="block text-sm">
                Пароль
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={14}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#65483b] bg-[#1b1412] p-3 outline-none focus:border-[#2caa91]"
                />
              </label>
            </>
          ) : (
            <label className="block text-sm">
              {step === "backup" ? "Резервний код" : "6-значний код"}
              <input
                type="text"
                inputMode={step === "totp" ? "numeric" : "text"}
                autoComplete={step === "totp" ? "one-time-code" : "off"}
                pattern={step === "totp" ? "[0-9]{6}" : undefined}
                maxLength={step === "totp" ? 6 : undefined}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#65483b] bg-[#1b1412] p-3 tracking-widest outline-none focus:border-[#2caa91]"
              />
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="w-full rounded-xl bg-[#279b85] px-5 py-3 font-semibold text-[#101d19] transition hover:bg-[#35b69e] disabled:opacity-60"
          >
            {busy ? "Зачекайте…" : step === "password" ? "Продовжити →" : "Підтвердити →"}
          </button>
        </form>
        {step !== "password" && (
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#af9d90]">
            <button
              type="button"
              onClick={() => {
                setStep(step === "totp" ? "backup" : "totp");
                setCode("");
                setError("");
              }}
              className="underline decoration-[#328f7d] underline-offset-4"
            >
              {step === "totp" ? "Використати резервний код" : "Використати TOTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("password");
                setCode("");
                setError("");
              }}
              className="underline underline-offset-4"
            >
              Почати спочатку
            </button>
          </div>
        )}
        <a href="/" className="mt-8 inline-block text-xs text-[#a99081] hover:text-[#efe0d1]">
          ← Повернутися на сайт
        </a>
      </div>
    </main>
  );
}
