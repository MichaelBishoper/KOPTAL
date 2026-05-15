import { NextRequest, NextResponse } from "next/server";

const IAM_URL = process.env.IAM_URL ?? process.env.NEXT_PUBLIC_IAM_URL ?? "http://localhost:3001";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyToIam(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamPath = Array.isArray(path) ? path.join("/") : "";
  const search = request.nextUrl.search;
  const targetUrl = `${IAM_URL}/api/${upstreamPath}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  const token = request.cookies.get("koptal_token")?.value;

  if (contentType) headers.set("content-type", contentType);
  if (authorization) {
    headers.set("authorization", authorization);
  } else if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    requestInit.body = await request.text();
  }

  try {
    const upstream = await fetch(targetUrl, requestInit);
    const body = await upstream.arrayBuffer();

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "IAM service unavailable" }, { status: 503 });
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyToIam(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyToIam(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyToIam(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyToIam(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyToIam(request, context);
}
