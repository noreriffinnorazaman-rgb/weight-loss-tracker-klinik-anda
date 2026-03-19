import { NextResponse } from "next/server";
import { readPatientsFromSheet, writePatientsToSheet } from "@/lib/sheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patients = await readPatientsFromSheet();
    const patient = patients.find((p) => p.id === id);
    
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedPatient = await request.json();
    const patients = await readPatientsFromSheet();
    const index = patients.findIndex((p) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    
    patients[index] = updatedPatient;
    await writePatientsToSheet(patients);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patients = await readPatientsFromSheet();
    const filtered = patients.filter((p) => p.id !== id);
    
    filtered.forEach((p, i) => (p.no = i + 1));
    await writePatientsToSheet(filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
