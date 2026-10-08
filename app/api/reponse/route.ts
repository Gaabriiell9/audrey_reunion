import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CHOIX = ["oui", "non", "a_confirmer"] as const;

export async function POST(req: Request) {
  let body: { prenom?: unknown; nom?: unknown; reponse?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  const prenom = typeof body.prenom === "string" ? body.prenom.trim().replace(/\s+/g, " ") : "";
  const nom = typeof body.nom === "string" ? body.nom.trim().replace(/\s+/g, " ") : "";
  const reponse = body.reponse;

  if (!prenom || !nom || prenom.length > 80 || nom.length > 80) {
    return NextResponse.json({ error: "Nom et prénom requis" }, { status: 400 });
  }
  if (typeof reponse !== "string" || !(CHOIX as readonly string[]).includes(reponse)) {
    return NextResponse.json({ error: "Réponse invalide" }, { status: 400 });
  }

  // Toujours une insertion : un retour de la meme personne cree une nouvelle ligne.
  const { error } = await supabaseAdmin().from("reponses").insert({ prenom, nom, reponse });
  if (error) {
    return NextResponse.json({ error: "Erreur d'enregistrement" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
