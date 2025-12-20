import { NextResponse } from "next/server";
import { getAllCodes, createCode, deleteCode } from "../../../admin/actions";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const passcode = url.searchParams.get("passcode") || "";
    const codes = await getAllCodes(passcode);
    return NextResponse.json(codes);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spins, passcode } = body;
    const created = await createCode(Number(spins), passcode);
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const passcode = url.searchParams.get("passcode") || "";
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteCode(Number(id), passcode);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
