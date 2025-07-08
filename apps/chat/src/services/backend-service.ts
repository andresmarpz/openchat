import { supabaseService } from "~/services/supabase-service";

class BackendService {
  private readonly baseUrl = "http://localhost:8000/api/v1";

  async getThreads({
    cursor,
    limit = 20,
    direction = "forward",
  }: {
    cursor?: string;
    limit: number;
    direction: "forward" | "backward";
  }) {
    const token = await supabaseService.getClientToken();

    const urlBuilder = new URLSearchParams();
    if (cursor) urlBuilder.set("cursor", cursor);
    if (limit) urlBuilder.set("limit", String(limit));
    if (direction) urlBuilder.set("direction", direction);

    const response = await fetch(
      `${this.baseUrl}/threads?${urlBuilder.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }
}

export const backendService = new BackendService();
