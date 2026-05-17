import { NextRequest, NextResponse } from "next/server";

const INVENTORY_URL = process.env.INVENTORY_URL ?? "http://127.0.0.1:4001";
const ORDER_URL = process.env.ORDER_URL ?? "http://127.0.0.1:4002";
const ADMINCONF_URL = process.env.ADMINCONF_URL ?? "http://127.0.0.1:4003";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamPath = Array.isArray(path) ? path.join("/") : "";

  // Dynamic Routing based on path prefix
  let targetBaseUrl = "";
  if (upstreamPath.startsWith("units") || upstreamPath.startsWith("products")) {
    targetBaseUrl = INVENTORY_URL;
  } else if (upstreamPath.startsWith("purchaseOrders") || upstreamPath.startsWith("lineItems")) {
    targetBaseUrl = ORDER_URL;
  } else if (upstreamPath.startsWith("admin")) {
    targetBaseUrl = ADMINCONF_URL;
  } else {
    // If no specific service matches, we return a 404 since the monolith is gone
    return NextResponse.json({ error: `Path /api/monolith/${upstreamPath} not mapped to any microservice` }, { status: 404 });
  }

  const targetUrl = `${targetBaseUrl}/api/${upstreamPath}${request.nextUrl.search}`;

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
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
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
