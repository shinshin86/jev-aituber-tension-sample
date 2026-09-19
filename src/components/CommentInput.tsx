import type { FormEvent, KeyboardEvent, RefObject } from 'react'

type CommentInputProps = {
  value: string
  loading: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
  onSubmit: () => void
}

export function CommentInput({
  value,
  loading,
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
          placeholder="コメントを入力..."
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'JUDGING...' : 'SEND'}
        </button>
      </div>
    </form>
  )
}
