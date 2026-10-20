"use client";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        window.location.assign("/login");
      }}
      className="rounded-full border border-[#675044] px-5 py-2 text-sm text-[#e6d4c5] hover:border-[#2caa91]"
    >
      Вийти ↗
    </button>
  );
}
