# Google Sheets API Setup - Easy Step-by-Step Guide

**Time needed:** 10 minutes  
**Cost:** FREE

Follow these exact steps to enable Google Sheets sync for your Weight Loss Tracker.

---

## STEP 1: Create Google Cloud Project (2 minutes)

### 1.1 Open Google Cloud Console
- Click this link: **https://console.cloud.google.com/**
- Login with your Google account (any Gmail account)

### 1.2 Create New Project
- Look at the top left, you'll see "Select a project" or a project name
- Click on it → A dropdown appears
- Click **"NEW PROJECT"** button (top right of dropdown)

### 1.3 Fill in Project Details
- **Project name:** Type `weight-loss-tracker`
- **Location:** Leave as "No organization"
- Click **"CREATE"** button
- Wait 10-20 seconds for project to be created

### 1.4 Select Your Project
- You'll see a notification "Project created"
- Click the notification OR
- Click "Select a project" again → Choose `weight-loss-tracker`

✅ **Checkpoint:** You should see "weight-loss-tracker" at the top of the page

---

## STEP 2: Enable Google Sheets API (1 minute)

### 2.1 Open API Library
- Click the **☰ hamburger menu** (top left, three horizontal lines)
- Scroll down to **"APIs & Services"**
- Click **"Library"**

OR just click this direct link:
**https://console.cloud.google.com/apis/library**

### 2.2 Search for Google Sheets API
- You'll see a search box that says "Search for APIs & Services"
- Type: `Google Sheets API`
- Click on **"Google Sheets API"** when it appears

### 2.3 Enable the API
- You'll see a blue **"ENABLE"** button
- Click it
- Wait 5-10 seconds
- Page will change to show "API enabled"

✅ **Checkpoint:** You should see "Google Sheets API" with a green checkmark

---

## STEP 3: Create Service Account (3 minutes)

### 3.1 Go to Credentials
- Click the **☰ hamburger menu** (top left)
- Go to **"APIs & Services"** → **"Credentials"**

OR click this direct link:
**https://console.cloud.google.com/apis/credentials**

### 3.2 Create Service Account
- Click **"+ CREATE CREDENTIALS"** (top of page)
- Select **"Service account"** from dropdown

### 3.3 Fill in Service Account Details

**Page 1 - Service account details:**
- **Service account name:** Type `sheets-sync-service`
- **Service account ID:** (auto-filled, leave it)
- **Description:** (optional, can leave blank)
- Click **"CREATE AND CONTINUE"**

**Page 2 - Grant access (optional):**
- **Select a role:** SKIP THIS - just click **"CONTINUE"**

**Page 3 - Grant users access (optional):**
- SKIP THIS - just click **"DONE"**

✅ **Checkpoint:** You should see `sheets-sync-service` in the Service Accounts list

---

## STEP 4: Download JSON Key (2 minutes)

### 4.1 Find Your Service Account
- In the Credentials page, scroll down to **"Service Accounts"** section
- You'll see: `sheets-sync-service@weight-loss-tracker-xxxxx.iam.gserviceaccount.com`
- Click on the **EMAIL ADDRESS** (the whole email is clickable)

### 4.2 Go to Keys Tab
- You'll see tabs: DETAILS, PERMISSIONS, **KEYS**, METRICS, LOGS
- Click **"KEYS"** tab

### 4.3 Create New Key
- Click **"ADD KEY"** button
- Select **"Create new key"**

### 4.4 Download JSON
- A popup appears asking for key type
- Make sure **"JSON"** is selected (it should be by default)
- Click **"CREATE"**
- A JSON file will automatically download to your Downloads folder
- Filename will be like: `weight-loss-tracker-xxxxx-xxxxx.json`

### 4.5 Save the File Securely
- Move this file to a safe location (e.g., your Desktop)
- **DO NOT DELETE THIS FILE** - you'll need it for Render deployment
- **DO NOT SHARE THIS FILE** - it contains secret credentials

✅ **Checkpoint:** You have a JSON file downloaded

---

## STEP 5: Get Service Account Email (1 minute)

### 5.1 Open the JSON File
- Find the JSON file you just downloaded
- Right-click it → **"Open with"** → **"Notepad"**

### 5.2 Find the Email
- Look for a line that says: `"client_email":`
- It will look like:
  ```json
  "client_email": "sheets-sync-service@weight-loss-tracker-xxxxx.iam.gserviceaccount.com",
  ```

### 5.3 Copy the Email
- Copy ONLY the email address (the part between the quotes)
- Example: `sheets-sync-service@weight-loss-tracker-xxxxx.iam.gserviceaccount.com`
- **Keep Notepad open** - you'll need this email in the next step

✅ **Checkpoint:** You have copied the service account email

---

## STEP 6: Share Your Spreadsheet (1 minute)

### 6.1 Open Your Spreadsheet
- Click this link: **https://docs.google.com/spreadsheets/d/1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y/edit**
- This is your Weight Loss Programme data spreadsheet

### 6.2 Click Share Button
- Look at the top right corner
- Click the green **"Share"** button

### 6.3 Add Service Account
- A popup appears: "Share with people and groups"
- In the text box, **paste the service account email** you copied
- Example: `sheets-sync-service@weight-loss-tracker-xxxxx.iam.gserviceaccount.com`

### 6.4 Set Permission
- Next to the email, there's a dropdown that says "Viewer"
- Click it and change to **"Editor"**

### 6.5 Turn Off Notification
- **UNCHECK** the box that says "Notify people"
- (Service accounts don't need notifications)

### 6.6 Share
- Click **"Share"** or **"Send"** button
- Done!

✅ **Checkpoint:** The service account email should now appear in the "People with access" list

---

## STEP 7: Prepare for Render Deployment

### 7.1 You Now Have Everything You Need:

1. ✅ Google Sheets API enabled
2. ✅ Service account created
3. ✅ JSON key file downloaded
4. ✅ Spreadsheet shared with service account

### 7.2 For Render Deployment, You'll Need:

**Environment Variable 1:**
- Key: `NEXT_PUBLIC_USE_SHEETS_API`
- Value: `true`

**Environment Variable 2:**
- Key: `NEXT_PUBLIC_SPREADSHEET_ID`
- Value: `1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y`

**Environment Variable 3:**
- Key: `GOOGLE_SHEETS_CREDENTIALS`
- Value: **Open your JSON file → Select ALL text (Ctrl+A) → Copy (Ctrl+C) → Paste as ONE LINE**

---

## ✅ DONE! You're Ready to Deploy to Render!

Now go to: **https://render.com/** and follow the deployment steps in `DEPLOY_INSTRUCTIONS.md`

---

## Troubleshooting

**Can't find "APIs & Services"?**
- Click the ☰ hamburger menu (top left)
- Scroll down - it's in the middle of the menu

**"Enable" button is grayed out?**
- Make sure you selected the correct project (top left)
- Try refreshing the page

**JSON file didn't download?**
- Check your Downloads folder
- Check if your browser blocked the download
- Try creating the key again

**Service account email not working?**
- Make sure you copied the ENTIRE email including the domain
- Make sure there are no extra spaces
- The email should end with `.iam.gserviceaccount.com`

---

## Next Steps

1. ✅ Google Sheets API setup complete
2. 🚀 Deploy to Render (see `DEPLOY_INSTRUCTIONS.md` - Step 4)
3. 🎉 Your app will be live with Google Sheets sync!

---

**Need help? Open `DEPLOY_INSTRUCTIONS.md` for more details!**
