/**
 * ⚠️ EXAMPLE — delete the whole `src/features/example/` folder when starting a
 * real project.
 *
 * The feature's service layer: it knows the API routes and returns domain
 * types. Note that it goes through `httpClient` and never calls `fetch`
 * directly (rule R5).
 */
import { httpClient } from "@/services/http";

import type { Post } from "../types";

export const exampleService = {
  fetchPost: (id: number, signal?: AbortSignal) =>
    httpClient.get<Post>(`/posts/${id}`, { signal }),
};
