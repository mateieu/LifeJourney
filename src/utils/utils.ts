/**
 * Encodes a URL parameter to be safely used in a redirect
 * @param type The type of message (error, success, info)
 * @param path The base path to redirect to
 * @param message The message to include in the redirect
 * @returns A redirect URL with encoded parameters
 */
export function encodedRedirect(
  type: "error" | "success" | "info",
  path: string,
  message: string
): string {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("message", message);
  
  return `${path}?${params.toString()}`;
}

/**
 * Handles loading state for async operations
 * @param callback The async function to execute
 * @param setLoading The state setter for loading status
 */
export async function withLoading<T>(
  callback: () => Promise<T>,
  setLoading: (isLoading: boolean) => void
): Promise<T> {
  setLoading(true);
  try {
    return await callback();
  } finally {
    setLoading(false);
  }
}

/**
 * Formats a date to a human-readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
} 