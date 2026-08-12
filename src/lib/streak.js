import { supabase } from './supabaseClient';

// Legge il profilo dell'utente, aggiorna la streak in base alla data di
// oggi rispetto all'ultima attività, e restituisce il numero aggiornato.
export async function aggiornaStreak(userId) {
  const oggi = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: profilo } = await supabase
    .from('profili')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profilo) {
    await supabase.from('profili').insert({
      user_id: userId,
      streak_count: 1,
      last_active_date: oggi,
    });
    return 1;
  }

  if (profilo.last_active_date === oggi) {
    return profilo.streak_count; // già aggiornato oggi, nessuna modifica
  }

  const ieri = new Date();
  ieri.setDate(ieri.getDate() - 1);
  const ieriStr = ieri.toISOString().slice(0, 10);

  const nuovoConteggio = profilo.last_active_date === ieriStr ? profilo.streak_count + 1 : 1;

  await supabase
    .from('profili')
    .update({ streak_count: nuovoConteggio, last_active_date: oggi })
    .eq('user_id', userId);

  return nuovoConteggio;
}
