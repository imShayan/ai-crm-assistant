import { NextResponse } from "next/server";
export async function GET() {
   const customers = [
   {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        status: 'Active',

    },
    {
        id: 2,
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        company: 'Microsoft',
        status: 'Pending',
    },
    {
        id: 3,
        name: 'Michael Lee',
        email: 'michael@example.com',
        company: 'Amazon',
        status: 'Active',
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