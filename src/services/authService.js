import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuthStore } from '../stores/authStore';

export async function signUp(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  useAuthStore.getState().setUser(data.user);
  useAuthStore.getState().setSession(data.session);
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    useAuthStore.getState().clear();
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  useAuthStore.getState().clear();
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateEmail(newEmail) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
}

export function initAuthListener() {
  if (!isSupabaseConfigured()) {
    useAuthStore.getState().setLoading(false);
    return () => {};
  }

  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const store = useAuthStore.getState();
        if (session) {
          store.setUser(session.user);
          store.setSession(session);
        } else {
          store.clear();
        }
        store.setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  } catch (e) {
    console.warn('Auth listener failed:', e);
    useAuthStore.getState().setLoading(false);
    return () => {};
  }
}
