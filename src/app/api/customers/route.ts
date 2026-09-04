import { NextResponse } from "next/server";
import { getCustomers , addCustomer, deleteCustomer, updateCustomer } from "@/lib/services/customer-db-service"
import { getCurrentServerUser } from "@/lib/services/server-auth-service";

const customerFields = ["name", "email", "company", "status"] as const;
const supportedStatuses = ["Active", "Pending", "Inactive"] as const;

type CustomerField = (typeof customerFields)[number];
type CustomerInput = Record<CustomerField, string>;
type CustomerUpdate = Partial<CustomerInput>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validateCustomerBody(
  body: unknown,
  requireAllFields: boolean,
): { data?: CustomerInput | CustomerUpdate; message?: string } {
  if (!isRecord(body)) {
    return { message: "Request body must be a JSON object" };
  }

  const bodyFields = Object.keys(body);
  const unknownField = bodyFields.find(
    (field) => !customerFields.includes(field as CustomerField),
  );
  if (unknownField) {
    return { message: `Unknown customer field: ${unknownField}` };
  }

  if (requireAllFields && customerFields.some((field) => !(field in body))) {
    return { message: "name, email, company, and status are required" };
  }

  if (!requireAllFields && bodyFields.length === 0) {
    return { message: "At least one customer field is required" };
  }

  const validatedBody: CustomerUpdate = {};
  for (const field of customerFields) {
    if (!(field in body)) {
      continue;
    }

    const value = body[field];
    if (typeof value !== "string" || value.trim() === "") {
      return { message: `${field} must be a non-empty string` };
    }

    const trimmedValue = value.trim();
    if (field === "status" && !supportedStatuses.includes(trimmedValue as (typeof supportedStatuses)[number])) {
      return { message: "status must be Active, Pending, or Inactive" };
    }

    validatedBody[field] = trimmedValue;
  }

  return { data: validatedBody };
}

export async function GET() {
    const user = await getCurrentServerUser();

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const customers = await getCustomers(user.id);
    return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  const validation = validateCustomerBody(body, true);

  if (!validation.data) {
    return NextResponse.json(
      { success: false, message: validation.message },
      { status: 400 }
    );
  }

  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const newCustomer = await addCustomer({
    ...(validation.data as CustomerInput),
    user_id: user.id,
  });

  return NextResponse.json({
    success: true,
    customer: newCustomer,
  });
}

export async function DELETE(request: Request) {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const customerId = Number(id);

  if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(customerId) || customerId <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid customer ID" },
      { status: 400 }
    );
  }

  const result = await deleteCustomer(customerId, user.id);
  if (result === true) {
    return NextResponse.json({ success: true });
  } else if (result === false) {
    return NextResponse.json(
      { success: false, message: "Customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: false }, { status: 500 });
}

export async function PUT(request: Request) {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const customerId = Number(id);

  if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(customerId) || customerId <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid customer ID" },
      { status: 400 }
    );
  }

  const body = await parseJsonBody(request);
  const validation = validateCustomerBody(body, false);

  if (!validation.data) {
    return NextResponse.json(
      { success: false, message: validation.message },
      { status: 400 }
    );
  }

  const updatedCustomer = await updateCustomer(customerId, user.id, validation.data);
  if (updatedCustomer) {
    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } else if (updatedCustomer === undefined) {
    return NextResponse.json(
      { success: false, message: "Customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: false }, { status: 500 });
}