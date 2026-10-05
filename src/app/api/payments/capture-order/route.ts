import { NextRequest, NextResponse } from "next/server";
import { fulfillPayment } from "@/lib/door/fulfill";
import { jsonError } from "@/lib/door/http";
import { readPayToken } from "@/lib/door/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const header = request.headers.get("x-pay-token") || String(body.token || "");
    const token = await readPayToken(header);
    const result = await fulfillPayment(token, String(body.orderID || token.paypalOrderId), body.payment_method);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
