// XSS Sanitization Utilities
// Prevents cross-site scripting attacks through user content

// Escape HTML entities to prevent XSS in plain text
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char]);
}

// Sanitize user-generated content for safe storage/display
// Removes potentially dangerous HTML while preserving safe content
export function sanitizeContent(content: string): string {
  // Remove script tags and content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, "data-blocked:");
  
  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript:/gi, "");
  
  // Remove style tags (can contain expressions)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");
  
  // Remove object/embed tags
  sanitized = sanitized.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, "");
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "");
  
  // Remove expression() in CSS
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, "");
  
  return sanitized.trim();
}

// Sanitize a URL to prevent javascript: and other dangerous protocols
// Returns null if URL is invalid or dangerous
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow safe protocols
    const safeProtocols = ["http:", "https:"];
    if (!safeProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.href;
  } catch {
    // Invalid URL
    return null;
  }
}

// Sanitize for plain text display (complete HTML escaping)
export function sanitizePlainText(text: string): string {
  return escapeHtml(text.trim());
}

// Sanitize a message (basic escaping, no HTML allowed)
export function sanitizeMessage(message: string, maxLength = 5000): string {
  // Trim and limit length
  let sanitized = message.trim().substring(0, maxLength);
  
  // Escape HTML
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
}

// Sanitize for JSON storage (removes null bytes and control characters)
export function sanitizeForJson(text: string): string {
  // Remove null bytes
  let sanitized = text.replace(/\0/g, "");
  
  // Remove other control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  return sanitized;
}

// Check if content contains potentially dangerous patterns
// Used for logging/alerting on suspicious content
export function hasSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
  ];
  
  return suspiciousPatterns.some((pattern) => pattern.test(content));
}
