import { apiFetch } from "@/lib/api/client";

import type { ChatMessage } from "./chat.types";

export async function getMessages(
  roomId: string,
  accessToken: string,
) {
  return apiFetch<ChatMessage[]>(
    `/rooms/${roomId}/messages`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );
}