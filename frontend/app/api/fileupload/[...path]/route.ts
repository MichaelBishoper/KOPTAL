import { NextRequest, NextResponse } from "next/server";

const FILEUPLOAD_URL = process.env.FILEUPLOAD_URL ?? process.env.NEXT_PUBLIC_FILEUPLOAD_URL ?? "http://127.0.0.1:3002";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamPath = Array.isArray(path) ? path.join("/") : "";
  const targetUrl = `${FILEUPLOAD_URL}/${upstreamPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);

    const buf = await upstream.arrayBuffer();
    if (!upstream.ok) {
      // try to extract text/json body for debugging
      let debugBody = null;
      try { debugBody = await new TextDecoder().decode(buf); } catch (e) { /* ignore */ }
      return new NextResponse(JSON.stringify({ error: 'Upstream fileupload error', status: upstream.status, body: debugBody }), { status: 502, headers: { 'content-type': 'application/json' } });
    }

    return new NextResponse(buf, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "File upload service unavailable" }, { status: 503 });
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
