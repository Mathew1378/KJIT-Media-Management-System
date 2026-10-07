# KJIT Media Management System (MMS)

A web application built with Next.js 14 (App Router), Prisma (SQLite), Tailwind CSS, and TypeScript.

---

## 🚀 How to Run on Another System (With All Data Intact)

Follow these steps to transfer and run this exact project with all its database records and uploads on a new computer.

### Step 1: Install Prerequisites on the New System
* **Node.js**: Download & install Node.js (v18 or v20 LTS) from [nodejs.org](https://nodejs.org/).
* **Git**: (Optional) Download from [git-scm.com](https://git-scm.com/).

---

### Step 2: Transfer Project Files
Copy the project folder to the new system (via USB drive, Zip archive, or Git).

> ⚠️ **CRITICAL FOR "SAME EVERYTHING" DATA**:
> Because Git ignores database and upload folders by default, make sure the following are copied:
> 1. `prisma/dev.db` — SQLite database file (contains all users, events, and reports).
> 2. `uploads/` — Folder containing all uploaded posters and media files.
>
> *(Note: Do NOT copy `node_modules/` or `.next/` folders; they will be re-created on the new machine).*

---

### Step 3: Run Setup Commands

Open a terminal (Command Prompt / PowerShell / Terminal) in the project directory and run:

```bash
# 1. Install all dependencies
npm install

# 2. Generate Prisma database client
npx prisma generate

# 3. Start the development server
npm run dev
```

---

### Step 4: Open Application
Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🛠 Project Tech Stack

* **Frontend & Backend**: Next.js 14 (App Router)
* **Database**: SQLite via Prisma ORM (`prisma/dev.db`)
* **Styling**: Tailwind CSS & Framer Motion
* **Authentication**: JWT & bcryptjs password hashing
* **Export Utilities**: jsPDF, html2canvas, XLSX, Mammoth
