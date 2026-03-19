# Quick Start Guide - Deploy to GitHub & Render

Follow these steps to deploy your Weight Loss Programme Tracker.

## Step 1: Push to GitHub (5 minutes)

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `weight-loss-tracker`
   - Choose **Private** (recommended)
   - **DO NOT** initialize with README
   - Click "Create repository"

2. **Push your code:**
   ```powershell
   cd "C:\Users\djemb\OneDrive\Desktop\WEIGHT LOSS PROGRAM KLINIK ANDA\weight-loss-tracker"
   git remote add origin https://github.com/YOUR_USERNAME/weight-loss-tracker.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

## Step 2: Set Up Google Sheets API (10 minutes)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create new project: `weight-loss-tracker`

2. **Enable Google Sheets API:**
   - Go to "APIs & Services" → "Library"
   - Search "Google Sheets API" → Enable

3. **Create Service Account:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Name: `sheets-sync-service`
   - Click "Create" → Skip optional steps → "Done"

4. **Download JSON Key:**
   - Click on the service account
   - Go to "Keys" tab → "Add Key" → "Create new key"
   - Choose **JSON** → Click "Create"
   - **Save this file securely!**

5. **Share Spreadsheet:**
   - Open the JSON file
   - Copy the `client_email` (looks like: `sheets-sync-service@...iam.gserviceaccount.com`)
   - Open your spreadsheet: https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit
   - Click "Share" → Paste the email → Give "Editor" access → Uncheck "Notify" → Share

## Step 3: Deploy to Render (10 minutes)

1. **Create Render Account:**
   - Go to https://render.com/
   - Sign up (free tier available)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub account
   - Select `weight-loss-tracker` repository
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `weight-loss-tracker`
   - **Region:** Singapore (closest to Malaysia)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Add Environment Variables:**
   
   Click "Advanced" → Add these 3 variables:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_USE_SHEETS_API`
   - Value: `true`

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SPREADSHEET_ID`
   - Value: `1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y`

   **Variable 3:**
   - Key: `GOOGLE_SHEETS_CREDENTIALS`
   - Value: Open your downloaded JSON file, copy **ALL** the content (starts with `{"type":"service_account"...`), paste as ONE LINE

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - You'll get a URL like: `https://weight-loss-tracker.onrender.com`

## Step 4: Test Your Deployment

1. Visit your Render URL
2. You should see 3 patients from your spreadsheet
3. Try adding a new patient → Check spreadsheet (should appear)
4. Click a patient → Record Pen 1 → Check spreadsheet (should update)
5. Refresh page → Data persists ✅

## Troubleshooting

**Build fails?**
- Check environment variables are set correctly
- Ensure JSON credentials are valid (no line breaks)

**"Failed to fetch patients"?**
- Verify service account has Editor access to spreadsheet
- Check GOOGLE_SHEETS_CREDENTIALS is complete JSON

**Data not syncing?**
- Open browser console (F12) for error messages
- Verify spreadsheet format matches expected columns

## Your Spreadsheet Format

Ensure your Google Sheet has these columns in **Sheet1**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No | Name | DOB | WT(kg) | BMI | Fat Mass (kg) | Muscle Mass(kg) | Waist (cm) | HbA1c(%) | Total cholesterol | HDL | LDL | Date | Programme | Pen Number |

## Need Help?

See full documentation in **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

**That's it! Your system is now live with Google Sheets sync! 🎉**
