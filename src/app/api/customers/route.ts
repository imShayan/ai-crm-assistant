import { NextResponse } from "next/server";
export async function GET() {
   const customers = [
  {
    id: 1,
    name: "John Doe",
    company: "Google",
  },
  {
    id: 2,
    name: "Sarah Smith",
    company: "Microsoft",
  },
];  
    return NextResponse.json( customers ); 
}

export async function POST(request: Request) {  
    const body = await request.json();

    return NextResponse.json({
    success: true,
    customer: body,
  });
}