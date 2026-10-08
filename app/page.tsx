"use client";

import { useState } from "react";
import {
  RingsIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionCircleIcon,
  DecorativeDivider,
} from "@/components/Icons";

type Choix = "oui" | "non" | "a_confirmer";

const OPTIONS: { value: Choix; label: string; Icon: typeof CheckCircleIcon }[] = [
  { value: "oui", label: "Oui, je serai present(e)", Icon: CheckCircleIcon },
  { value: "non", label: "Non, je ne pourrai pas etre present(e)", Icon: XCircleIcon },
  { value: "a_confirmer", label: "Je dois encore confirmer", Icon: QuestionCircleIcon },
];

export default function Page() {
  const [etape, setEtape] = useState<"nom" | "sondage" | "merci">("nom");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [choix, setChoix] = useState<Choix | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [dernier, setDernier] = useState<Choix | null>(null);

  function continuer(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setErreur("Merci d'indiquer votre prenom et votre nom.");
      return;
    }
    setErreur("");
    setEtape("sondage");
  }

  async function envoyer() {
    if (!choix) {
      setErreur("Merci de choisir une reponse.");
      return;
    }
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/reponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, reponse: choix }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      setDernier(choix);
      setEtape("merci");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue, reessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  function recommencer() {
    setPrenom("");
    setNom("");
    setChoix(null);
    setDernier(null);
    setErreur("");
    setEtape("nom");
  }

  return (
    <main>
      <div className="card">
        <h1>
          <RingsIcon size={28} />
          Sondage : reunion pour l'organisation du mariage
        </h1>
        <p>La paix du Seigneur a tous.</p>
        <p>
          Roberto et moi souhaitons organiser une prochaine reunion afin d'echanger et de discuter ensemble de
          l'organisation de notre mariage.
        </p>

        <div className="details">
          <p><MapPinIcon size={18} /> <b>Lieu :</b> chez la soeur missionnaire Susy</p>
          <p><CalendarIcon size={18} /> <b>Jour :</b> samedi 17/10</p>
          <p><ClockIcon size={18} /> <b>Heure :</b> 17h00</p>
        </div>

        {etape === "nom" && (
          <form onSubmit={continuer}>
            <p className="muted">Pour commencer, indiquez qui vous etes.</p>
            <label htmlFor="prenom">Prenom</label>
            <input id="prenom" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" maxLength={80} />
            <label htmlFor="nom">Nom</label>
            <input id="nom" type="text" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" maxLength={80} />
            {erreur && <p className="error">{erreur}</p>}
            <button className="btn" type="submit">Continuer</button>
          </form>
        )}

        {etape === "sondage" && (
          <div>
            <p className="muted">Bonjour {prenom} {nom}.</p>
            <p>Merci de nous indiquer votre presence afin que nous puissions nous organiser au mieux.</p>
            <h2>Serez-vous disponibles samedi a 17h00 ?</h2>
            <div className="choices">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`choice ${o.value}`}
                  aria-pressed={choix === o.value}
                  onClick={() => setChoix(o.value)}
                >
                  <o.Icon size={22} />
                  {o.label}
                </button>
              ))}
            </div>
            {erreur && <p className="error">{erreur}</p>}
            <button className="btn" type="button" onClick={envoyer} disabled={envoi}>
              {envoi ? "Envoi..." : "Envoyer ma reponse"}
            </button>
            <button className="btn ghost" type="button" onClick={() => setEtape("nom")} disabled={envoi}>
              Modifier mon nom
            </button>
          </div>
        )}

        {etape === "merci" && (
          <div>
            <h2>Merci {prenom} !</h2>
            <p>Votre reponse a bien ete enregistree.</p>
            {dernier === "a_confirmer" && (
              <p className="muted">
                Vous pourrez revenir sur ce lien quand vous serez fixe(e) et envoyer une nouvelle reponse.
              </p>
            )}
            <button className="btn ghost" type="button" onClick={recommencer}>Envoyer une autre reponse</button>
          </div>
        )}

        <div className="divider">
          <DecorativeDivider size={100} />
        </div>
        <p className="muted" style={{ textAlign: "center" }}>
          Merci a tous pour votre disponibilite et votre aide.<br />
          Que Dieu vous benisse abondamment !
        </p>
      </div>
    </main>
  );
}
