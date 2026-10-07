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
*(Additional rules will be appended here)*
