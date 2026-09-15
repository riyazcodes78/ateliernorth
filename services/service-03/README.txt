ATELIER NORTH — SERVICE 04 / NORTH FOLLOW-UP AI 2.0

NEW:
- Any recipient email can be entered.
- Recipient name/company/context are dynamic.
- Send now OR choose a date and time.
- One-time follow-up OR every 2 days OR custom day interval.
- The AI generates each follow-up from the recipient's context.
- Real email delivery via SMTP.
- A lightweight local scheduler runs pending jobs while the Node server is running.

SETUP
1. npm install
2. Copy .env.example to .env
3. Add OPENAI_API_KEY
4. Add SMTP credentials (Gmail: use an App Password)
5. npm start
6. Open http://localhost:3000

IMPORTANT:
This demo's scheduler is intentionally simple and stores scheduled jobs in memory.
If the Node process stops, pending jobs are lost. For a production service, replace
the in-memory scheduler with a persistent job queue/database (for example a hosted
scheduler/queue) before relying on it for real customer communications.

Automatic email is sent only to the explicit email address entered by the user.
