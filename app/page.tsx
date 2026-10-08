"use client";

import { useState } from "react";
import {
  PinIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  CrossIcon,
  QuestionIcon,
  CheckCircleIcon,
} from "@/components/Icons";

type Choix = "oui" | "non" | "a_confirmer";

const OPTIONS: { value: Choix; label: string; Icon: typeof CheckIcon }[] = [
  { value: "oui", label: "Oui, je serai present(e)", Icon: CheckIcon },
  { value: "non", label: "Non, je ne pourrai pas etre present(e)", Icon: CrossIcon },
  { value: "a_confirmer", label: "Je dois encore confirmer", Icon: QuestionIcon },
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
        <div className="label-top">Reunion mariage</div>
        <h1>Reunion pour l'organisation du mariage</h1>
        <p>La paix du Seigneur a tous.</p>
        <p>
          Roberto et moi souhaitons organiser une prochaine reunion afin d'echanger et de discuter ensemble de
          l'organisation de notre mariage.
        </p>

        <div className="info-block">
          <div className="info-row">
            <PinIcon size={18} />
            <span className="info-label">Lieu</span>
            <span className="info-value">Chez la soeur missionnaire Susy</span>
          </div>
          <div className="info-row">
            <CalendarIcon size={18} />
            <span className="info-label">Jour</span>
            <span className="info-value">Samedi 17/10</span>
          </div>
          <div className="info-row">
            <ClockIcon size={18} />
            <span className="info-label">Heure</span>
            <span className="info-value">17h00</span>
          </div>
        </div>

        {etape === "nom" && (
          <form onSubmit={continuer}>
            <p className="text-secondary">Pour commencer, indiquez qui vous etes.</p>
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
            <p className="text-secondary">Bonjour {prenom} {nom}.</p>
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
                  <o.Icon size={20} />
                  <span className="choice-text">{o.label}</span>
                  <span className="choice-radio" />
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
            <div className="thank-you-icon">
              <div className="thank-you-circle">
                <CheckCircleIcon size={36} />
              </div>
            </div>
            <h2 style={{ textAlign: "center", marginTop: 0 }}>Merci {prenom} !</h2>
            <p style={{ textAlign: "center" }}>Votre reponse a bien ete enregistree.</p>
            {dernier === "a_confirmer" && (
              <p className="text-secondary" style={{ textAlign: "center" }}>
                Vous pourrez revenir sur ce lien quand vous serez fixe(e) et envoyer une nouvelle reponse.
              </p>
            )}
            <button className="btn ghost" type="button" onClick={recommencer}>Envoyer une autre reponse</button>
          </div>
        )}

        <div className="footer-text">
          <p>Merci a tous pour votre disponibilite et votre aide.</p>
          <p>Que Dieu vous benisse abondamment !</p>
        </div>
      </div>
    </main>
  );
}
