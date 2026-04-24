"use client";

import { useState } from "react";
import { AdminUser, AdminRole } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const ROLE_INFO: Record<AdminRole, { label: string; desc: string; color: string; permissions: string[] }> = {
  super_admin: {
    label: "Super Admin",
    desc: "Full system access",
    color: "bg-red-100 text-red-700",
    permissions: [
      "Create / edit / delete questions",
      "Publish and archive questions",
      "Edit logic rules",
      "View analytics",
      "Export data",
      "Manage users and roles",
      "View all responses",
    ],
  },
  strategy_editor: {
    label: "Strategy Editor",
    desc: "Edit questions and view dashboard",
    color: "bg-blue-100 text-blue-700",
    permissions: [
      "Create / edit questions (draft only)",
      "Submit questions for review",
      "Edit logic rules",
      "View analytics",
      "Export data",
      "Cannot publish or delete",
    ],
  },
  viewer: {
    label: "Viewer",
    desc: "View analytics only",
    color: "bg-slate-100 text-slate-600",
    permissions: [
      "View analytics dashboard",
      "View question list (read-only)",
      "Export aggregated reports",
      "Cannot edit anything",
    ],
  },
};

const INITIAL_USERS: AdminUser[] = [
  { id: "u1", name: "Abdullah Al-Otaibi", email: "a.otaibi@tfa.sa", role: "super_admin", createdAt: "2025-01-15T00:00:00Z" },
  { id: "u2", name: "Noura Al-Rashid", email: "n.rashid@tfa.sa", role: "strategy_editor", createdAt: "2025-02-01T00:00:00Z" },
  { id: "u3", name: "Khalid Al-Ahmadi", email: "k.ahmadi@tfa.sa", role: "strategy_editor", createdAt: "2025-02-10T00:00:00Z" },
  { id: "u4", name: "Sara Al-Qahtani", email: "s.qahtani@tfa.sa", role: "viewer", createdAt: "2025-03-01T00:00:00Z" },
];

function UserRow({
  user,
  onRoleChange,
  onDelete,
}: {
  user: AdminUser;
  onRoleChange: (id: string, role: AdminRole) => void;
  onDelete: (id: string) => void;
}) {
  const info = ROLE_INFO[user.role];
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)", color: "white" }}>
        {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-400">{user.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <select
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700"
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value as AdminRole)}
        >
          {(Object.keys(ROLE_INFO) as AdminRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_INFO[r].label}</option>
          ))}
        </select>
        <span className={`badge text-xs ${info.color}`}>{info.label}</span>
        <button
          onClick={() => onDelete(user.id)}
          className="text-slate-300 hover:text-red-400 text-base"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("viewer");
  const [showForm, setShowForm] = useState(false);

  const addUser = () => {
    if (!newName || !newEmail) return;
    setUsers([
      ...users,
      { id: uuidv4(), name: newName, email: newEmail, role: newRole, createdAt: new Date().toISOString() },
    ]);
    setNewName("");
    setNewEmail("");
    setNewRole("viewer");
    setShowForm(false);
  };

  const changeRole = (id: string, role: AdminRole) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Roles</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} admin users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
        >
          + Invite User
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-700">Invite New User</h3>
          <div className="grid grid-cols-3 gap-4">
            <input
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              placeholder="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <select
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
            >
              {(Object.keys(ROLE_INFO) as AdminRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_INFO[r].label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addUser} className="px-4 py-2 text-sm rounded-lg text-white font-semibold" style={{ background: "#1a3a6b" }}>
              Send Invitation
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="space-y-3">
        {users.map((u) => (
          <UserRow key={u.id} user={u} onRoleChange={changeRole} onDelete={deleteUser} />
        ))}
      </div>

      {/* Role Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-5">Role Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase pr-6">Permission</th>
                {(Object.entries(ROLE_INFO) as [AdminRole, typeof ROLE_INFO[AdminRole]][]).map(([role, info]) => (
                  <th key={role} className="pb-3 text-center">
                    <span className={`badge ${info.color}`}>{info.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { perm: "Create / edit questions", super: true, editor: true, viewer: false },
                { perm: "Publish questions", super: true, editor: false, viewer: false },
                { perm: "Delete questions", super: true, editor: false, viewer: false },
                { perm: "Edit logic rules", super: true, editor: true, viewer: false },
                { perm: "View analytics", super: true, editor: true, viewer: true },
                { perm: "Export data", super: true, editor: true, viewer: true },
                { perm: "Manage users", super: true, editor: false, viewer: false },
                { perm: "View all responses", super: true, editor: false, viewer: false },
              ].map((row) => (
                <tr key={row.perm}>
                  <td className="py-2.5 text-slate-700 pr-6">{row.perm}</td>
                  <td className="py-2.5 text-center">{row.super ? "✓" : <span className="text-slate-200">—</span>}</td>
                  <td className="py-2.5 text-center">{row.editor ? "✓" : <span className="text-slate-200">—</span>}</td>
                  <td className="py-2.5 text-center">{row.viewer ? "✓" : <span className="text-slate-200">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
