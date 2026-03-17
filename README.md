# Prompt X-Ray

Prompt X-Ray is a multilingual web app that reviews prompts before they are sent to an AI model. It helps users detect privacy leaks, academic integrity risks, and weak prompt design, then suggests a safer or stronger rewrite.

Built as a competition-ready prototype, the project is about responsible AI use, not just AI output.

## Summary

Most people paste prompts into AI tools without checking whether they:

- expose personal information,
- cross ethical or academic boundaries,
- or are too vague to get good results.

Prompt X-Ray solves that with three evaluator modes:

- `Privacy Check`
- `Academic Integrity Check`
- `Prompt Quality Check`

Each analysis returns:

- a score and label,
- a short summary,
- findings with evidence,
- suggestions,
- and a rewritten prompt.

## Why It Matters

- It promotes safer AI usage.
- It supports honest, learning-oriented interaction.
- It teaches users how to write better prompts.
- It is fair: good prompts can score well instead of always being criticized.
- It supports English, Russian, and Uzbek.

## Evaluators

### Privacy Check

Finds unnecessary personal or identifying details such as names, phone numbers, locations, emails, usernames, and ID-like data.

Output focus:

- privacy risk score,
- exposed details,
- sanitized rewrite.

### Academic Integrity Check

Detects dishonest outsourcing patterns such as full-task completion, concealment intent, and answer-only requests.

Output focus:

- integrity risk score,
- risky intent signals,
- learning-oriented rewrite.

### Prompt Quality Check

Evaluates clarity, specificity, structure, audience, goal, and constraints.

Output focus:

- quality score,
- missing or weak prompt elements,
- improved prompt rewrite.

## Why the Architecture Works

The app uses separate evaluators instead of one generic checker. That is important because the same prompt can be problematic for different reasons.

- `Privacy Check` focuses on identity exposure.
- `Academic Integrity Check` focuses on dishonest use.
- `Prompt Quality Check` focuses on clarity and structure.

This modular design also makes the project easy to extend with new evaluators.

## Demo Prompt Set

All examples below use fictional details only.

### Privacy

Bad:

> Write an email to my biology teacher explaining why I missed class yesterday. My name is Damir Karimov, I study at Tashkent Academic Lyceum, and my phone number is +998 90 123 45 67.

Good:

> Write a polite email to my biology teacher explaining that I missed class yesterday for personal reasons. Keep it respectful and concise.

### Academic Integrity

Bad:

> Write my history essay about World War II in a way that sounds natural and my teacher will not notice AI helped me.

Good:

> Explain photosynthesis simply, then give me 3 questions so I can write the assignment myself.

### Prompt Quality

Weak:

> Explain photosynthesis.

Good:

> Explain cybersecurity threats for high school students in 5 bullet points, then add 3 quiz questions.

## User Flow

1. Choose an evaluator.
2. Paste or type a prompt.
3. Run analysis.
4. Review score, findings, suggestions, and rewritten version.
5. Copy the rewrite or revisit the result in history.

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `next-intl`
- `next-themes`
- `shadcn/ui`
- `Vercel AI SDK`
- `OpenAI gpt-4o-mini`
- `Zod`

## Project Structure

```text
app/
  api/analyze/          Evaluator-based analysis route
  [locale]/             Localized pages
components/
  prompt-xray/          Product-specific UI
  ui/                   Shared UI primitives
lib/
  evaluators/           Registry, schemas, scoring, prompts
  history.ts            Local browser history
i18n/
messages/
```

## Local Development

### Prerequisites

- Node.js 22+
- npm
- OpenAI API access

### Environment

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

### Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Build

```bash
npm run build
npm run start
```

## Perspectives and Next Improvements

### Product Roadmap

- `Browser / IDE integration`: analyze prompts before users send them to ChatGPT, Copilot, or internal agents.
- `Multi-evaluator dashboard`: run several evaluators at once and show one combined report.
- `Evaluator confidence`: make scores feel less black-box.
- `Prompt diff highlighting`: show exactly what changed between original and rewritten prompts.

### New Evaluators

- `Safety Check`
- `Prompt Injection Check`

Both fit naturally into the current modular evaluator system in `lib/evaluators/`.

### Production Gaps to Address

- The public AI endpoint in `app/api/analyze/route.ts` is open to abuse and cost drain.
   - It currently accepts any POST and calls the model without auth, rate limiting, throttling, or quota guards.
- Prompt history in `lib/history.ts` is stored in plain browser `localStorage`.
   - That is convenient for demo use, but not safe for truly confidential prompts.
- Evaluator-specific data is discarded by `app/api/analyze/route.ts`.
   - Privacy `detectedItems`, academic `positiveSignals`, and quality `presentElements` / `missingElements` are not preserved in the final API response.
