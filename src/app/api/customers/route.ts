import { NextResponse } from "next/server";
import { getCustomers , addCustomer, deleteCustomer, updateCustomer } from "@/lib/services/customer-db-service"

export async function GET() {
    const customers = await getCustomers();
    return NextResponse.json(customers);
}

export async function POST(request: Request) {  
    const body = await request.json();
    const newCustomer = await addCustomer(body);
    return NextResponse.json({
    success: true,
    customer: newCustomer,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const result = await deleteCustomer(Number(id));  
    if (result) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 500 });
  } 
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();
  const updatedCustomer = await updateCustomer(Number(id), body);
    if (updatedCustomer) {
    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } else {
    return NextResponse.json({ success: false }, { status: 500 });
  } 
}