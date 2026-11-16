import { Fragment, useState } from 'react';
import MessageForm from './MessageForm.jsx';
import { useForumMessages } from './useForumMessages.js';
import './forum.css';

export const CHANNELS = [
  { id: 'nasa', label: 'NASA' },
  { id: 'esports-tribunal', label: 'Esports Tribunal' },
  { id: 'notNasa', label: 'Not NASA' },
];

const timeFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function ChannelSwitcher({ initialChannel = CHANNELS[0].id }) {
  const [forum, setForum] = useState(initialChannel);
  const { data, loading, error, postMessage, refetch } = useForumMessages(forum);
  const channel = CHANNELS.find((c) => c.id === forum);

  const statusText = loading
    ? `Loading #${channel.label} messages…`
    : error
      ? ''
      : `${data.length} message${data.length === 1 ? '' : 's'} in #${channel.label}`;

  return (
    <div className="forum">
      <nav aria-label="Channels">
        <ul className="channel-list">
          {CHANNELS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="channel-button"
                aria-pressed={c.id === forum}
                onClick={() => setForum(c.id)}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="channel" aria-labelledby="channel-title" aria-busy={loading}>
        <h2 id="channel-title">#{channel.label}</h2>
        <output className="channel-status" aria-live="polite">
          {statusText}
        </output>

        {error && (
          <div className="channel-error" role="alert">
            <p>Could not load messages: {error}</p>
            <button type="button" onClick={refetch}>
              Retry
            </button>
          </div>
        )}

        <dl className="messages" aria-label={`Messages in ${channel.label}`}>
          {data.map((msg) => (
            <Fragment key={msg.id}>
              <dt>
                {msg.author} <time dateTime={msg.timestamp}>{timeFormat.format(new Date(msg.timestamp))}</time>
              </dt>
              <dd>{msg.text}</dd>
            </Fragment>
          ))}
        </dl>

        <MessageForm channelLabel={channel.label} onSend={postMessage} />
      </section>
    </div>
  );
}
