import { createClient } from "@supabase/supabase-js";

// Client serveur uniquement (cle service_role). Ne jamais importer dans un composant client.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Reponse = {
  id: string;
  prenom: string;
  nom: string;
  reponse: "oui" | "non" | "a_confirmer";
  created_at: string;
};
