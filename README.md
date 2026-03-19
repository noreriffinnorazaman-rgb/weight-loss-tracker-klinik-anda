# Weight Loss Programme Tracker

A comprehensive patient tracking system for **Klinik Anda Kangar** by Dr Izazi, designed to monitor weight loss progress through Ozempic, Wegovy, or Mounjaro programmes.

## Features

### 📊 Dashboard
- Real-time statistics: total patients, pens used, average weight loss
- Patient overview table with progress indicators
- Add new patients with baseline measurements
- Data reset functionality

### 👤 Patient Detail View
- Visual pen timeline (Baseline → Pen 1 → Pen 2 → Pen 3 → Pen 4)
- **4 Interactive Charts:**
  - Weight Progress (area chart)
  - Body Composition (bar chart - fat vs muscle mass)
  - Waist Circumference (area chart)
  - Health Markers (line chart - HbA1c, cholesterol, HDL, LDL)
- Comprehensive measurement comparison table
- Programme selector (Ozempic/Wegovy/Mounjaro)

### 📝 Data Entry
- Record measurements for each pen injection
- Track 9 key metrics: Weight, BMI, Fat Mass, Muscle Mass, Waist, HbA1c, Total Cholesterol, HDL, LDL
- Date tracking for each measurement

### 🔄 Google Sheets Integration
- **Live sync** with Google Spreadsheet
- All data automatically saved to your spreadsheet
- Real-time updates across devices
- Fallback to localStorage when offline

## Technology Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** Google Sheets API
- **Deployment:** Render (recommended)

## Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/weight-loss-tracker.git
cd weight-loss-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000
```

### Local Mode (Without Google Sheets)
By default, the app uses localStorage. No additional configuration needed for local testing.

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions including:
- Google Sheets API setup
- GitHub repository creation
- Render deployment configuration
- Environment variables setup

## Pre-loaded Data

The system comes with 3 initial patients from your Excel spreadsheet:

1. **Che Azizah bte Hj Ahmad** - 64.9 kg, BMI 28.84
2. **Muhamad Izzat Bin Zulkifli** - 98.4 kg, BMI 34
3. **Noreriffin Bin Norazaman** - 120.4 kg, BMI 42.7

## Environment Variables

Create a `.env.local` file (for local development) or set in Render:

```env
# Enable Google Sheets sync (true/false)
NEXT_PUBLIC_USE_SHEETS_API=false

# Your Google Spreadsheet ID
NEXT_PUBLIC_SPREADSHEET_ID=1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y

# Google Service Account credentials (JSON)
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
```

See `env.example` for the complete template.

## Project Structure

```
weight-loss-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── patients/          # API routes for Google Sheets sync
│   │   ├── patient/[id]/          # Patient detail page
│   │   ├── page.tsx               # Dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StatsCards.tsx
│   │   ├── PatientTable.tsx
│   │   ├── AddPatientModal.tsx
│   │   ├── PenTimeline.tsx
│   │   ├── PenRecordForm.tsx
│   │   ├── WeightChart.tsx
│   │   ├── BodyCompositionChart.tsx
│   │   ├── HealthMarkersChart.tsx
│   │   ├── WaistChart.tsx
│   │   └── MeasurementTable.tsx
│   └── lib/
│       ├── types.ts               # TypeScript types
│       ├── store.ts               # Data management
│       └── sheets.ts              # Google Sheets integration
├── DEPLOYMENT.md                  # Deployment guide
└── package.json
```

## Usage

### Adding a Patient
1. Click "Add Patient" button
2. Fill in patient details and baseline measurements
3. Select programme type (Ozempic/Wegovy/Mounjaro)
4. Click "Add Patient"

### Recording Pen Progress
1. Click on a patient name
2. Click "Record Pen X" button
3. Enter measurements after pen injection
4. Click "Save Pen X Record"
5. Charts update automatically

### Viewing Progress
- Dashboard shows overall statistics
- Patient detail page shows individual progress with charts
- Measurement table compares all pen stages side-by-side

## Data Persistence

- **With Google Sheets:** Data syncs to spreadsheet in real-time
- **Without Google Sheets:** Data stored in browser localStorage
- **Hybrid Mode:** Uses both for redundancy

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers supported

## Security

- Service account credentials stored securely in environment variables
- Private GitHub repository recommended
- HTTPS enabled by default on Render
- No patient data in client-side code

## License

Private - Klinik Anda Kangar 2026

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Built for Klinik Anda Kangar by Dr Izazi**  
Weight Loss Programme 2026
