import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChannelSwitcher from '../forum/ChannelSwitcher.jsx';

const db = {
  nasa: [{ id: 'n1', author: 'Mission Control', text: 'Go for launch', timestamp: '2026-11-16T01:00:00.000Z' }],
  'esports-tribunal': [{ id: 'e1', author: 'Referee', text: 'Round paused', timestamp: '2026-11-16T01:00:00.000Z' }],
  notNasa: [{ id: 'x1', author: 'Skeptic', text: 'Shadows?', timestamp: '2026-11-16T01:00:00.000Z' }],
};

function json(body, status = 200) {
  return Promise.resolve({ ok: status < 400, status, json: async () => body });
}

let fetchMock;
beforeEach(() => {
  const store = structuredClone(db);
  fetchMock = vi.fn((url, init = {}) => {
    const forum = decodeURIComponent(url.split('/').at(-1));
    if (init.method === 'POST') {
      const { author, text } = JSON.parse(init.body);
      if (!author || !text) return json({ error: 'Missing required fields' }, 400);
      const msg = { id: `new-${store[forum].length}`, author, text, timestamp: '2026-11-16T02:00:00.000Z' };
      store[forum].push(msg);
      return json(msg, 201);
    }
    return json(store[forum]);
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('WBS 1.4.4 — ChannelSwitcher UI', () => {
  it('offers the three channels and marks the selected one with aria-pressed', async () => {
    render(<ChannelSwitcher />);
    const channels = within(screen.getByRole('navigation', { name: /channels/i })).getAllByRole('button');
    expect(channels.map((b) => b.textContent)).toEqual(['NASA', 'Esports Tribunal', 'Not NASA']);
    expect(screen.getByRole('button', { name: 'NASA' })).toHaveAttribute('aria-pressed', 'true');
    await screen.findByText('Go for launch');
  });

  it('announces loading through an aria-live="polite" status region', async () => {
    render(<ChannelSwitcher />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent(/loading/i);
    await screen.findByText('Go for launch');
    expect(status).toHaveTextContent(/1 message/i);
  });

  it('renders messages in a <dl> with author as <dt> and text as <dd>', async () => {
    const { container } = render(<ChannelSwitcher />);
    await screen.findByText('Go for launch');
    const list = container.querySelector('dl.messages');
    expect(list).toBeInTheDocument();
    expect(within(list).getByRole('term')).toHaveTextContent('Mission Control');
    expect(within(list).getByRole('definition')).toHaveTextContent('Go for launch');
  });

  it('switches channel and fetches the new forum', async () => {
    const user = userEvent.setup();
    render(<ChannelSwitcher />);
    await screen.findByText('Go for launch');

    await user.click(screen.getByRole('button', { name: 'Esports Tribunal' }));
    expect(await screen.findByText('Round paused')).toBeInTheDocument();
    expect(screen.queryByText('Go for launch')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Esports Tribunal' })).toHaveAttribute('aria-pressed', 'true');
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/api\/messages\/esports-tribunal$/),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('posts a message through the form and shows it after refetch', async () => {
    const user = userEvent.setup();
    render(<ChannelSwitcher />);
    await screen.findByText('Go for launch');

    await user.type(screen.getByLabelText('Your name'), 'Ada');
    await user.type(screen.getByLabelText('Message'), 'Telemetry nominal');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText('Telemetry nominal')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });

  it('shows an alert with a working Retry button when the API is down', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')));
    render(<ChannelSwitcher />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Failed to fetch/);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByText('Go for launch')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
