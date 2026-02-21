import { supabase } from '../lib/supabase';

export async function signUp(parentEmail: string, password: string, termsAccepted: boolean) {
  if (!termsAccepted) {
    throw new Error('Terms must be accepted to sign up.');
  }
  const email = parentEmail.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error || !data.user) {
    throw error || new Error('Signup failed');
  }
  const user = data.user;
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: user.id,
      role: 'child',
      approved: false,
      parent_email: parentEmail,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ]);
  if (profileError) {
    throw profileError;
  }
  return user;
}

export async function signIn(parentEmail: string, password: string) {
  const email = parentEmail.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    throw error || new Error('Login failed');
  }
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}
