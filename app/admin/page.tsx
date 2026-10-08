import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken, isValidToken, passwordMatches } from "@/lib/auth";
import { supabaseAdmin, type Reponse } from "@/lib/supabase";
import { CheckIcon, CrossIcon, QuestionIcon } from "@/components/Icons";

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

const LABELS: Record<Reponse["reponse"], { text: string; Icon: typeof CheckIcon }> = {
  oui: { text: "Présent(e)", Icon: CheckIcon },
  non: { text: "Absent(e)", Icon: CrossIcon },
  a_confirmer: { text: "À confirmer", Icon: QuestionIcon },
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
          <div className="label-top">Administration</div>
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

  const derniereParPersonne = new Map<string, string>();
  for (const r of rows) {
    const key = `${norm(r.prenom)}|${norm(r.nom)}`;
    if (!derniereParPersonne.has(key)) derniereParPersonne.set(key, r.id);
  }
  const actuelles = rows.filter((r) => derniereParPersonne.get(`${norm(r.prenom)}|${norm(r.nom)}`) === r.id);
  const count = (v: Reponse["reponse"]) => actuelles.filter((r) => r.reponse === v).length;

  return (
    <main className="wide">
      <div className="topbar">
        <div>
          <div className="label-top">Administration</div>
          <h1>Résultats du sondage</h1>
        </div>
        <form action={logout}>
          <button className="btn ghost" type="submit">Déconnexion</button>
        </form>
      </div>
      <p className="text-secondary">Samedi 17/10 à 17h00, chez la sœur missionnaire Susy.</p>

      {error && <p className="error">Erreur de lecture de la base de données.</p>}

      <div className="stats">
        <div className="stat oui">
          <b>{count("oui")}</b>
          <span>Présents</span>
        </div>
        <div className="stat non">
          <b>{count("non")}</b>
          <span>Absents</span>
        </div>
        <div className="stat a_confirmer">
          <b>{count("a_confirmer")}</b>
          <span>À confirmer</span>
        </div>
      </div>

      <h2>Toutes les réponses ({rows.length})</h2>

      <div className="response-list">
        {rows.length === 0 && (
          <p className="text-secondary">Aucune réponse pour le moment.</p>
        )}
        {rows.map((r) => {
          const ancienne = derniereParPersonne.get(`${norm(r.prenom)}|${norm(r.nom)}`) !== r.id;
          const { text, Icon } = LABELS[r.reponse];
          return (
            <div key={r.id} className={`response-card${ancienne ? " ancienne" : ""}`}>
              <div className="response-card-header">
                <span className="response-card-name">{r.prenom} {r.nom}</span>
                <span className={`tag ${r.reponse}`}>
                  <Icon size={14} />
                  {text}
                </span>
              </div>
              <div className="response-card-date">
                {fmt(r.created_at)}
                {ancienne && <span className="tag old">ancienne</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Prénom</th><th>Nom</th><th>Réponse</th><th>Date</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="text-secondary">Aucune réponse pour le moment.</td></tr>
            )}
            {rows.map((r) => {
              const ancienne = derniereParPersonne.get(`${norm(r.prenom)}|${norm(r.nom)}`) !== r.id;
              const { text, Icon } = LABELS[r.reponse];
              return (
                <tr key={r.id} style={ancienne ? { opacity: 0.55 } : undefined}>
                  <td>{r.prenom}</td>
                  <td>{r.nom}</td>
                  <td>
                    <span className={`tag ${r.reponse}`}>
                      <Icon size={14} />
                      {text}
                    </span>
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
