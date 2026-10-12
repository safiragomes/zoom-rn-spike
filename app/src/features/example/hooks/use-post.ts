/**
 * ⚠️ EXAMPLE — delete the whole `src/features/example/` folder when starting a
 * real project.
 *
 * The feature's hook: it owns the async state so the component stays free of
 * loading logic. It aborts the request on unmount so it never updates state of
 * a component that already left the screen.
 *
 * Transitions live in a `useReducer` and the fetch lives inside an async
 * function: calling `setState` straight from the effect body triggers cascading
 * renders, and the `react-hooks/set-state-in-effect` rule flags it.
 */
import { useCallback, useEffect, useReducer } from "react";

import { HttpError } from "@/services/http";

import { exampleService } from "../services/example-service";
import type { Post } from "../types";

type State = {
  post: Post | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "loading" }
  | { type: "success"; post: Post }
  | { type: "failure"; message: string };

const INITIAL_STATE: State = { post: null, loading: true, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "success":
      return { post: action.post, loading: false, error: null };
    case "failure":
      return { post: null, loading: false, error: action.message };
    default:
      return state;
  }
}

function messageFor(cause: unknown): string {
  return cause instanceof HttpError && cause.isNetworkError
    ? "No connection. Check your internet and try again."
    : "Could not load the content.";
}

export type UsePostResult = State & {
  reload: () => void;
};

export function usePost(id: number): UsePostResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [attempt, retry] = useReducer((n: number) => n + 1, 0);

  const reload = useCallback(() => retry(), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      dispatch({ type: "loading" });
      try {
        const post = await exampleService.fetchPost(id, controller.signal);
        if (active) dispatch({ type: "success", post });
      } catch (cause) {
        if (active) dispatch({ type: "failure", message: messageFor(cause) });
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, attempt]);

  return { ...state, reload };
}
