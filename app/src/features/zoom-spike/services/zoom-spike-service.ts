/** ⚠️ SPIKE — see types.ts. */
import { env } from "@/config/env";
import { httpClient } from "@/services/http";

import type { TranscriptionMessage } from "../types";

export const zoomSpikeService = {
  fetchToken(sessionName: string, role: 0 | 1, signal?: AbortSignal) {
    const url = `${env.spikeServerUrl}/token?session=${encodeURIComponent(
      sessionName,
    )}&role=${role}`;
    return httpClient.get<{ token: string }>(url, { signal });
  },

  postTranscript(message: Omit<TranscriptionMessage, "origin">) {
    return httpClient.post(`${env.spikeServerUrl}/transcript`, message);
  },
};
