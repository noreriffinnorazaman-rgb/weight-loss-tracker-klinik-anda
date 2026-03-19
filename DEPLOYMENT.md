# Deployment Guide - Weight Loss Programme Tracker

This guide will help you deploy the Weight Loss Programme Tracker to Render with Google Sheets integration.

## Prerequisites

1. GitHub account
2. Render account (free tier available at https://render.com)
3. Google Cloud Platform account (for Google Sheets API)
4. Your Google Spreadsheet ID from: `https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit`

---

## Part 1: Set Up Google Sheets API

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it: `weight-loss-tracker`
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name: `sheets-sync-service`
4. Click "Create and Continue"
5. Skip the optional steps, click "Done"

### Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create" - a JSON file will download
6. **IMPORTANT:** Keep this file secure, you'll need it for deployment

### Step 5: Share Spreadsheet with Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like: `sheets-sync-service@your-project.iam.gserviceaccount.com`)
3. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit
4. Click "Share" button
5. Paste the service account email
6. Give it "Editor" access
7. Uncheck "Notify people"
8. Click "Share"

---

## Part 2: Deploy to GitHub

### Step 1: Initialize Git Repository

Open PowerShell in the project folder and run:

```powershell
cd "C:\Users\djemb\OneDrive\Desktop\WEIGHT LOSS PROGRAM KLINIK ANDA\weight-loss-tracker"
git init
git add .
git commit -m "Initial commit - Weight Loss Programme Tracker"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `weight-loss-tracker`
3. Description: `Weight Loss Programme Tracker for Klinik Anda Kangar`
4. Choose "Private" (recommended for patient data)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/weight-loss-tracker.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy to Render

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select your `weight-loss-tracker` repository
5. Click "Connect"

### Step 2: Configure Web Service

Fill in these settings:

- **Name:** `weight-loss-tracker`
- **Region:** Choose closest to Malaysia (e.g., Singapore)
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### Step 3: Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

1. **NEXT_PUBLIC_USE_SHEETS_API**
   - Value: `true`

2. **NEXT_PUBLIC_SPREADSHEET_ID**
   - Value: `1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y`

3. **GOOGLE_SHEETS_CREDENTIALS**
   - Value: Open the JSON file you downloaded earlier
   - Copy the ENTIRE contents (it should start with `{"type":"service_account"...`)
   - Paste it as a single line
   - **IMPORTANT:** Make sure it's valid JSON with no line breaks

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for the build to complete
3. Once deployed, you'll get a URL like: `https://weight-loss-tracker.onrender.com`

---

## Part 4: Configure Your Spreadsheet Format

Your Google Sheet should have these columns in **Sheet1**:

| Column | Header | Description |
|--------|--------|-------------|
| A | No | Patient number |
| B | Name | Patient full name |
| C | DOB | Date of birth |
| D | WT(kg) | Weight in kg |
| E | BMI | Body Mass Index |
| F | Fat Mass (kg) | Fat mass |
| G | Muscle Mass(kg) | Muscle mass |
| H | Waist Circumference (cm) | Waist measurement |
| I | HbA1c(%) | HbA1c percentage |
| J | Total cholesterol (mmol/L) | Total cholesterol |
| K | HDL | HDL cholesterol |
| L | LDL | LDL cholesterol |
| M | Date | Date of measurement |
| N | Programme | Ozempic/Wegovy/Mounjaro |
| O | Pen Number | 0=Baseline, 1-4=Pen number |

**Example rows:**
```
Row 1 (Headers): No | Name | DOB | WT(kg) | BMI | Fat Mass (kg) | ...
Row 2 (Baseline): 1 | Che Azizah bte Hj Ahmad | 12th Oct 1968 | 64.9 | 28.84 | 16.9 | ... | 2026-01-15 | Ozempic | 0
Row 3 (Pen 1): | | | 63.5 | 28.22 | 16.2 | ... | 2026-02-15 | | 1
Row 4 (Pen 2): | | | 62.1 | 27.60 | 15.5 | ... | 2026-03-15 | | 2
```

---

## Testing the Deployment

1. Visit your Render URL
2. You should see the 3 initial patients from your spreadsheet
3. Try adding a new patient - it should appear in the spreadsheet
4. Try recording a pen measurement - it should update the spreadsheet
5. Refresh the page - data should persist

---

## Troubleshooting

### Build Fails on Render
- Check the build logs in Render dashboard
- Ensure all environment variables are set correctly
- Make sure GOOGLE_SHEETS_CREDENTIALS is valid JSON

### "Failed to fetch patients" Error
- Verify the service account email has Editor access to the spreadsheet
- Check that GOOGLE_SHEETS_CREDENTIALS is properly formatted
- Ensure NEXT_PUBLIC_SPREADSHEET_ID matches your sheet ID

### Data Not Syncing
- Open browser console (F12) to see error messages
- Verify the spreadsheet format matches the expected columns
- Check that Sheet1 exists in your spreadsheet

### Local Development Without Google Sheets
If you want to test locally without Google Sheets:
1. Don't set NEXT_PUBLIC_USE_SHEETS_API (or set it to `false`)
2. Data will be stored in browser localStorage only
3. Run: `npm run dev`

---

## Updating the Application

When you make changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

Render will automatically rebuild and redeploy your application.

---

## Security Notes

- ✅ Service account credentials are stored securely in Render environment variables
- ✅ Never commit the JSON key file to GitHub
- ✅ The spreadsheet should only be shared with the service account email
- ✅ Consider making the GitHub repository private
- ✅ Use Render's free SSL certificate (automatic)

---

## Support

For issues or questions, check:
- Render logs: https://dashboard.render.com/
- Google Cloud Console: https://console.cloud.google.com/
- Next.js documentation: https://nextjs.org/docs
