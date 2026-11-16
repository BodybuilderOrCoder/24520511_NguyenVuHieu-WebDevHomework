import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE, useForumMessages } from '../forum/useForumMessages.js';

const msgs = (forum) => [{ id: `${forum}-1`, author: 'A', text: `hello ${forum}`, timestamp: '2026-11-16T00:00:00.000Z' }];

/**
 * fetch double that behaves like the real one: each call stays pending until the test resolves it,
 * and rejects with an AbortError as soon as its signal is aborted.
 */
function createControlledFetch() {
  const calls = [];
  const fetchMock = vi.fn((url, init = {}) => {
    return new Promise((resolve, reject) => {
      const call = {
        url,
        init,
        respond: (body, status = 200) =>
          resolve({ ok: status >= 200 && status < 300, status, json: async () => body }),
        fail: (err) => reject(err),
      };
      init.signal?.addEventListener('abort', () =>
        reject(new DOMException('The operation was aborted.', 'AbortError'))
      );
      calls.push(call);
    });
  });
  return { fetchMock, calls };
}

let consoleError;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
});
afterEach(() => {
  vi.unstubAllGlobals();
  consoleError.mockRestore();
});

describe('WBS 1.4.3 — useForumMessages (AbortController)', () => {
  it('starts loading, then exposes data for the forum', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useForumMessages('nasa'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    expect(calls[0].url).toBe(`${API_BASE}/api/messages/nasa`);
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);

    await act(async () => calls[0].respond(msgs('nasa')));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(msgs('nasa'));
    expect(result.current.error).toBeNull();
  });

  it('aborts the stale request on a rapid A → B switch and keeps B data (no race)', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ forum }) => useForumMessages(forum), {
      initialProps: { forum: 'nasa' },
    });
    rerender({ forum: 'esports-tribunal' });

    const callA = calls.find((c) => c.url.endsWith('/nasa'));
    const callB = calls.at(-1);
    expect(callA.init.signal.aborted).toBe(true);
    expect(callB.url).toMatch(/esports-tribunal$/);

    await act(async () => callB.respond(msgs('esports-tribunal')));
    // A late response for A must never overwrite B.
    await act(async () => callA.respond(msgs('nasa')));

    expect(result.current.data).toEqual(msgs('esports-tribunal'));
    expect(result.current.error).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('never shows the previous forum’s messages while the next forum is loading', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ forum }) => useForumMessages(forum), {
      initialProps: { forum: 'nasa' },
    });
    await act(async () => calls.at(-1).respond(msgs('nasa')));
    rerender({ forum: 'notNasa' });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('aborts on unmount without warnings or state updates', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = renderHook(() => useForumMessages('nasa'));
    unmount();
    expect(calls[0].init.signal.aborted).toBe(true);
    await act(async () => {});
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('exposes an error for HTTP failures and network failures', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ forum }) => useForumMessages(forum), {
      initialProps: { forum: 'nasa' },
    });
    await act(async () => calls.at(-1).respond({ error: 'Unknown forum' }, 404));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toMatch(/Unknown forum/);

    rerender({ forum: 'notNasa' });
    await act(async () => calls.at(-1).fail(new TypeError('Failed to fetch')));
    expect(result.current.error).toMatch(/Failed to fetch/);
    expect(result.current.data).toEqual([]);
  });

  it('postMessage sends a JSON POST and refetches the forum', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls.at(-1).respond(msgs('nasa')));

    let posted;
    await act(async () => {
      const pending = result.current.postMessage({ author: 'Ada', text: 'Hi' });
      calls.at(-1).respond({ id: 'new', author: 'Ada', text: 'Hi', timestamp: 't' }, 201);
      posted = await pending;
    });

    const post = calls.find((c) => c.init.method === 'POST');
    expect(post.url).toBe(`${API_BASE}/api/messages/nasa`);
    expect(post.init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(post.init.body)).toEqual({ author: 'Ada', text: 'Hi' });
    expect(posted.id).toBe('new');

    const refetch = calls.at(-1);
    expect(refetch.init.method).toBeUndefined();
    await act(async () => refetch.respond([...msgs('nasa'), posted]));
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });

  it('postMessage rejects with the server validation message on 400', async () => {
    const { fetchMock, calls } = createControlledFetch();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls.at(-1).respond(msgs('nasa')));

    await act(async () => {
      const pending = result.current.postMessage({ author: '', text: '' });
      calls.at(-1).respond({ error: 'Missing required fields' }, 400);
      await expect(pending).rejects.toThrow('Missing required fields');
    });
  });
});
