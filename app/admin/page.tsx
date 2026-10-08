import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken, isValidToken, passwordMatches } from "@/lib/auth";
import { supabaseAdmin, type Reponse } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Sondage réunion", robots: { index: false, follow: false } };

async function login(formData: FormData) {
  "use server";
  const pwd = String(formData.get("password") || "");
  if (!passwordMatches(pwd)) redirect("/admin?erreur=1");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

async function logout() {
  "use server";
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}

const LABELS: Record<Reponse["reponse"], string> = {
  oui: "✅ Présent(e)",
  non: "❌ Absent(e)",
  a_confirmer: "🤔 À confirmer",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const jar = await cookies();
  const authed = isValidToken(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    const sp = await searchParams;
    return (
      <main>
        <div className="card">
          <h1>Espace admin</h1>
          <form action={login}>
            <label htmlFor="password">Mot de passe</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
            {sp.erreur && <p className="error">Mot de passe incorrect.</p>}
            <button className="btn" type="submit">Entrer</button>
          </form>
        </div>
      </main>
    );
  }

  const { data, error } = await supabaseAdmin()
    .from("reponses")
    .select("id, prenom, nom, reponse, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Reponse[];

  // Derniere reponse de chaque personne (meme nom et prenom, sans accents ni casse).
  const derniereParPersonne = new Map<string, string>();
  for (const r of rows) {
    const key = `${norm(r.prenom)}|${norm(r.nom)}`;
    if (!derniereParPersonne.has(key)) derniereParPersonne.set(key, r.id); // rows deja tries du plus recent au plus ancien
  }
  const actuelles = rows.filter((r) => derniereParPersonne.get(`${norm(r.prenom)}|${norm(r.nom)}`) === r.id);
  const count = (v: Reponse["reponse"]) => actuelles.filter((r) => r.reponse === v).length;

  return (
    <main className="wide">
      <div className="topbar">
        <h1>Résultats du sondage</h1>
        <form action={logout}>
          <button className="btn ghost" type="submit">Déconnexion</button>
        </form>
      </div>
      <p className="muted">Samedi 17/10 à 17h00, chez la sœur missionnaire Susy. Les totaux comptent la dernière réponse de chaque personne.</p>

      {error && <p className="error">Erreur de lecture de la base de données.</p>}

      <div className="stats">
        <div className="stat oui"><b>{count("oui")}</b>Présents</div>
        <div className="stat non"><b>{count("non")}</b>Absents</div>
        <div className="stat a_confirmer"><b>{count("a_confirmer")}</b>À confirmer</div>
      </div>

      <h2>Toutes les réponses ({rows.length})</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Prénom</th><th>Nom</th><th>Réponse</th><th>Date</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="muted">Aucune réponse pour le moment.</td></tr>
            )}
            {rows.map((r) => {
              const ancienne = derniereParPersonne.get(`${norm(r.prenom)}|${norm(r.nom)}`) !== r.id;
              return (
                <tr key={r.id} style={ancienne ? { opacity: 0.6 } : undefined}>
                  <td>{r.prenom}</td>
                  <td>{r.nom}</td>
                  <td>
                    <span className={`tag ${r.reponse}`}>{LABELS[r.reponse]}</span>
                    {ancienne && <span className="tag old">ancienne</span>}
                  </td>
                  <td>{fmt(r.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
