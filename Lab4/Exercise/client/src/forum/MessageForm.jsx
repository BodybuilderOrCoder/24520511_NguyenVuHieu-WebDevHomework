import { useId, useState } from 'react';

export default function MessageForm({ channelLabel, onSend }) {
  const authorId = useId();
  const textId = useId();
  const errorId = useId();
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  // Derived — no effect, no extra "isValid" state.
  const canSend = author.trim() !== '' && text.trim() !== '' && !sending;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    setSendError(null);
    try {
      await onSend({ author, text });
      setText('');
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit} aria-label={`Post to ${channelLabel}`}>
      <p className="field">
        <label htmlFor={authorId}>Your name</label>
        <input
          id={authorId}
          value={author}
          maxLength={40}
          autoComplete="name"
          onChange={(e) => setAuthor(e.target.value)}
        />
      </p>
      <p className="field">
        <label htmlFor={textId}>Message</label>
        <textarea
          id={textId}
          value={text}
          maxLength={500}
          rows={3}
          aria-invalid={Boolean(sendError)}
          aria-describedby={sendError ? errorId : undefined}
          onChange={(e) => setText(e.target.value)}
        />
      </p>
      {sendError && (
        <p id={errorId} role="alert" className="field-error">
          {sendError}
        </p>
      )}
      <button type="submit" disabled={!canSend}>
        {sending ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
