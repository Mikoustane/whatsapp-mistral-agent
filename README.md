# Agent IA WhatsApp + Mistral

Agent qui repond automatiquement aux messages WhatsApp en utilisant l'IA Mistral.

Exemple : quelqu'un envoie « bonjour » → l'agent envoie le message a Mistral → Mistral repond « Salut ! Comment vas-tu ? » → l'agent renvoie la reponse sur WhatsApp.

## Comment ca marche

1. L'agent ouvre WhatsApp Web en arriere-plan (bibliotheque `whatsapp-web.js`).
2. Tu scannes un QR code une seule fois pour connecter ton WhatsApp.
3. Chaque message recu est envoye a l'API Mistral avec l'historique de la conversation.
4. La reponse de Mistral est renvoyee automatiquement a la personne.

## Installation

```bash
npm install
cp .env.example .env
```

## Configuration

Ouvre le fichier `.env` et mets ta cle API Mistral (gratuite sur https://console.mistral.ai) :

```
MISTRAL_API_KEY=ta_cle_api_mistral_ici
```

Tu peux aussi changer le modele (`mistral-small-latest`, `mistral-large-latest`...) et la personnalite de l'agent via `SYSTEM_PROMPT`.

## Lancement

```bash
npm start
```

Un QR code apparait dans le terminal : scanne-le avec WhatsApp (Parametres > Appareils connectes > Connecter un appareil). La session est sauvegardee : tu n'as plus besoin de scanner apres le premier lancement.

## Important

- Ce projet utilise WhatsApp Web de maniere non officielle : a utiliser pour un usage personnel, pas pour du spam.
- Ton ordinateur doit rester allume pour que l'agent reponde.
- Ne partage jamais ton fichier `.env` (il contient ta cle API).
