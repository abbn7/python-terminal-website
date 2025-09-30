export async function onRequest(context) {
  const response = await context.next();
  
  // Add CORS headers for Pyodide
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Set proper MIME type for WASM files
  if (context.request.url.endsWith('.wasm')) {
    response.headers.set('Content-Type', 'application/wasm');
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
