"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { formatPrice } from "@/lib/mockData";
import type { Profile, Order, Gender, ProfileAddress } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-sand text-ink/70",
  paid:       "bg-moss/10 text-moss",
  processing: "bg-clay/10 text-clay-dark",
  shipped:    "bg-clay/10 text-clay-dark",
  delivered:  "bg-moss/10 text-moss",
  cancelled:  "bg-ink/10 text-ink/60",
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const emptyAddress: ProfileAddress = { line1: "", line2: "", city: "", state: "", pincode: "" };

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // form state
  const [fullName, setFullName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [gender,   setGender]   = useState<Gender | "">("");
  const [address,  setAddress]  = useState<ProfileAddress>(emptyAddress);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile").then(r => r.json()).then(j => {
      if (j.data) {
        const p: Profile = j.data;
        setProfile(p);
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setGender(p.gender ?? "");
        setAddress(p.address ?? emptyAddress);
        setAvatarUrl(p.avatar_url ?? null);
      }
    });
    fetch("/api/orders").then(r => r.json()).then(j => j.data && setOrders(j.data));
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");
      setAvatarUrl(json.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:  fullName,
          phone,
          gender:     gender || undefined,
          address,
          avatar_url: avatarUrl ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Could not save");
      setProfile(json.data);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="h-40 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">Account</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">My profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-sand-dark/60 bg-white p-6">

            {/* Avatar */}
            <div className="relative mx-auto mb-4 h-20 w-20">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Profile" fill sizes="80px"
                  className="rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-clay text-2xl font-display text-white">
                  {(profile?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              {editing && (
                <>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                    id="avatar-upload" onChange={handleAvatarChange} />
                  <label htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-clay text-white shadow-sm hover:bg-clay-dark">
                    {uploadingAvatar ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : <CameraIcon />}
                  </label>
                </>
              )}
            </div>

            <p className="text-center font-display text-lg text-ink">
              {profile?.full_name || <span className="text-ink/40">No name set</span>}
            </p>
            <p className="text-center text-sm text-ink/60">{user.email}</p>
            <div className="mt-2 flex justify-center">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                profile?.role === "admin" ? "bg-clay/10 text-clay-dark" : "bg-sand text-ink/70"
              }`}>
                {profile?.role ?? "user"}
              </span>
            </div>

            <div className="mt-5 space-y-3 border-t border-sand-dark/60 pt-4 text-sm">
              {!editing ? (
                <>
                  <InfoRow label="Phone"  value={profile?.phone} />
                  <InfoRow label="Gender" value={profile?.gender ? GENDER_OPTIONS.find(g => g.value === profile.gender)?.label : undefined} />
                  <InfoRow label="Address" value={
                    profile?.address?.line1
                      ? `${profile.address.line1}, ${profile.address.city}, ${profile.address.state} ${profile.address.pincode}`
                      : undefined
                  } />
                  <button onClick={() => setEditing(true)}
                    className="mt-3 w-full rounded-full border border-ink/15 py-2 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
                    Edit profile
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Field label="Full name" value={fullName} onChange={setFullName} />
                  <Field label="Phone" value={phone} onChange={setPhone} type="tel" />

                  <div>
                    <label className="block text-xs font-medium text-ink/60">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as Gender)}
                      className="mt-1 w-full rounded-lg border border-sand-dark px-3 py-2 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20">
                      <option value="">Select</option>
                      {GENDER_OPTIONS.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-sand-dark/40 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Address</p>
                    <div className="space-y-2">
                      <Field label="Address line 1" value={address.line1}
                        onChange={v => setAddress(a => ({ ...a, line1: v }))} />
                      <Field label="Address line 2" value={address.line2 ?? ""}
                        onChange={v => setAddress(a => ({ ...a, line2: v }))} />
                      <Field label="City" value={address.city}
                        onChange={v => setAddress(a => ({ ...a, city: v }))} />
                      <Field label="State" value={address.state}
                        onChange={v => setAddress(a => ({ ...a, state: v }))} />
                      <Field label="Pincode" value={address.pincode}
                        onChange={v => setAddress(a => ({ ...a, pincode: v }))} />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay-dark">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 rounded-full bg-clay py-2 text-sm font-semibold text-white hover:bg-clay-dark disabled:opacity-60">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditing(false); setError(null); }}
                      className="flex-1 rounded-full border border-ink/15 py-2 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {success && (
                <p className="text-center text-xs font-medium text-moss">✓ Profile saved</p>
              )}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-sand-dark/60 bg-white p-6">
            <h2 className="mb-4 font-display text-xl text-ink">Order history</h2>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-sm text-ink/60">No orders yet.</p>
                <Link href="/products"
                  className="mt-4 rounded-full bg-clay px-5 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map(order => (
                  <li key={order.id}>
                    <Link href={`/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sand-dark/60 px-4 py-3 transition-colors hover:border-clay">
                      <div>
                        <p className="font-mono text-xs text-ink/50">#{order.id.slice(0, 8)}</p>
                        <p className="mt-0.5 text-xs text-ink/50">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? "bg-sand text-ink/70"}`}>
                        {order.status}
                      </span>
                      <p className="font-semibold text-ink">{formatPrice(order.total)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ink/50">{label}</span>
      <span className="text-right text-ink">{value || <span className="text-ink/30">Not set</span>}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink/60">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-sand-dark px-3 py-2 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
