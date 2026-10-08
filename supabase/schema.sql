-- Table des reponses du sondage.
-- Chaque envoi cree une NOUVELLE ligne (jamais de mise a jour) :
-- si quelqu'un revient apres "Je dois encore confirmer", une autre ligne
-- avec le meme nom et prenom apparait dans la base.
create table if not exists public.reponses (
  id uuid primary key default gen_random_uuid(),
  prenom text not null check (char_length(prenom) between 1 and 80),
  nom text not null check (char_length(nom) between 1 and 80),
  reponse text not null check (reponse in ('oui', 'non', 'a_confirmer')),
  created_at timestamptz not null default now()
);

create index if not exists reponses_created_at_idx on public.reponses (created_at desc);

-- RLS active sans policy : seul le serveur (cle service_role) peut lire/ecrire.
alter table public.reponses enable row level security;
