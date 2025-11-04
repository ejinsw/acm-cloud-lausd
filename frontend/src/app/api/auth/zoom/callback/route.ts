import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/profile?error=${encodeURIComponent(
            "Authorization code not provided"
          )}`,
          request.url
        )
      );
    }

    // Get Zoom config from environment variables
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = process.env.ZOOM_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Zoom OAuth callback - Missing config:", {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri,
      });
      return NextResponse.redirect(
        new URL(
          `/profile?error=${encodeURIComponent(
            "Zoom OAuth not configured properly"
          )}`,
          request.url
        )
      );
    }

    // Extract userId from state
    let userId: string | null = null;
    console.log("Zoom OAuth callback - Received state:", state);
    if (state) {
      try {
        const decoded = Buffer.from(state, "base64").toString();
        console.log("Zoom OAuth callback - Decoded state:", decoded);
        // Split on last dash to separate userId from timestamp
        const lastDashIndex = decoded.lastIndexOf("-");
        if (lastDashIndex > 0) {
          userId = decoded.substring(0, lastDashIndex);
          const timestamp = decoded.substring(lastDashIndex + 1);
          console.log("Zoom OAuth callback - Extracted userId:", userId);
          console.log("Zoom OAuth callback - Extracted timestamp:", timestamp);
        } else {
          console.error(
            "Zoom OAuth callback - Invalid state format (no dash found)"
          );
        }
      } catch (e) {
        console.error("Failed to decode state:", e);
      }
    }

    if (!userId) {
      console.error("Zoom OAuth callback - No userId extracted from state");
      return NextResponse.redirect(
        new URL("/profile?error=invalid_state", request.url)
      );
    }

    // Exchange authorization code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    let tokenResponse;
    try {
      const tokenRequest = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenRequest.ok) {
        const errorData = await tokenRequest.json().catch(() => ({}));
        throw new Error(
          errorData.error_description ||
            errorData.error ||
            `Token exchange failed: ${tokenRequest.status}`
        );
      }

      tokenResponse = { data: await tokenRequest.json() };
    } catch (error: unknown) {
      console.error("Zoom OAuth callback - Token exchange failed:", error);
      const errorMessage =
        (error as { message?: string })?.message ||
        "Failed to exchange authorization code";
      return NextResponse.redirect(
        new URL(
          `/profile?error=${encodeURIComponent(errorMessage)}`,
          request.url
        )
      );
    }

    // Log full token response for debugging
    console.log(
      "Zoom OAuth callback - Token response:",
      JSON.stringify(tokenResponse.data, null, 2)
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const expiresIn = tokenResponse.data.expires_in || 3600;
    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    // Validate access token exists
    if (!accessToken) {
      console.error(
        "Zoom OAuth callback - Access token not received from Zoom"
      );
      return NextResponse.redirect(
        new URL("/profile?error=access_token_not_received", request.url)
      );
    }

    console.log(
      "Zoom OAuth callback - Storing tokens temporarily for userId:",
      userId
    );
    console.log(
      "Zoom OAuth callback - Access token length:",
      accessToken?.length || 0
    );
    console.log(
      "Zoom OAuth callback - Refresh token length:",
      refreshToken?.length || 0
    );

    // Store tokens temporarily in backend (keyed by state)
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://backend:8080"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      const storeRequest = await fetch(
        `${backendUrl}/api/zoom/tokens/temporary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: state,
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiryDate: expiryDate.toISOString(),
            userId: userId,
          }),
        }
      );

      if (!storeRequest.ok) {
        const errorData = await storeRequest.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to store tokens: ${storeRequest.status}`
        );
      }

      const storeResponseData = await storeRequest.json();
      console.log(
        "Zoom OAuth callback - Tokens stored temporarily:",
        storeResponseData
      );

      // Redirect to frontend with state - frontend will retrieve and store tokens permanently
      if (state) {
        return NextResponse.redirect(
          new URL(
            `/profile?zoom_auth=processing&state=${encodeURIComponent(state)}`,
            request.url
          )
        );
      } else {
        return NextResponse.redirect(
          new URL("/profile?error=missing_state", request.url)
        );
      }
    } catch (storeError: unknown) {
      console.error(
        "Zoom OAuth callback - Failed to store tokens temporarily:",
        storeError
      );
      const errorMessage =
        (storeError as { message?: string })?.message ||
        "Failed to store tokens temporarily";
      return NextResponse.redirect(
        new URL(
          `/profile?error=${encodeURIComponent(errorMessage)}`,
          request.url
        )
      );
    }
  } catch (error: unknown) {
    console.error("Zoom OAuth callback error:", error);
    const errorMessage =
      (error as { message?: string })?.message || "oauth_failed";
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
