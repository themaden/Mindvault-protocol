import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

function normalizeBackendOrigin(rawValue: string): string {
  try {
    const parsed = new URL(rawValue);
    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

const backendOrigin = normalizeBackendOrigin(process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL);

type RouteContext = {
  params: { path?: string[] } | Promise<{ path?: string[] }>;
};

async function resolvePathSegments(context: RouteContext): Promise<string[]> {
  const params = await context.params;
  return params.path ?? [];
}

async function proxyToBackend(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const pathSegments = await resolvePathSegments(context);
  const targetUrl = new URL(`/api/v1/${pathSegments.join("/")}`, `${backendOrigin}/`);
  targetUrl.search = request.nextUrl.searchParams.toString();

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("origin");
  headers.delete("referer");

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: backendResponse.headers,
    });
  } catch {
    return NextResponse.json(
      {
        detail: `Backend is unreachable at ${backendOrigin}. Start backend with: uvicorn main:app --reload --host 0.0.0.0 --port 8000`,
      },
      { status: 502 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context);
}
