# Deploy to Netlify with Google Apps Script - EASY METHOD! 🚀

**This is MUCH SIMPLER than the previous method!**

✅ No Google Cloud Console  
✅ No Service Account  
✅ No JSON credentials  
✅ Just Google Apps Script + Netlify!

**Total time: 15 minutes**

---

## STEP 1: Set Up Google Apps Script (5 minutes)

### 1.1 Open Your Spreadsheet
- Go to: https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit
- This is your Weight Loss Programme spreadsheet

### 1.2 Open Apps Script Editor
- Click **Extensions** (in the menu bar)
- Click **Apps Script**
- A new tab will open with the Apps Script editor

### 1.3 Clear Default Code
- You'll see some default code in the editor
- Select ALL the code (Ctrl+A)
- Delete it

### 1.4 Copy the Apps Script Code
- Open the file `apps-script.js` in your project folder
- Select ALL the code (Ctrl+A)
- Copy it (Ctrl+C)

### 1.5 Paste into Apps Script Editor
- Go back to the Apps Script tab
- Paste the code (Ctrl+V)
- Click the **💾 Save** icon (or Ctrl+S)
- Name your project: `Weight Loss Tracker API`

### 1.6 Deploy as Web App
- Click **Deploy** button (top right)
- Select **New deployment**

### 1.7 Configure Deployment
A sidebar appears:

**1. Click the gear icon ⚙️ next to "Select type"**
   - Choose **Web app**

**2. Fill in the settings:**
   - **Description:** `Weight Loss Tracker v1`
   - **Execute as:** **Me** (your email)
   - **Who has access:** **Anyone**
   - Click **Deploy**

### 1.8 Authorize the Script
- A popup appears: "Authorization required"
- Click **Authorize access**
- Choose your Google account
- Click **Advanced** (if you see a warning)
- Click **Go to Weight Loss Tracker API (unsafe)**
- Click **Allow**

### 1.9 Copy the Web App URL
- After authorization, you'll see "Deployment successfully created"
- **COPY THE WEB APP URL** - it looks like:
  ```
  https://script.google.com/macros/s/AKfycbx.../exec
  ```
- **SAVE THIS URL** - you'll need it for Netlify!
- Click **Done**

✅ **Apps Script is ready!**

---

## STEP 2: Deploy to Netlify (5 minutes)

### 2.1 Go to Netlify
- Visit: https://app.netlify.com/
- Click **Sign up** (if new) or **Log in**

### 2.2 Sign Up with GitHub
- Click **GitHub** button
- Authorize Netlify to access your GitHub
- Complete signup

### 2.3 Import from GitHub
- Click **Add new site** → **Import an existing project**
- Click **Deploy with GitHub**
- Authorize Netlify if needed
- Find and click: `weight-loss-tracker-klinik-anda`

### 2.4 Configure Build Settings
- **Branch to deploy:** `main`
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Click "Show advanced"**

### 2.5 Add Environment Variable
- Click **New variable**
- **Key:** `NEXT_PUBLIC_APPS_SCRIPT_URL`
- **Value:** Paste the Apps Script URL you copied in Step 1.9
  - Example: `https://script.google.com/macros/s/AKfycbx.../exec`

### 2.6 Deploy!
- Click **Deploy site**
- Wait 3-5 minutes for build to complete
- You'll get a URL like: `https://random-name-123456.netlify.app`

### 2.7 Rename Your Site (Optional)
- Click **Site settings**
- Click **Change site name**
- Enter: `weight-loss-klinik-anda` (or any available name)
- Your URL becomes: `https://weight-loss-klinik-anda.netlify.app`

✅ **Your app is LIVE!**

---

## STEP 3: Test Your Deployment (2 minutes)

### 3.1 Open Your App
- Click on your Netlify URL
- You should see the dashboard with 3 patients

### 3.2 Test Adding a Patient
- Click **Add Patient**
- Fill in the form
- Click **Add Patient**
- Check your Google Spreadsheet - new patient should appear!

### 3.3 Test Recording Pen Data
- Click on a patient name
- Click **Record Pen 1**
- Enter measurements
- Click **Save Pen 1 Record**
- Check spreadsheet - should update!

### 3.4 Test Data Persistence
- Refresh the page
- Data should still be there ✅

---

## Your Deployment URLs

**GitHub Repository:**  
https://github.com/noreriffinnorazaman-rgb/weight-loss-tracker-klinik-anda

**Google Spreadsheet:**  
https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit

**Apps Script:**  
(Your web app URL from Step 1.9)

**Live App:**  
(Your Netlify URL from Step 2.6)

---

## Updating Your App

When you make changes to your code:

```powershell
cd "C:\Users\djemb\OneDrive\Desktop\WEIGHT LOSS PROGRAM KLINIK ANDA\weight-loss-tracker"
git add .
git commit -m "Description of changes"
git push
```

Netlify will **automatically rebuild and redeploy**!

---

## Updating Apps Script

If you need to update the Apps Script code:

1. Open Apps Script editor (Extensions → Apps Script)
2. Make your changes
3. Click **Deploy** → **Manage deployments**
4. Click **✏️ Edit** (pencil icon)
5. Change version to **New version**
6. Click **Deploy**
7. The URL stays the same - no need to update Netlify!

---

## Troubleshooting

### "Failed to fetch patients"
- Check that Apps Script URL is correct in Netlify environment variables
- Make sure Apps Script is deployed with "Anyone" access
- Try redeploying the Apps Script

### Build fails on Netlify
- Check build logs in Netlify dashboard
- Make sure `netlify.toml` is in your repository
- Try clearing cache and redeploying

### Data not syncing
- Open browser console (F12) to see errors
- Verify Apps Script URL is accessible (paste in browser - should return JSON)
- Check spreadsheet has correct column headers

### Apps Script authorization error
- Make sure you authorized the script with your Google account
- Check that "Who has access" is set to "Anyone"

---

## Why This Method is Better

✅ **Simpler setup** - No Google Cloud Console  
✅ **No credentials** - No JSON files to manage  
✅ **Native integration** - Apps Script works directly with Sheets  
✅ **Automatic deploys** - Push to GitHub → Auto deploy  
✅ **Free hosting** - Netlify free tier is generous  
✅ **HTTPS included** - Automatic SSL certificate  
✅ **Fast deploys** - Usually under 3 minutes  

---

## Next Steps

1. ✅ Apps Script deployed
2. ✅ Netlify site live
3. 🎉 Share your URL with Dr. Izazi!

---

**Your Weight Loss Programme Tracker is now LIVE with Google Sheets sync! 🎉**
