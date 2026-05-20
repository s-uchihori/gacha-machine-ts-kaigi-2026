interface Env {
  ASSETS: Fetcher;
  BASIC_USER: string;
  BASIC_PASS: string;
}

const REALM = 'Basic realm="ASSIGN Gacha", charset="UTF-8"';
const encoder = new TextEncoder();

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    // 長さを比較で漏らさないために自身と比較した結果を反転する
    return !crypto.subtle.timingSafeEqual(aBytes, aBytes);
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function unauthorized(message = "Authentication required."): Response {
  return new Response(message, {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return unauthorized();
    }

    const [scheme, encoded] = authorization.split(" ");
    if (!encoded || scheme !== "Basic") {
      return new Response("Malformed authorization header.", { status: 400 });
    }

    let user: string;
    let pass: string;
    try {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      if (idx < 0) {
        return new Response("Malformed credentials.", { status: 400 });
      }
      user = decoded.substring(0, idx);
      pass = decoded.substring(idx + 1);
    } catch {
      return new Response("Invalid base64 in authorization header.", { status: 400 });
    }

    if (
      !timingSafeEqual(env.BASIC_USER, user) ||
      !timingSafeEqual(env.BASIC_PASS, pass)
    ) {
      return unauthorized("Invalid credentials.");
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
