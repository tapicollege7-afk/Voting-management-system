# 🗳️ VotePulse - Secure Online Voting & Election Management System (PWA)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-blue.svg)](https://expressjs.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VotePulse** is a production-ready, full-stack **e-Voting & Election Management Platform** built with HTML5, CSS3, JavaScript, Node.js Express REST API, SQLite database storage, and Progressive Web App (PWA) capabilities.

The platform provides 3 distinct, interconnected web portals: **Voter Portal**, **Admin Dashboard**, and **Central Gateway Hub**.

---

## ✨ Key Features

- 🔐 **Real-Time OTP Verification**: 6-digit verification code with live 5-minute countdown timer, SMS notification toast, and instant auto-submit upon entering the 6th digit.
- 🛑 **Strict Duplicate Vote Prevention**: Server-side composite database constraint `(election_id, voter_id)` guaranteeing voters can cast a ballot **exactly once per election**. Re-voting attempts show a sealed digital receipt and "Already Voted" protection banner.
- 📱 **Progressive Web App (PWA)**: Built-in Service Workers (`sw.js`) and Web App Manifests (`manifest.json`) enabling mobile (iOS/Android) and desktop app installation.
- 🎨 **Appearance & Theme Settings**: Light Mode ☀️ and Dark Mode 🌙 toggles with persistent `localStorage` preference, font text scaling (100% to 130%), and audio notification controls.
- ⚡ **Admin Control Panel**: Real-time vote tallying, candidate management, election status controls, and exportable CSV result reports.
- 🧹 **Clean Slate Database**: Zero dummy votes or fake data out of the box.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### Installation & Running Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/votepulse-online-voting-system.git
   cd votepulse-online-voting-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Node.js Server**
   ```bash
   npm start
   ```

4. **Access the Portals**
   - **Central Gateway Hub**: `http://localhost:3000/`
   - **Voter Portal PWA**: `http://localhost:3000/voter/`
   - **Admin Dashboard PWA**: `http://localhost:3000/admin/`

---

## 🔐 Default Access Credentials

- **Admin Console**:
  - URL: `http://localhost:3000/admin/`
  - Admin ID: `ADM-9999`
  - Password: `admin123`

- **Voter Portal**:
  - URL: `http://localhost:3000/voter/`
  - New voters can register instantly using the **New Registration** tab.

---

## 📁 Project Structure

```text
├── database/
│   ├── db.js             # SQLite database storage & query engine
│   └── data.json         # Persistent JSON database file
├── middleware/
│   └── validation.js     # Server-side validation rules
├── public/
│   ├── css/              # Central Hub styles
│   ├── js/               # Central Hub scripts & SW registration
│   ├── voter/            # Voter Portal PWA (HTML, CSS, JS, manifest, SW)
│   ├── admin/            # Admin Dashboard PWA (HTML, CSS, JS, manifest, SW)
│   ├── index.html        # Central Gateway Hub landing page
│   ├── manifest.json     # PWA Manifest
│   └── sw.js             # Service Worker
├── package.json          # Node.js dependencies & scripts
├── server.js             # Express REST API Server
└── README.md             # Project documentation
```

---

## 📤 How to Push to Your GitHub Repository

Run the following commands in your terminal to initialize Git and upload your code to GitHub:

```bash
# 1. Initialize local Git repository
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "Initial commit: VotePulse Secure Online Voting Engine"

# 4. Rename main branch
git branch -M main

# 5. Link your remote GitHub repository (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
