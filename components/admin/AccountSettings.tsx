"use client";

import { FormEvent, useState } from "react";

import { KeyRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";

type Props = {
  initial: {
    name: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean | null;
  };
};

export function AccountSettings({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  async function changeName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError("");
    setNameMessage("");
    if (!name.trim() || name.trim().length > 80) {
      setNameError("Вкажіть ім’я до 80 символів.");
      return;
    }
    setNameBusy(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) throw new Error("update-failed");
      setNameMessage("Ім’я змінено.");
    } catch {
      setNameError("Не вдалося оновити ім’я.");
    } finally {
      setNameBusy(false);
    }
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwdError("");
    setPwdMessage("");
    if (newPassword.length < 14 || newPassword.length > 128) {
      setPwdError("Новий пароль повинен мати від 14 до 128 символів.");
      return;
    }
    if (newPassword !== confirmation) {
      setPwdError("Нові паролі не збігаються.");
      return;
    }
    setPwdBusy(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error("change-failed");
      setPwdMessage("Пароль змінено. Сесії на інших пристроях завершено.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
    } catch {
      setPwdError("Не вдалося змінити пароль. Перевірте поточний пароль.");
    } finally {
      setPwdBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#62483e] bg-[#1c1513] px-4 py-3 text-sm text-[#f1e2d2] outline-none focus:border-[#36ae95]";
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <UserRound className="text-[#31a88f]" size={20} />
            <h2 className="font-serif text-2xl text-[#f0dfce]">Профіль</h2>
          </div>
          <p className="mt-3 text-sm text-[#b6a091]">
            Email: <span className="text-[#ead9c8]">{initial.email}</span>
          </p>
          <p className="mt-1 text-xs text-[#b6a091]">
            {initial.emailVerified ? "Email підтверджено" : "Email не підтверджено"}
          </p>
          <form onSubmit={changeName} className="mt-6 space-y-4">
            <label className="block text-sm text-[#e4cfc0]">
              Ім’я
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </label>
            {nameError && (
              <p role="alert" className="text-sm text-red-300">
                {nameError}
              </p>
            )}
            {nameMessage && (
              <p role="status" className="text-sm text-[#68c8ab]">
                {nameMessage}
              </p>
            )}
            <button
              disabled={nameBusy}
              type="submit"
              className="rounded-xl border border-[#437d68] px-5 py-3 text-sm text-[#d9f1e6] hover:bg-[#2b5e4e] disabled:opacity-50"
            >
              {nameBusy ? "Зачекайте…" : "Зберегти ім’я"}
            </button>
          </form>
        </div>
        <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-[#31a88f]" />
            <h2 className="font-serif text-2xl text-[#f0dfce]">Двофакторний захист</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#c5afa0]">
            Статус:{" "}
            <span className={initial.twoFactorEnabled ? "text-[#68c8ab]" : "text-amber-300"}>
              {initial.twoFactorEnabled ? "Увімкнено" : "Потрібне налаштування"}
            </span>
          </p>
          <p className="mt-2 text-sm leading-7 text-[#b6a091]">
            Зберігай резервні коди в менеджері паролів. Не публікуй QR-код, TOTP-секрет і резервні
            коди.
          </p>
          <p className="mt-3 text-xs leading-6 text-[#9d887a]">
            Зміна або скидання 2FA у цій версії не підтримується — це навмисно для безпеки.
          </p>
        </div>
      </div>
      <div className="rounded-[24px] border border-[#583e34] bg-[#291e1a] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <KeyRound size={20} className="text-[#31a88f]" />
          <h2 className="font-serif text-2xl text-[#f0dfce]">Змінити пароль</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-[#b6a091]">
          Після зміни пароля інші сесії будуть відкликані. Новий пароль — від 14 символів.
        </p>
        <form onSubmit={changePassword} className="mt-5 space-y-5">
          <label className="block text-sm text-[#e4cfc0]">
            Поточний пароль
            <input
              required
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-[#e4cfc0]">
            Новий пароль
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={14}
              maxLength={128}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-[#e4cfc0]">
            Повтори новий пароль
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={inputClass}
            />
          </label>
          {pwdError && (
            <p role="alert" className="text-sm text-red-300">
              {pwdError}
            </p>
          )}
          {pwdMessage && (
            <p role="status" className="text-sm text-[#68c8ab]">
              {pwdMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={pwdBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2a9b85] px-5 py-3 text-sm font-semibold text-[#12221c] hover:bg-[#36b49b] disabled:opacity-50"
          >
            <LockKeyhole size={16} />
            {pwdBusy ? "Зачекайте…" : "Оновити пароль"}
          </button>
        </form>
      </div>
    </div>
  );
}
