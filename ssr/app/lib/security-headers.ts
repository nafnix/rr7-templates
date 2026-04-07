const isProduction = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  isProduction ? "upgrade-insecure-requests" : "",
].filter(Boolean);

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    ...(isProduction
      ? { "Content-Security-Policy": cspDirectives.join("; ") }
      : { "Content-Security-Policy-Report-Only": cspDirectives.join("; ") }),
  };
}

export function applySecurityHeaders(responseHeaders: Headers): void {
  const securityHeadersMap = getSecurityHeaders();

  for (const [name, value] of Object.entries(securityHeadersMap)) {
    responseHeaders.set(name, value);
  }
}
