import { supabase, isSupabaseConfigured, SupabaseRegisteredChildRow } from '../lib/supabase';
import { RegisteredChild, SorteioWinner, ReplacementLog } from '../types';

export const SUPABASE_TABLE_CHILDREN = 'registered_children';
export const SUPABASE_TABLE_SORTEIO = 'sorteio_state';

/**
 * Maps a database row to the application's RegisteredChild model
 */
export function mapRowToChild(row: SupabaseRegisteredChildRow): RegisteredChild {
  return {
    id: row.id,
    sequenceNumber: row.sequence_number,
    credentialCode: row.credential_code,
    childName: row.child_name,
    age: row.age,
    birthDate: row.birth_date || undefined,
    guardianName: row.guardian_name || undefined,
    cityNeighborhood: row.city_neighborhood || undefined,
    whatsappPhone: row.whatsapp_phone || undefined,
    referralSource: row.referral_source || undefined,
    registeredAt: row.registered_at,
  };
}

/**
 * Maps a RegisteredChild model to the database row
 */
export function mapChildToRow(child: RegisteredChild): SupabaseRegisteredChildRow {
  return {
    id: child.id,
    sequence_number: child.sequenceNumber,
    credential_code: child.credentialCode,
    child_name: child.childName,
    age: child.age,
    birth_date: child.birthDate || null,
    guardian_name: child.guardianName || null,
    city_neighborhood: child.cityNeighborhood || null,
    whatsapp_phone: child.whatsappPhone || null,
    referral_source: child.referralSource || null,
    registered_at: child.registeredAt,
  };
}

/**
 * Fetch all registered children from Supabase
 */
export async function fetchSupabaseChildren(): Promise<RegisteredChild[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_CHILDREN)
    .select('*')
    .order('sequence_number', { ascending: true });

  if (error) {
    console.error('Error fetching children from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapRowToChild);
}

/**
 * Inserts a child record into Supabase
 */
export async function insertSupabaseChild(child: RegisteredChild): Promise<RegisteredChild> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const row = mapChildToRow(child);
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_CHILDREN)
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Error inserting child into Supabase:', error);
    throw error;
  }

  return mapRowToChild(data);
}

/**
 * Subscribes in real-time to registered children changes in Supabase
 */
export function subscribeToSupabaseChildren(
  onUpdate: (children: RegisteredChild[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  // Initial fetch
  fetchSupabaseChildren()
    .then((list) => onUpdate(list))
    .catch((err) => {
      console.warn('Initial Supabase fetch failed:', err);
      if (onError) onError(err);
    });

  // Real-time channel subscription
  const channel = supabase
    .channel('public:registered_children_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SUPABASE_TABLE_CHILDREN,
      },
      async () => {
        try {
          const freshList = await fetchSupabaseChildren();
          onUpdate(freshList);
        } catch (err: any) {
          console.error('Error refreshing children after Supabase realtime change:', err);
          if (onError) onError(err);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Channel connected
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetches the sorteio state from Supabase
 */
export async function fetchSupabaseSorteioState(): Promise<{
  winners: SorteioWinner[];
  absentIds: string[];
  replacementLogs: ReplacementLog[];
} | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_SORTEIO)
    .select('*')
    .eq('id', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching sorteio state from Supabase:', error);
    return null;
  }

  if (!data) return null;

  return {
    winners: data.winners || [],
    absentIds: data.absent_ids || [],
    replacementLogs: data.replacement_logs || [],
  };
}

/**
 * Upserts the sorteio state to Supabase
 */
export async function saveSupabaseSorteioState(
  winners: SorteioWinner[],
  absentIds: string[],
  replacementLogs: ReplacementLog[]
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from(SUPABASE_TABLE_SORTEIO)
    .upsert({
      id: 'active',
      winners,
      absent_ids: absentIds,
      replacement_logs: replacementLogs,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving sorteio state to Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Subscribes to Sorteio state changes in real-time from Supabase
 */
export function subscribeToSupabaseSorteio(
  onUpdate: (data: {
    winners: SorteioWinner[];
    absentIds: string[];
    replacementLogs: ReplacementLog[];
  } | null) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  fetchSupabaseSorteioState()
    .then((state) => {
      if (state) onUpdate(state);
    })
    .catch((err) => {
      if (onError) onError(err);
    });

  const channel = supabase
    .channel('public:sorteio_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SUPABASE_TABLE_SORTEIO,
      },
      async (payload) => {
        try {
          if (payload.new && typeof payload.new === 'object') {
            const row: any = payload.new;
            onUpdate({
              winners: row.winners || [],
              absentIds: row.absent_ids || [],
              replacementLogs: row.replacement_logs || [],
            });
          } else {
            const fresh = await fetchSupabaseSorteioState();
            onUpdate(fresh);
          }
        } catch (err: any) {
          if (onError) onError(err);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Clears all registered children and resets sorteio state in Supabase
 */
export async function clearSupabaseData(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase não está configurado.' };
  }

  try {
    const { error: delError } = await supabase
      .from(SUPABASE_TABLE_CHILDREN)
      .delete()
      .neq('id', 'non_existent_id'); // Delete all

    if (delError) throw delError;

    const { error: resetError } = await supabase
      .from(SUPABASE_TABLE_SORTEIO)
      .upsert({
        id: 'active',
        winners: [],
        absent_ids: [],
        replacement_logs: [],
        updated_at: new Date().toISOString(),
      });

    if (resetError) throw resetError;

    return { success: true, message: 'Dados zerados com sucesso no Supabase!' };
  } catch (err: any) {
    console.error('Error clearing Supabase data:', err);
    return { success: false, message: err.message || 'Erro ao zerar dados no Supabase.' };
  }
}
