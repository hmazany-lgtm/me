"use client";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button, Restricted } from "@/components/ui";
import { USERS } from "@/data/seed";
import { dateTime, titleCase } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can, ROLES, ALL_PERMISSIONS, ALL_ROLES } from "@/lib/permissions";
import { Icon } from "@/components/Icon";

export default function UsersPage() {
  const { user } = useSession();

  if (!can(user.roleKey, "manage_users")) {
    return (
      <div>
        <PageHeader title="Users & Roles" subtitle="Identity, access, and the role-permission matrix." />
        <Restricted message="Managing users and roles requires the Manage Users permission, held only by the System Administrator role." />
      </div>
    );
  }

  const activeUsers = USERS.filter((u) => u.status === "active").length;
  const mfaUsers = USERS.filter((u) => u.mfaEnabled).length;

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Provision identities, assign roles, and review the granular role-permission matrix."
        actions={
          <>
            <Button variant="secondary"><Icon name="shield" className="w-4 h-4" />Manage roles</Button>
            <Button variant="primary"><Icon name="users" className="w-4 h-4" />Add user</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Users" value={USERS.length} tone="navy" />
        <Kpi label="Active" value={activeUsers} tone="green" />
        <Kpi label="MFA Enabled" value={mfaUsers} hint={`of ${USERS.length}`} tone="teal" />
        <Kpi label="Roles" value={ALL_ROLES.length} tone="gold" />
      </div>

      <InfoBanner tone="teal">
        <span className="font-medium">Segregation of duties.</span> Roles are designed so no single user can author, approve, and release the same exam content. The System Administrator manages access but holds no exam-content authority beyond configuration.
      </InfoBanner>

      <Card className="mt-5">
        <CardHeader title="Users" subtitle="Accounts, roles, and authentication posture" />
        <Table>
          <thead>
            <tr>
              <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Department</Th><Th>Status</Th><Th>Last login</Th><Th>MFA</Th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="hover:bg-navy-50/60">
                <Td className="font-medium text-navy-800">{u.fullName}</Td>
                <Td className="text-navy-600">{u.email}</Td>
                <Td>{ROLES[u.roleKey].name}</Td>
                <Td className="text-navy-600">{u.department}</Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td className="text-navy-600 whitespace-nowrap">{dateTime(u.lastLoginAt)}</Td>
                <Td>
                  {u.mfaEnabled
                    ? <Badge tone="green"><Icon name="check" className="w-3.5 h-3.5" /> On</Badge>
                    : <Badge tone="red"><Icon name="x" className="w-3.5 h-3.5" /> Off</Badge>}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Roles & permissions matrix" subtitle="Granular grants per role — the single source of truth for RBAC" />
        <Table>
          <thead>
            <tr>
              <Th className="sticky left-0 bg-white z-10">Permission</Th>
              {ALL_ROLES.map((r) => (
                <Th key={r.key} className="text-center whitespace-nowrap">{r.name}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_PERMISSIONS.map((perm) => (
              <tr key={perm.key} className="hover:bg-navy-50/60">
                <Td className="sticky left-0 bg-white font-medium text-navy-800 whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    {perm.name}
                    {perm.sensitivity === "high" && <Badge tone="red">high</Badge>}
                  </span>
                </Td>
                {ALL_ROLES.map((r) => (
                  <Td key={r.key} className="text-center">
                    {can(r.key, perm.key)
                      ? <Icon name="check" className="w-4 h-4 text-teal-600 inline-block" />
                      : <span className="text-navy-200">·</span>}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">A check marks a granted permission. Grants may be further scoped (full / masked / assigned / self) by the RBAC engine.</div>
      </Card>
    </div>
  );
}
