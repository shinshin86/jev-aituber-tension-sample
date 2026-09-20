import type { FormEvent, KeyboardEvent, RefObject } from 'react'

type CommentInputProps = {
  value: string
  loading: boolean
  apiKeyConfigured: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
  onSubmit: () => void
}

const SAMPLE_COMMENTS = ['今日かわいいね！', 'こんにちは', 'もう配信終わっていいよ'] as const

export function CommentInput({
  value,
  loading,
  apiKeyConfigured,
  inputRef,
  onChange,
  onSubmit,
}: CommentInputProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.nativeEvent.isComposing) {
      event.preventDefault()
    }
  }

  return (
    <form className="comment-form" onSubmit={submit}>
      <label htmlFor="viewer-comment">VIEWER COMMENT</label>
      <div className="comment-control">
        <span className="prompt-mark" aria-hidden="true">›</span>
        <input
          ref={inputRef}
          id="viewer-comment"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={apiKeyConfigured ? 'コメントを入力...' : '先に API Key を設定してください'}
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'JUDGING...' : 'SEND'}
        </button>
      </div>
      <div className="sample-comments" aria-label="サンプルコメント">
        <span>SAMPLES</span>
        {SAMPLE_COMMENTS.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={loading}
            onClick={() => {
              onChange(sample)
              inputRef.current?.focus()
            }}
          >
            {sample}
          </button>
        ))}
      </div>
    </form>
  )
}
