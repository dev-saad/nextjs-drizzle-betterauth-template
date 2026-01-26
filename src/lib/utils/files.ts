export function getStorageUrl(key: string | null | undefined) {
 if (!key) return undefined; // Return a default placeholder if no key

 // If the key is already a full URL (e.g. from Google Auth), return it as is
 if (key.startsWith("http://") || key.startsWith("https://")) {
  return key;
 }

 // Construct the full URL
 // Ensure no double slashes if the env var has a trailing slash
 const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_BASE_URL?.replace(
  /\/$/,
  "",
 );
 return `${baseUrl}/${key}`;
}
