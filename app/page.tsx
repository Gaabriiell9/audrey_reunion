"use client";

import { useState, useRef } from "react";
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
type Etape = "nom" | "sondage" | "merci";

const OPTIONS: { value: Choix; label: string; Icon: typeof CheckIcon }[] = [
  { value: "oui", label: "Oui, je serai présent(e)", Icon: CheckIcon },
  { value: "non", label: "Non, je ne pourrai pas être présent(e)", Icon: CrossIcon },
  { value: "a_confirmer", label: "Je dois encore confirmer", Icon: QuestionIcon },
];

export default function Page() {
  const [etape, setEtape] = useState<Etape>("nom");
  const [visible, setVisible] = useState(true);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [choix, setChoix] = useState<Choix | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [dernier, setDernier] = useState<Choix | null>(null);

  const titreRef = useRef<HTMLHeadingElement>(null);

  function changerEtape(nouvelleEtape: Etape) {
    setVisible(false);
    setTimeout(() => {
      setEtape(nouvelleEtape);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        titreRef.current?.focus();
      }, 50);
    }, 150);
  }

  function continuer(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setErreur("Merci d'indiquer votre prénom et votre nom.");
      return;
    }
    setErreur("");
    changerEtape("sondage");
  }

  async function envoyer() {
    if (!choix) {
      setErreur("Merci de choisir une réponse.");
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
      changerEtape("merci");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue, réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  function modifierNom() {
    changerEtape("nom");
  }

  function recommencer() {
    setPrenom("");
    setNom("");
    setChoix(null);
    setDernier(null);
    setErreur("");
    changerEtape("nom");
  }

  return (
    <main>
      <div className="card">
        <div className="label-top">Réunion mariage</div>
        <h1 ref={titreRef} tabIndex={-1}>Réunion pour l'organisation du mariage</h1>

        <div className={`etape-content ${visible ? "visible" : ""}`}>
          {etape === "nom" && (
            <form onSubmit={continuer} className="etape-nom">
              <p className="text-secondary">Pour commencer, indiquez qui vous êtes.</p>
              <label htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoComplete="given-name"
                maxLength={80}
              />
              <label htmlFor="nom">Nom</label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoComplete="family-name"
                maxLength={80}
              />
              {erreur && <p className="error">{erreur}</p>}
              <button className="btn" type="submit">Continuer</button>
            </form>
          )}

          {etape === "sondage" && (
            <div>
              <p className="greeting">Bonjour {prenom} {nom}.</p>
              <p>La paix du Seigneur à tous.</p>
              <p>
                Roberto et moi souhaitons organiser une prochaine réunion afin d'échanger et de discuter ensemble de
                l'organisation de notre mariage.
              </p>

              <div className="info-block">
                <div className="info-row">
                  <PinIcon size={18} />
                  <div className="info-content">
                    <span className="info-label">Lieu</span>
                    <span className="info-value">Chez la sœur missionnaire Susy</span>
                  </div>
                </div>
                <div className="info-row">
                  <CalendarIcon size={18} />
                  <div className="info-content">
                    <span className="info-label">Jour</span>
                    <span className="info-value">Samedi 17/10</span>
                  </div>
                </div>
                <div className="info-row">
                  <ClockIcon size={18} />
                  <div className="info-content">
                    <span className="info-label">Heure</span>
                    <span className="info-value">17h00</span>
                  </div>
                </div>
              </div>

              <p>Merci de nous indiquer votre présence afin que nous puissions nous organiser au mieux.</p>
              <h2>Serez-vous disponibles samedi à 17h00 ?</h2>
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
                {envoi ? "Envoi..." : "Envoyer ma réponse"}
              </button>
              <button className="btn ghost" type="button" onClick={modifierNom} disabled={envoi}>
                Modifier mon nom
              </button>
            </div>
          )}

          {etape === "merci" && (
            <div className="thank-you-content">
              <div className="thank-you-icon">
                <div className="thank-you-circle">
                  <CheckCircleIcon size={36} />
                </div>
              </div>
              <h2>Merci {prenom} !</h2>
              <p>Votre réponse a bien été enregistrée.</p>
              {dernier === "a_confirmer" && (
                <p className="text-secondary">
                  Vous pourrez revenir sur ce lien quand vous serez fixé(e) et envoyer une nouvelle réponse.
                </p>
              )}
              <button className="btn ghost" type="button" onClick={recommencer}>Envoyer une autre réponse</button>
            </div>
          )}
        </div>

        <div className="footer-text">
          <p>Merci à tous pour votre disponibilité et votre aide.</p>
          <p>Que Dieu vous bénisse abondamment !</p>
        </div>
      </div>
    </main>
  );
}
