# Deploy to Your GitHub Account - Step by Step

**Your GitHub Email:** noreriifnnorazaman@gmail.com

Follow these exact steps to deploy the Weight Loss Programme Tracker.

---

## Step 1: Create GitHub Repository (2 minutes)

1. **Open GitHub and login:**
   - Go to: https://github.com/login
   - Login with: **noreriifnnorazaman@gmail.com**

2. **Create new repository:**
   - Click the **+** icon (top right) → **New repository**
   - Or go directly to: https://github.com/new

3. **Fill in repository details:**
   - **Repository name:** `weight-loss-tracker-klinik-anda`
   - **Description:** `Weight Loss Programme Tracker for Klinik Anda Kangar by Dr Izazi`
   - **Visibility:** Choose **Public** (so you can deploy for free on Render)
   - **DO NOT** check "Add a README file"
   - **DO NOT** check "Add .gitignore"
   - **DO NOT** choose a license
   - Click **Create repository**

4. **Copy your repository URL:**
   - You'll see a page with setup instructions
   - Copy the HTTPS URL (looks like): `https://github.com/noreriifnnorazaman/weight-loss-tracker-klinik-anda.git`
   - **Keep this page open!**

---

## Step 2: Push Code to GitHub (1 minute)

1. **Open PowerShell** in your project folder:
   - Press `Windows + X` → Choose **Terminal** or **PowerShell**
   - Or right-click in the folder → **Open in Terminal**

2. **Navigate to project folder:**
   ```powershell
   cd "C:\Users\djemb\OneDrive\Desktop\WEIGHT LOSS PROGRAM KLINIK ANDA\weight-loss-tracker"
   ```

3. **Add your GitHub repository:**
   ```powershell
   git remote add origin https://github.com/noreriifnnorazaman/weight-loss-tracker-klinik-anda.git
   ```
   *(Replace with YOUR actual repository URL from Step 1)*

4. **Push the code:**
   ```powershell
   git branch -M main
   git push -u origin main
   ```

5. **Enter GitHub credentials when prompted:**
   - **Username:** Your GitHub username (or email)
   - **Password:** Use a **Personal Access Token** (not your password)
   
   **Don't have a token? Create one:**
   - Go to: https://github.com/settings/tokens
   - Click **Generate new token** → **Generate new token (classic)**
   - Name: `weight-loss-tracker-deploy`
   - Expiration: **No expiration** (or choose your preference)
   - Select scopes: Check **repo** (all checkboxes under it)
   - Click **Generate token**
   - **COPY THE TOKEN** (you won't see it again!)
   - Use this token as your password

6. **Verify upload:**
   - Refresh your GitHub repository page
   - You should see all your files uploaded!

---

## Step 3: Set Up Google Sheets API (10 minutes)

### 3.1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Login with your Google account

2. **Create new project:**
   - Click **Select a project** (top left)
   - Click **NEW PROJECT**
   - **Project name:** `weight-loss-tracker`
   - Click **CREATE**
   - Wait for project to be created (notification will appear)
   - **Select the project** from the dropdown

### 3.2: Enable Google Sheets API

1. **Go to API Library:**
   - Click hamburger menu (☰) → **APIs & Services** → **Library**
   - Or go to: https://console.cloud.google.com/apis/library

2. **Enable the API:**
   - Search for: **Google Sheets API**
   - Click on it
   - Click **ENABLE**
   - Wait for it to enable

### 3.3: Create Service Account

1. **Go to Credentials:**
   - Click hamburger menu (☰) → **APIs & Services** → **Credentials**
   - Or go to: https://console.cloud.google.com/apis/credentials

2. **Create Service Account:**
   - Click **+ CREATE CREDENTIALS** → **Service account**
   - **Service account name:** `sheets-sync-service`
   - **Service account ID:** (auto-filled)
   - Click **CREATE AND CONTINUE**
   - **Role:** Skip this (click **CONTINUE**)
   - Click **DONE**

### 3.4: Download JSON Key

1. **Find your service account:**
   - You'll see it in the list (looks like: `sheets-sync-service@...`)
   - Click on the **email address**

2. **Create key:**
   - Go to **KEYS** tab
   - Click **ADD KEY** → **Create new key**
   - Choose **JSON** format
   - Click **CREATE**
   - A JSON file will download automatically
   - **SAVE THIS FILE SECURELY!** (e.g., Desktop)

3. **Open the JSON file:**
   - Right-click the downloaded file → **Open with** → **Notepad**
   - Find the line with `"client_email":`
   - Copy the email address (looks like: `sheets-sync-service@weight-loss-tracker-xxxxx.iam.gserviceaccount.com`)

### 3.5: Share Your Spreadsheet

1. **Open your Google Spreadsheet:**
   - Go to: https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit

2. **Share with service account:**
   - Click **Share** button (top right)
   - Paste the service account email you copied
   - Change permission to **Editor**
   - **UNCHECK** "Notify people"
   - Click **Share**

---

## Step 4: Deploy to Render (10 minutes)

### 4.1: Create Render Account

1. **Go to Render:**
   - Visit: https://render.com/
   - Click **Get Started** or **Sign Up**

2. **Sign up with GitHub:**
   - Click **GitHub** button
   - Authorize Render to access your GitHub
   - Complete signup

### 4.2: Create Web Service

1. **Create new service:**
   - Click **New +** (top right)
   - Select **Web Service**

2. **Connect repository:**
   - Find `weight-loss-tracker-klinik-anda` in the list
   - Click **Connect**
   - If you don't see it, click **Configure account** and grant access

### 4.3: Configure Service

Fill in these settings:

- **Name:** `weight-loss-klinik-anda` (or any name you like)
- **Region:** **Singapore** (closest to Malaysia)
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** **Node**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** **Free**

### 4.4: Add Environment Variables

Click **Advanced** → Scroll to **Environment Variables**

Add these **3 variables** one by one:

**Variable 1:**
- **Key:** `NEXT_PUBLIC_USE_SHEETS_API`
- **Value:** `true`
- Click **Add**

**Variable 2:**
- **Key:** `NEXT_PUBLIC_SPREADSHEET_ID`
- **Value:** `1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y`
- Click **Add**

**Variable 3:**
- **Key:** `GOOGLE_SHEETS_CREDENTIALS`
- **Value:** 
  1. Open the JSON file you downloaded (with Notepad)
  2. Select **ALL** the text (Ctrl+A)
  3. Copy it (Ctrl+C)
  4. Paste here (Ctrl+V)
  5. **IMPORTANT:** Make sure it's all on ONE LINE (remove any line breaks if needed)
  6. Should start with: `{"type":"service_account"` and end with `}`
- Click **Add**

### 4.5: Deploy!

1. **Create the service:**
   - Scroll down
   - Click **Create Web Service**

2. **Wait for deployment:**
   - You'll see build logs
   - Wait 5-10 minutes
   - Status will change to **Live** when ready

3. **Get your URL:**
   - You'll see a URL like: `https://weight-loss-klinik-anda.onrender.com`
   - Click it to open your app!

---

## Step 5: Test Your Deployment

1. **Open your app URL**
2. You should see the dashboard with 3 patients
3. **Test adding a patient:**
   - Click "Add Patient"
   - Fill in details
   - Click "Add Patient"
   - Check your Google Spreadsheet - new patient should appear!

4. **Test recording pen data:**
   - Click on a patient name
   - Click "Record Pen 1"
   - Enter measurements
   - Click "Save Pen 1 Record"
   - Check spreadsheet - should update!

5. **Refresh the page** - data should persist ✅

---

## Your Deployment URLs

After deployment, save these:

- **GitHub Repository:** https://github.com/noreriifnnorazaman/weight-loss-tracker-klinik-anda
- **Live App:** (You'll get this from Render, e.g., `https://weight-loss-klinik-anda.onrender.com`)
- **Google Spreadsheet:** https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit

---

## Troubleshooting

### "Authentication failed" when pushing to GitHub
- Use a **Personal Access Token** instead of password
- Create one at: https://github.com/settings/tokens

### Build fails on Render
- Check environment variables are set correctly
- Make sure GOOGLE_SHEETS_CREDENTIALS is valid JSON (no line breaks)

### "Failed to fetch patients"
- Verify service account has Editor access to spreadsheet
- Check GOOGLE_SHEETS_CREDENTIALS is complete

### Data not syncing
- Open browser console (F12) to see errors
- Verify spreadsheet has correct column headers

---

## Updating Your App

When you make changes:

```powershell
cd "C:\Users\djemb\OneDrive\Desktop\WEIGHT LOSS PROGRAM KLINIK ANDA\weight-loss-tracker"
git add .
git commit -m "Description of changes"
git push
```

Render will automatically rebuild and redeploy!

---

## Need Help?

- **GitHub Issues:** https://github.com/noreriifnnorazaman/weight-loss-tracker-klinik-anda/issues
- **Render Docs:** https://render.com/docs
- **Google Cloud Support:** https://cloud.google.com/support

---

**You're all set! Follow these steps and your app will be live! 🚀**
