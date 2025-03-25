import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const row_id = searchParams.get("row_id");

  if (!row_id) {
    return NextResponse.json(
      { error: "Missing row_id parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `${process.env.BASE_API}/unsubscribe?row_id=${row_id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const row_id = searchParams.get("row_id");

  if (!row_id) {
    return NextResponse.json(
      { error: "Missing row_id parameter" },
      { status: 400 }
    );
  }

  const requestBody = {
    is_subscriber_YN: 0,
    is_active_YN: 0,
  };

  try {
    const response = await axios.put(
      `${process.env.BASE_API}/unsubscribe?row_id=${row_id}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
