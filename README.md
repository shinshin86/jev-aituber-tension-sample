# Jev AITuber Tension Demo

English | [日本語](./README.ja.md)

A small demo that passes a viewer comment to [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) and asks whether the AITuber's tension goes up, stays the same, or goes down. The tension value and the character's kaomoji change according to the result.

Jev does not generate text. It returns which of your predefined options applies, with a probability for each option. This demo shows all three probabilities (`UP` / `SAME` / `DOWN`) on screen.

```text
Viewer comment → Jev → UP / SAME / DOWN → tension change → kaomoji change
```

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal.

## Usage

1. Open `SETTINGS`, enter your [OpenRouter](https://openrouter.ai/) API key, and press `SAVE`.
2. The default `Model ID`, `typesafe/jev-1.13`, works as is.
3. Type a comment and press `SEND` (or hit Enter).

When the decision comes back, the three probabilities under `JEV DECISION` are updated, and the option with the highest probability changes the tension.

| Decision | Tension |
| --- | --- |
| UP | +15 |
| SAME | no change |
| DOWN | -15 |

Tension ranges from 0 to 100 and starts at 50. The kaomoji changes as follows.

| Tension | Kaomoji |
| --- | --- |
| 80–100 | `＼(^o^)／` |
| 60–79 | `(｀・ω・´)` |
| 40–59 | `(・ω・)` |
| 20–39 | `(´・ω・`)` |
| 0–19 | `(；ω；)` |

The last five decisions are listed at the bottom of the screen. Reloading the page resets the history and the tension.

## How Jev is called

On OpenRouter, Jev cannot be called through the Chat Completions API. This demo uses the Decisions API (alpha).

```text
POST https://openrouter.ai/api/alpha/decisions
```

The request carries a `state` (the material to judge) and typed `questions`. No prompt text is assembled.

```json
{
  "model": "typesafe/jev-1.13",
  "state": {
    "current_tension": 50,
    "viewer_comment": "You look great today!"
  },
  "questions": {
    "tension": {
      "type": "choice",
      "instructions": "...",
      "criteria": { "up": "...", "same": "...", "down": "..." }
    }
  }
}
```

The per-option probabilities are in `answers.tension.probabilities` of the response.

```json
{
  "answers": {
    "tension": {
      "type": "choice",
      "choice": "up",
      "confidence": 0.88,
      "probabilities": { "up": 0.91, "same": 0.07, "down": 0.02 }
    }
  }
}
```

Inside the app, this is converted to the following shape.

```ts
type JevDecision = { up: number; same: number; down: number }
```

`probabilities` is optional in the API schema. When it is missing, the option named in `choice` is treated as 1 and the others as 0. If neither can be read, the app reports an error and leaves the tension unchanged.

All communication with OpenRouter lives in `src/lib/jev.ts`. The UI only uses `judgeTension()` and `JevDecision`, so switching to the Jev API directly means replacing that one file.

## API key handling

The API key is stored in the browser's localStorage and sent directly from the browser to OpenRouter. It is never written to the source code or the repository.

This approach is meant for a demo running on your own machine. In a public web service it would hand your key to every visitor's browser. For a public deployment, keep the key on a server and call the API through it.

## Out of scope

Reply text generation, text-to-speech, speech recognition, Live2D, YouTube or Twitch integration, conversation history, and long-term memory are not implemented.

## Development

```bash
npm run lint
npm run build
```

Built with Vite, React, and TypeScript. No UI library or state management library is used.

## License

[MIT](./LICENSE)
