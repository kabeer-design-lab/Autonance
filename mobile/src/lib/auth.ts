import { supabase } from './supabase';

export interface SessionInfo {
  userId: string;
  workspaceId: string;
}

/**
 * Get or create the user's session + workspace.
 *
 * - Signs in anonymously on first launch (creates a real auth.users row).
 *   The session is persisted by AsyncStorage so subsequent launches reuse it.
 * - Looks for a workspace owned by that user; if none exists, creates one.
 *
 * Returns the user_id + workspace_id the app uses for every read/write.
 */
export async function ensureSession(): Promise<SessionInfo> {
  // 1. Make sure we have an auth user
  const { data: existing } = await supabase.auth.getUser();
  let user = existing.user;

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Sign-in failed: ${error.message}`);
    user = data.user;
    if (!user) throw new Error('Sign-in returned no user');
  }

  // 2. Find this user's workspace, or create one
  const { data: ws, error: wsErr } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();
  if (wsErr) throw new Error(`Workspace lookup failed: ${wsErr.message}`);

  let workspaceId = ws?.id as string | undefined;
  if (!workspaceId) {
    const { data: created, error: createErr } = await supabase
      .from('workspaces')
      .insert({ owner_id: user.id, name: 'Personal', type: 'personal', base_currency: 'INR' })
      .select('id')
      .single();
    if (createErr) throw new Error(`Workspace create failed: ${createErr.message}`);
    workspaceId = created.id;
  }

  return { userId: user.id, workspaceId: workspaceId! };
}

/**
 * Link a WhatsApp phone number to this user's workspace.
 * The number must be in E.164 format (e.g. "+919876543210"); the backend looks
 * up by exact match when WhatsApp messages arrive.
 */
export async function linkWhatsAppPhone(
  session: SessionInfo,
  phone: string,
): Promise<void> {
  const normalized = phone.replace(/\s+/g, '');
  const { error } = await supabase
    .from('whatsapp_links')
    .upsert(
      {
        user_id: session.userId,
        workspace_id: session.workspaceId,
        phone: normalized,
      },
      { onConflict: 'phone' },
    );
  if (error) throw new Error(`Link failed: ${error.message}`);
}

/** Returns the linked phone if any. */
export async function getLinkedPhone(session: SessionInfo): Promise<string | null> {
  const { data, error } = await supabase
    .from('whatsapp_links')
    .select('phone')
    .eq('user_id', session.userId)
    .maybeSingle();
  if (error) return null;
  return data?.phone ?? null;
}
