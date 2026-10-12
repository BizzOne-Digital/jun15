"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@royalgardenrestaurant.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="flex min-h-[100dvh] w-full max-w-full overflow-x-hidden items-center justify-center bg-[#1e4d3a] px-4 py-8 pt-safe pb-safe">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm min-w-0 space-y-4 rounded-2xl bg-[#faf6f0] p-6 shadow-xl sm:p-8"
      >
        <h1 className="text-xl font-bold text-[#964B00]">Admin sign in</h1>
        <input
          type="email"
          className="w-full min-w-0 rounded-lg border border-stone-200 px-3 py-3 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="w-full min-w-0 rounded-lg border border-stone-200 px-3 py-3 text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#964B00] py-2 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="block text-center text-sm text-stone-500">
          Back to store
        </a>
      </form>
    </div>
  );
}
