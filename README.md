# Join – Kanban Project Management Tool

Join ist ein web-basiertes Kanban-Tool mit KI-gestütztem Issue Collector, entwickelt als Projekt an der Developer Akademie.

## Features

- User Registration, Login & Guest-Zugang
- Dashboard mit Task-Übersicht und Deadlines
- Kanban-Board mit Drag & Drop
- Tasks mit Prioritäten, Kategorien & Subtasks
- Kontaktverwaltung
- **KI-basierter Issue Collector via E-Mail (n8n)**
- **Stakeholder Landing Page**
- Responsive Design (Desktop & Mobile)

## Tech Stack

| Bereich         | Technologie                     |
| --------------- | ------------------------------- |
| Frontend        | HTML5, CSS3, Vanilla JavaScript |
| Backend         | Firebase Realtime Database      |
| Automatisierung | n8n (self-hosted oder Cloud)    |
| KI-Analyse      | OpenAI GPT-4o-mini              |
| E-Mail          | IMAP (Empfang) + SMTP (Versand) |

---

## 🤖 n8n Issue Collector – Setup-Anleitung

### Voraussetzungen

- n8n (selbst-gehostet oder [n8n Cloud](https://n8n.io))
- Dediziertes E-Mail-Postfach (z.B. `issues@your-domain.com`) mit IMAP-Zugang
- OpenAI API Key
- SMTP-Zugangsdaten für ausgehende E-Mails

### Schritt 1: n8n Credentials einrichten

Gehe in n8n zu **Settings → Credentials** und lege folgende Zugangsdaten an:

| Name                      | Typ        | Felder                     |
| ------------------------- | ---------- | -------------------------- |
| `Issue Collector Mailbox` | IMAP       | Host, Port, User, Passwort |
| `OpenAI API`              | OpenAI API | API Key                    |
| `SMTP Outgoing`           | SMTP       | Host, Port, User, Passwort |

> ⚠️ API-Keys und Passwörter **niemals** in Workflow-JSON-Dateien speichern!

### Schritt 2: Workflows importieren

1. In n8n: **Workflows → Import from File**
2. Importiere beide Dateien aus dem **`n8n/`-Ordner** des Repos:
   - `n8n/issue-collector-workflow.json` – Haupt-Workflow (E-Mail → Ticket)
   - `n8n/status-notification-workflow.json` – Benachrichtigung bei Statusänderung
3. In jedem Node die Credential-IDs durch deine echten Credentials ersetzen.

### Schritt 3: Firebase URL konfigurieren

Im Node **"🗃️ Ticket in Firebase anlegen"** die URL anpassen:

```
https://YOUR-PROJECT-ID.firebaseio.com/tasks.json?auth=YOUR_DB_SECRET
```

### Schritt 4: Frontend-Konfiguration

1. Kopiere `scripts/issue-collector/config-example.js` → `scripts/issue-collector/config.js`
2. Trage deine echten Werte ein:

```js
const ISSUE_COLLECTOR_EMAIL = "issues@your-domain.com";
const N8N_STATUS_WEBHOOK_URL =
  "https://your-n8n.com/webhook/ticket-status-changed";
```

> `config.js` ist via `.gitignore` ausgeschlossen – wird **nicht** eingecheckt.

### Schritt 5: Status-Benachrichtigung in Board einbinden

In `board.html` vor dem schließenden `</body>` ergänzen:

```html
<script src="./scripts/issue-collector/status-notifier.js"></script>
<script src="./scripts/issue-collector/config.js"></script>
```

Im Drag & Drop Handler in `board.js` nach dem Firebase-Update:

```js
await notifyStatusChange(task, oldColumnId, newColumnId);
```

---

## 🗂️ Triage-Spalte

Alle per E-Mail erstellten Tickets landen automatisch in der **"Triage"-Spalte**.
Manuell erstellte Tasks erhalten ebenfalls standardmäßig `status: "triage"` – dazu in `addtask.js` den Default-Status auf `"triage"` setzen.

---

## 🌐 Stakeholder Landing Page

Erreichbar unter: `stakeholder-landing.html`

Erklärt Stakeholdern den gesamten Prozess inkl. Tageslimit (10 Requests/Tag).

---

## 🔒 Sicherheit – Sensible Daten

Folgende Dateien sind via `.gitignore` ausgeschlossen:

- `scripts/issue-collector/config.js` (IMAP-Adresse & n8n Webhook-URL)
- `.env`

> `scripts/firebase-init.js` enthält die Firebase Web-Config (API-Key, Project-ID etc.).  
> Firebase Web-API-Keys sind by design öffentlich – die Sicherheit wird über Firebase Security Rules geregelt.

---

## Demo-Nutzung

1. `stakeholder-landing.html` im Browser öffnen
2. Test-E-Mail an die konfigurierte Adresse senden
3. n8n verarbeitet sie → Ticket erscheint in der Triage-Spalte
4. `board.html` öffnen und das Ticket im Board sehen
