"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

export default function AdminUsersPage() {
  const [users,  setUsers]  = useState<UserRow[] | null>(null);
  const [error,  setError]  = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((j) => j.error ? setError(j.error) : setUsers(j.data ?? []))
      .catch(() => setError("Could not load users"));
  }, []);

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-medium uppercase tracking-widest text-clay">People</span>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Registered Users</h1>
          {users && (
            <p className="mt-1 text-sm text-ink/50">{users.length} total user{users.length !== 1 ? "s" : ""}</p>
          )}
        </div>
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-full border border-sand-dark bg-white py-2 pl-9 pr-4 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>
      )}

      {/* Loading */}
      {users === null && !error && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-sand-dark/60 bg-white" />
          ))}
        </div>
      )}

      {/* Empty */}
      {users && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark py-16 text-center">
          <h3 className="font-display text-xl text-ink">
            {search ? "No users match your search" : "No users yet"}
          </h3>
          <p className="mt-2 text-sm text-ink/60">
            {search ? "Try a different search term." : "Users will appear here after they sign up."}
          </p>
        </div>
      )}

      {/* Table */}
      {users && filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-sand-dark/60 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sand-dark/60 bg-sand/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-ink/60">User</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Email</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Phone</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Role</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Joined</th>
                  <th className="px-4 py-3 font-medium text-ink/60">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/40">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-sand/30 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar initials */}
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-clay/10 text-xs font-semibold text-clay">
                          {(user.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-ink">
                            {user.full_name ?? <span className="text-ink/30 font-normal">Name not set</span>}
                          </p>
                          <p className="font-mono text-[10px] text-ink/30">#{user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-ink/80">{user.email ?? "—"}</span>
                        {user.email_confirmed && (
                          <span title="Email verified" className="text-moss">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3 text-ink/70">
                      {user.phone ?? <span className="text-ink/30">—</span>}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        user.role === "admin"
                          ? "bg-clay/10 text-clay-dark"
                          : "bg-sand text-ink/60"
                      }`}>
                        {user.role ?? "user"}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 text-ink/60">
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    {/* Last login */}
                    <td className="px-4 py-3 text-ink/50 text-xs">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : <span className="text-ink/30">Never</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
