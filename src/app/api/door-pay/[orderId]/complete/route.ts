import { NextRequest, NextResponse } from "next/server";
import { completeDoorApplePay } from "@/lib/door/doorCharge";
import { jsonError } from "@/lib/door/http";
import { HttpError } from "@/lib/door/session";

const ORDER_ID = /^[A-Za-z0-9]{10,22}$/;

type Context = { params: Promise<{ orderId: string }> };

export async function POST(_request: NextRequest, context: Context) {
  try {
    const { orderId } = await context.params;
    if (!ORDER_ID.test(orderId)) throw new HttpError("Unknown payment", 404);
    return NextResponse.json(await completeDoorApplePay(orderId));
  } catch (error) {
    return jsonError(error);
  }
}
