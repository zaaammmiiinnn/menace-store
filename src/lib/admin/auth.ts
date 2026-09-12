import { currentUser } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { getLocalStore } from '@/lib/db';

export type AdminRole = 'customer' | 'staff' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

/**
 * Returns the current authenticated user along with their resolved role.
 * Role hierarchy: Clerk publicMetadata.role -> ADMIN_EMAILS env allowlist -> 'customer'
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // Local development preview bypass if explicitly enabled
  if (process.env.ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV === 'development') {
    return {
      id: 'admin_dev_local',
      email: 'zamin@menace.store',
      name: 'Zamin Askari (Admin)',
      role: 'admin',
    };
  }

  try {
    const user = await currentUser();
    if (!user) return null;

    const primaryEmail = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
    const adminEmailsEnv = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    let role: AdminRole = 'customer';

    // 1. Check Clerk publicMetadata
    const metadataRole = user.publicMetadata?.role as string | undefined;
    if (metadataRole === 'admin' || metadataRole === 'staff') {
      role = metadataRole as AdminRole;
    }

    // 2. Check ADMIN_EMAILS bootstrap allowlist
    if (adminEmailsEnv.includes(primaryEmail)) {
      role = 'admin';
    }

    return {
      id: user.id,
      email: primaryEmail,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || primaryEmail.split('@')[0] || 'Admin',
      role,
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    return null;
  }
}

/**
 * Enforces staff or admin access. If unauthenticated or customer, returns 404 (stealth) or redirects.
 */
export async function requireStaff(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    redirect('/login?redirect=/admin');
  }

  if (adminUser.role !== 'staff' && adminUser.role !== 'admin') {
    // Hide existence of admin from non-staff/customers
    notFound();
  }

  return adminUser;
}

/**
 * Enforces strict admin access (full mutation & settings rights).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    redirect('/login?redirect=/admin');
  }

  if (adminUser.role !== 'admin') {
    // 404 stealth so unauthorized users cannot enumerate admin capabilities
    notFound();
  }

  return adminUser;
}

/**
 * Logs an administrative mutation to the audit log table
 */
export async function logAuditAction(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}): Promise<void> {
  try {
    const user = await getAdminUser();
    const entry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.id || 'system',
      userEmail: user?.email || 'system@menace.store',
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      details: params.details || null,
      createdAt: Date.now(),
    };

    const store = getLocalStore();
    const auditTable = store.getTable('audit_log');
    auditTable.unshift({
      id: entry.id,
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      details: entry.details,
      created_at: entry.createdAt,
    });
  } catch (err) {
    console.error('Failed to write to audit log:', err);
  }
}
