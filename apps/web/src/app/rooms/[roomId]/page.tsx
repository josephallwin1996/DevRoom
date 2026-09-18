"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { RoomWorkspace } from "@/components/room/RoomWorkspace";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api/client";
import type { RoomListItem } from "@/features/room/room.types";
import { useRoomRealtime } from "@/hooks/useRoomRealtime";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function RoomPage({
  params,
}: RoomPageProps) {
  const router = useRouter();

  const {
    accessToken,
    user,
    isLoading: authLoading,
  } = useAuth();

  const [room, setRoom] =
    useState<RoomListItem | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * Hooks must always run in the same order.
   *
   * During the first render room is null, so
   * useRoomRealtime receives null and simply
   * waits until the room has loaded.
   */
  const roomId = room?.id ?? null;

  const { presenceUsers } =
    useRoomRealtime(roomId);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !accessToken) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadRoom() {
      const { roomId } = await params;

      try {
        const rooms =
          await apiFetch<RoomListItem[]>(
            "/rooms",
            {
              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            },
          );

        const foundRoom = rooms.find(
          (item) => item.id === roomId,
        );

        if (!foundRoom) {
          throw new Error(
            "Room not found",
          );
        }

        if (!cancelled) {
          setRoom(foundRoom);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load room.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRoom();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    authLoading,
    user,
    router,
    params,
  ]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted)]">
          Loading room...
        </p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            Room unavailable
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {error ||
              "The room could not be found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Back to rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <RoomWorkspace
      roomId={room.id}
      roomName={room.name}
      accessToken={accessToken}
      presenceUsers={presenceUsers}
    />
    </AppShell>
  );
}

