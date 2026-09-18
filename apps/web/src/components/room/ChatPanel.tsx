
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/features/chat/chat.api";
import type { ChatMessage } from "@/features/chat/chat.types";
import { useWebSocket } from "@/providers/WebSocketProvider";

interface ChatPanelProps {
  roomId: string;
  accessToken: string;
}

export function ChatPanel({
  roomId,
  accessToken,
}: ChatPanelProps) {
  const { socket, isConnected } =
    useWebSocket();

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Load persistent chat history.
   *
   * HTTP
   *   ↓
   * NestJS
   *   ↓
   * PostgreSQL
   */
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError("");

    getMessages(
      roomId,
      accessToken,
    )
      .then((data) => {
        if (!cancelled) {
          /*
           * Backend returns newest -> oldest.
           * Chat UI displays oldest -> newest.
           */
          setMessages(
            [...data].reverse(),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Unable to load messages.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    roomId,
    accessToken,
  ]);

  /*
   * WebSocket events.
   */
  useEffect(() => {
    if (!socket) {
      return;
    }

    /*
     * Server acknowledgement.
     *
     * ACK only tells us that the server
     * successfully processed the request.
     *
     * payload:
     * {
     *   messageId: string;
     * }
     */
    function handleAck(event: unknown) {
      console.log(
        "CHAT ACK RECEIVED:",
        event,
      );

      const data = event as {
        requestId?: string;
        payload?: {
          messageId?: string;
        };
      };

      if (!data.payload?.messageId) {
        console.error(
          "Invalid chat acknowledgement:",
          data,
        );

        setError(
          "Message was not acknowledged.",
        );

        setIsSending(false);

        return;
      }

      /*
       * The message itself will arrive through
       * chat.message.
       */
      setMessage("");
      setIsSending(false);
    }

    /*
     * Canonical message from the server.
     *
     * The backend sends this to everyone in
     * the room, including the sender.
     */
    function handleChatMessage(
      event: unknown,
    ) {
      console.log(
        "CHAT MESSAGE RECEIVED:",
        event,
      );

      const data = event as {
        payload?: ChatMessage;
      };

      const incomingMessage =
        data.payload;

      if (!incomingMessage) {
        return;
      }

      /*
       * Make sure this message belongs
       * to the currently displayed room.
       */
      if (
        incomingMessage.roomId !== roomId
      ) {
        return;
      }

      setMessages(
        (currentMessages) => {
          /*
           * Prevent duplicate messages.
           *
           * This becomes important when we
           * later implement reconnection/retries.
           */
          const alreadyExists =
            currentMessages.some(
              (item) =>
                item.id ===
                incomingMessage.id,
            );

          if (alreadyExists) {
            return currentMessages;
          }

          return [
            ...currentMessages,
            incomingMessage,
          ];
        },
      );
    }

    function handleError(event: unknown) {
      console.error(
        "CHAT SOCKET ERROR:",
        event,
      );

      setError(
        "Unable to send message.",
      );

      setIsSending(false);
    }

    socket.on(
      "chat.send.ack",
      handleAck,
    );

    socket.on(
      "chat.message",
      handleChatMessage,
    );

    socket.on(
      "error",
      handleError,
    );

    return () => {
      socket.off(
        "chat.send.ack",
        handleAck,
      );

      socket.off(
        "chat.message",
        handleChatMessage,
      );

      socket.off(
        "error",
        handleError,
      );
    };
  }, [
    socket,
    roomId,
  ]);

  /*
   * Send a new message.
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content =
      message.trim();

    if (
      !content ||
      !socket ||
      !isConnected ||
      isSending
    ) {
      return;
    }

    const requestId =
      crypto.randomUUID();

    console.log(
      "SENDING CHAT MESSAGE:",
      {
        requestId,
        roomId,
        content,
      },
    );

    setIsSending(true);
    setError("");

    socket.emit(
      "chat.send",
      {
        type: "chat.send",
        requestId,
        timestamp: Date.now(),
        payload: {
          roomId,
          content,
        },
      },
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-medium">
          Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading && (
          <p className="text-sm text-[var(--muted)]">
            Loading messages...
          </p>
        )}

        {error && (
          <p className="mb-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        {!isLoading &&
          !error &&
          messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[var(--muted)]">
                No messages yet.
              </p>
            </div>
          )}

        <div className="space-y-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className="flex gap-3"
            >
              <Avatar
                username={
                  item.sender.username
                }
                avatarUrl={
                  item.sender.avatarUrl
                }
                size="sm"
              />

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {item.sender.username}
                  </span>

                  <time className="text-xs text-[var(--muted-foreground)]">
                    {new Date(
                      item.createdAt,
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </time>
                </div>

                <p className="mt-1 break-words text-sm text-[var(--muted)]">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--border)] p-3"
      >
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            placeholder={
              isConnected
                ? "Type a message..."
                : "Connecting..."
            }
            disabled={
              !isConnected ||
              isSending
            }
            maxLength={2000}
            className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          />

          <Button
            type="submit"
            disabled={
              !message.trim() ||
              !isConnected ||
              isSending
            }
          >
            {isSending
              ? "Sending..."
              : "Send"}
          </Button>
        </div>
      </form>
    </section>
  );
}

