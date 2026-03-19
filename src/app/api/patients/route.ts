import { NextResponse } from "next/server";
import { readPatientsFromSheet, writePatientsToSheet } from "@/lib/sheets";

export async function GET() {
  try {
    const patients = await readPatientsFromSheet();
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const patients = await request.json();
    await writePatientsToSheet(patients);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving patients:", error);
    return NextResponse.json(
      { error: "Failed to save patients" },
      { status: 500 }
    );
  }
}
