/**
 * Mini-store client EN MÉMOIRE pour la démonstration : les actions (lu/non lu,
 * demandes de contact, signalements) se reflètent entre les pages, mais rien
 * n'est enregistré — tout est réinitialisé au rechargement.
 * À remplacer par des mutations API (POST/PATCH /api/v1/...) au backend.
 */
import { useSyncExternalStore } from "react";
import { contactRequests, notifications, reports } from "@/data/mock-espaces";
import type { AppNotification, ContactRequest, Report } from "@/types";

interface State {
  notifications: AppNotification[];
  contacts: ContactRequest[];
  reports: Report[];
}

let state: State = {
  notifications: [...notifications],
  contacts: [...contactRequests],
  reports: [...reports],
};
const listeners = new Set<() => void>();
const set = (fn: (s: State) => State) => {
  state = fn(state);
  listeners.forEach((l) => l());
};

export function useMockStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
    () => select(state),
  );
}

const today = () => new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const uid = () => Math.random().toString(36).slice(2, 9);

export const actions = {
  marquerLue: (id: string, lue = true) =>
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, lue } : n)) })),
  toutMarquerLu: (espace: string) =>
    set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.espace === espace ? { ...n, lue: true } : n)) })),
  envoyerContact: (c: Omit<ContactRequest, "id" | "date" | "statut">) =>
    set((s) => ({
      ...s,
      contacts: [{ ...c, id: uid(), date: today(), statut: "attente" }, ...s.contacts],
      notifications: [
        { id: uid(), espace: "equipe", titre: "Nouvelle demande de contact", description: `${c.recruteur} souhaite échanger au sujet de ${c.joueur}.`, date: today(), lue: false },
        ...s.notifications,
      ],
    })),
  statutContact: (id: string, statut: ContactRequest["statut"]) =>
    set((s) => {
      const c = s.contacts.find((x) => x.id === id);
      const notif: AppNotification[] =
        c && (statut === "acceptee" || statut === "refusee")
          ? [{ id: uid(), espace: "recruteur", titre: statut === "acceptee" ? "Demande acceptée" : "Demande refusée", description: `${c.equipe} a ${statut === "acceptee" ? "accepté" : "refusé"} votre demande au sujet de ${c.joueur}.`, date: today(), lue: false }]
          : [];
      return { ...s, contacts: s.contacts.map((x) => (x.id === id ? { ...x, statut } : x)), notifications: [...notif, ...s.notifications] };
    }),
  signaler: (r: Omit<Report, "id" | "date" | "statut">) =>
    set((s) => ({ ...s, reports: [{ ...r, id: uid(), date: today(), statut: "nouveau" }, ...s.reports] })),
  statutSignalement: (id: string, statut: Report["statut"]) =>
    set((s) => ({ ...s, reports: s.reports.map((x) => (x.id === id ? { ...x, statut } : x)) })),
};
