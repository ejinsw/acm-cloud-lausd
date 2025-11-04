import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/actions/authentication";

export async function GET(request: NextRequest) {
  try {
    // Get the access token from the request
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    // If no token in header, try to get from cookies/session
    if (!token) {
      token = await getToken();
    }

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    // Decode token to get user ID
    let userId: string | null = null;
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );
        userId = payload.sub || payload.id;
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in token" },
        { status: 401 }
      );
    }

    // Check if user is an instructor by calling backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const userResponse = await fetch(`${backendUrl}/api/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { message: "Failed to verify user" },
        { status: 403 }
      );
    }

    const userData = await userResponse.json();
    const user = userData.user || userData;

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { message: "Only instructors can authorize Zoom" },
        { status: 403 }
      );
    }

    // Get Zoom config from environment variables
    const clientId = process.env.ZOOM_CLIENT_ID;
    const redirectUri = process.env.ZOOM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { message: "Zoom OAuth not configured properly" },
        { status: 500 }
      );
    }

    // Generate state to prevent CSRF attacks
    const state = Buffer.from(`${userId}-${Date.now()}`).toString("base64");

    // Build Zoom OAuth authorization URL
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    return NextResponse.json({
      authUrl: authUrl,
      state: state,
    });
  } catch (error: any) {
    console.error("Zoom authorization error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
