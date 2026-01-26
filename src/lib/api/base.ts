import { APP_URL } from "../constants/config";
export type ApiFetchOptions<B = any> = {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 params?: Record<string, any>;
 cache?: RequestCache;
 next?: { revalidate?: number | false };
 headers?: HeadersInit;
 body?: B;
 method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

export async function apiGet<T, B = any>(
 path: string,
 opts: ApiFetchOptions<B> = {}
) {
 /* const base = "http://localhost:3000"; */
 const url = new URL(path, APP_URL);

 if (opts.params) {
  Object.entries(opts.params).forEach(([k, v]) => {
   if (v === undefined || v === null || v === "") return;
   url.searchParams.set(k, String(v));
  });
 }

 let body: BodyInit | undefined;
 if (opts.body) {
  if (
   typeof opts.body === "string" ||
   opts.body instanceof Blob ||
   opts.body instanceof FormData ||
   opts.body instanceof URLSearchParams
  ) {
   body = opts.body as BodyInit;
  } else {
   body = JSON.stringify(opts.body);
  }
 }

 const res = await fetch(url.toString(), {
  cache: opts.cache ?? "no-store",
  next: opts.next,
  headers: {
   "Content-Type": "application/json",
   ...opts.headers,
  },
  body,
  method: opts.method,
 });

 if (!res.ok) {
  const text = await res.text().catch(() => "");
  return Promise.reject(
   new Error(`API GET ${path} failed: ${res.status} ${text}`)
  );
 }

 return (await res.json()) as T;
}
