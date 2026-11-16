import { useCallback, useEffect, useState } from 'react';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const messagesUrl = (forumId) => `${API_BASE}/api/messages/${encodeURIComponent(forumId)}`;

async function readError(response) {
  try {
    const body = await response.json();
    if (body?.error) return body.error;
  } catch {
    // Non-JSON error body — fall back to the status code.
  }
  return `Request failed with HTTP ${response.status}`;
}

/**
 * @param {string} forumId
 * @returns {{ data: Array<{id: string, author: string, text: string, timestamp: string}>,
 *   loading: boolean, error: string | null, refetch: () => void,
 *   postMessage: (p: {author: string, text: string}) => Promise<object> }}
 */
export function useForumMessages(forumId) {
  const [version, setVersion] = useState(0);
  // One settled result, tagged with the request that produced it. `loading` is derived from
  // that tag instead of being set synchronously inside the effect (react/set-state-in-effect).
  const [result, setResult] = useState({ forumId: null, version: -1, data: [], error: null });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(messagesUrl(forumId), { signal: controller.signal });
        if (!response.ok) throw new Error(await readError(response));
        const messages = await response.json();
        if (!controller.signal.aborted) {
          setResult({ forumId, version, data: messages, error: null });
        }
      } catch (err) {
        // AbortError means *we* cancelled the request (switch/unmount) — not a user-facing error.
        if (!controller.signal.aborted && err.name !== 'AbortError') {
          setResult({ forumId, version, data: [], error: err.message || 'Network error' });
        }
      }
    })();

    return () => controller.abort();
  }, [forumId, version]);

  const postMessage = useCallback(
    async (payload) => {
      const response = await fetch(messagesUrl(forumId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: payload.author, text: payload.text }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const created = await response.json();
      setVersion((v) => v + 1); // refetch through the abortable effect
      return created;
    },
    [forumId]
  );

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  // Data that belongs to a previous forum is never exposed under the new forumId.
  const sameForum = result.forumId === forumId;
  const loading = !sameForum || result.version !== version;
  return {
    data: sameForum ? result.data : [],
    loading,
    error: sameForum && !loading ? result.error : null,
    postMessage,
    refetch,
  };
}
