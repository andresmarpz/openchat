import { createClient } from "~/lib/supabase/client";

class SupabaseService {
  async getClientToken() {
    const client = createClient();
    const {
      data: { session },
    } = await client.auth.getSession();
    const token = session?.access_token;

    return token;
  }
}

export const supabaseService = new SupabaseService();
