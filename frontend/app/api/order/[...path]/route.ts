import { NextRequest, NextResponse } from "next/server";

const ORDER_URL = process.env.ORDER_URL ?? "http://127.0.0.1:4002";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamPath = Array.isArray(path) ? path.join("/") : "";
  const targetUrl = `${ORDER_URL}/api/${upstreamPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const explicitAuth = request.headers.get("authorization");
  const cookieToken = request.cookies.get("koptal_token")?.value;
  if (explicitAuth) {
    headers.set("authorization", explicitAuth);
  } else if (cookieToken) {
    headers.set("authorization", `Bearer ${cookieToken}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const body = await upstream.arrayBuffer();
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);

    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`Proxy to ${targetUrl} failed:`, error.message);
    return NextResponse.json({ error: "Order service unavailable" }, { status: 503 });
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context);
}
