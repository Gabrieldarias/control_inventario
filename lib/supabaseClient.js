import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

export const createSupabaseServerClient = (cookieStore) => {
  const resolveStore = () =>
    typeof cookieStore === "function" ? cookieStore() : cookieStore;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const store = resolveStore();
        if (store?.getAll) {
          return store.getAll();
        }
        return [];
      },
      setAll(cookiesToSet) {
        const store = resolveStore();
        if (!store?.set) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options);
        });
      },
    },
  });
};

export const createSupabaseRouteClient = (cookieStore) =>
  createSupabaseServerClient(cookieStore);
