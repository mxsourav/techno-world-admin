# STRICT PROJECT RULES & ARCHITECTURAL DIRECTIVES

> **CRITICAL DIRECTIVE**: You MUST read and follow these rules before creating, editing, or refactoring anything in this codebase.

---

## RULE 1: STRICTLY ZERO EMOJIS ANYWHERE EVER

1. **Absolute Ban on Emojis**:
   - NEVER use emojis anywhere in the codebase.
   - This includes: UI labels, buttons, navigation items, tabs, modals, tables, toasts/notifications, headers, footers, email templates, log outputs, commit messages, and code comments.
   - Absolutely NO exceptions (e.g. No 🚀, ⚡, ✉, 📦, 👥, 💬, ✍️, 🌍, 👤, 💡, ✅, 🏛️, 📩, etc.).

2. **Always Use SVG Icons (Lucide Icons)**:
   - For writing / composing emails: Use `<Pen className="..." />` or `<Pencil className="..." />` from `lucide-react`.
   - For Orders: Use `<Package className="..." />`.
   - For Team: Use `<Users className="..." />`.
   - For Support / Customer Care: Use `<MessageSquare className="..." />` or `<Headphones className="..." />` or `<Mail className="..." />`.
   - For Verification / Status: Use `<CheckCircle2 className="..." />`, `<AlertCircle className="..." />`, `<Clock className="..." />`.
   - For Actions / Fast setups: Use `<Zap className="..." />`, `<Send className="..." />`, `<RotateCcw className="..." />`, `<ExternalLink className="..." />`.

3. **Tone & Visual Elegance**:
   - Maintain clean, professional, enterprise-grade typography and interface design.
   - Always verify that all UI labels are clean text accompanied only by crisp SVG vector icons.

---

## RULE 2: ABSOLUTE BAN ON VERCEL AND RENDER (HOSTING ARCHITECTURE DIRECTIVE)

1. **Never Mention or Target Vercel or Render**:
   - The project is NO LONGER hosted on Vercel or Render.
   - NEVER refer to Vercel or Render in responses, instructions, documentation, configs, or deployment steps.
   - Any reference to Vercel or Render is strictly forbidden.

2. **Official Hosting Infrastructure**:
   - **Frontend Storefront**: Hosted on **Hostinger** (`https://technoworldbooks.in`), deployed via GitHub Actions (`deploy_frontend.yml`).
   - **Admin Panel**: Hosted on **Hostinger** (`https://admin.technoworldbooks.in`), deployed via GitHub Actions (`deploy.yml`).
   - **Backend API**: Hosted on **Google Cloud Platform (GCP) Compute Engine VM** (`https://api.technoworldbooks.in`), managed as a Node.js service via **PM2** (`backend` or `all`).
   - **Database**: PostgreSQL hosted on the GCP VM.

3. **Backend Service Restart Procedure**:
   - Updates to the backend require pulling the latest commit, compiling (`npm run build`), and restarting PM2 on the GCP VM (`pm2 restart backend` or `pm2 restart all`) to show `online` (green).

---

## RULE 3: MANDATORY GCP VM SSH COMMAND DIRECTIVE

1. **Always Include the Exact VM SSH Command**:
   - Whenever providing any GCP, backend, PM2, environment variable, or server-side terminal instructions, ALWAYS explicitly specify this SSH command first:
     ```bash
     gcloud compute ssh instance-20260923-151813 --zone=asia-south1-a
     ```
   - Explain that Google Cloud Shell (`technoworldbookswebsite@cloudshell:~`) is merely a management console, and the Node.js backend application, `server/.env`, and PM2 daemon reside inside the Compute Engine VM instance (`~/my-app/server`).
   - Never assume the user is already inside the VM; always provide this SSH connection step at the beginning of all server workflows.

---
*(Additional rules will be appended here)*
