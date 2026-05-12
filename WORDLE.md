# Wordle (Kingstop Edition)

> *"The word is right there. You are not."*

A multiplayer, host-driven twist on Wordle baked into the Kingstop Fanclub platform. One classmate picks the secret word; everyone else takes unlimited shots at cracking it — and the longer they flail, the more brutally the game roasts them.

Credit goes to **GTA Hani** for inventing this format.

---

## How it works

1. **One host per round.** Any approved user can start a round by submitting a secret word (2–15 letters, a–z only). Starting a new round automatically ends the previous one.
2. **Unlimited guesses.** Every player guesses words of the same length as the secret. There is no guess cap.
3. **Counts only — no positions.** Unlike classic Wordle, you are *not* told which letters are green or yellow. You only see two numbers next to each guess:
   - 🟢 **Green count** — letters that are correct *and* in the correct position.
   - 🟡 **Yellow count** — letters that exist in the word but are in the wrong position.
4. **Insults from guess #3 onward.** Past your third guess, the game starts publicly questioning your worth as a sentient being. Severity scales with patience.
5. **Persistent victory screen.** When you crack the word, a full-screen celebration appears showing your complete guess history. It stays up until *you* dismiss it — the round keeps running for everyone else in the background.
6. **Saved guess history.** Every guess is stored server-side under your account, scored server-side (so the secret never leaks to the client), and surfaced in the post-win recap.

---

## Roles

| Role | What they can do |
| --- | --- |
| **Host** | Sees a Host Panel with round stats (players, guesses solved, age) and can replace the round at any time. Cannot guess in their own round. |
| **Player** | Submits guesses, sees their own guess board, the live activity feed, and their persistent win screen on success. |
| **Admin** | All host powers across any round — including ending or replacing a round started by anyone else. |

---

## Live activity sidebar

The right rail shows the last 30 guesses across the whole room in real time:

- Players' **guesses are masked** with bullets (e.g. `••••`) until they crack the word — only the host and admins see plaintext.
- Correct guesses are highlighted in emerald.
- Counts update live as each player submits.

---

## Round lifecycle

```
[no round]  ──host submits word──▶  [active round]  ──first correct or host ends──▶  [round closed]
                                          ▲                                                │
                                          └──── host starts replacement (auto-ends) ───────┘
```

Round secrets never travel to the client. All scoring (green/yellow counts), round state changes, and insult eligibility happen inside Postgres `SECURITY DEFINER` functions:

- `start_wordle_round(_word)` — host opens a new round, ends any prior active one.
- `submit_wordle_guess(_round_id, _guess)` — server-side scoring; returns `green_count`, `yellow_count`, `is_correct`, `guess_number`.
- `end_wordle_round(_round_id)` — host or admin closes the round.
- `get_active_wordle_round()` — returns the current round metadata (no word).

---

## Database

Two tables back the module:

- **`wordle_rounds`** — `host_id`, `word` (host/admin SELECT only via RLS), `word_length`, `is_active`, `created_at`, `ended_at`.
- **`wordle_guesses`** — `round_id`, `user_id`, `guess`, `green_count`, `yellow_count`, `is_correct`, `created_at`. Visible to all authenticated users so the live feed works; insertable only as yourself; deletable by the guess owner or an admin.

Realtime is wired through Supabase channels keyed on `round_id`, so new guesses and round-state flips animate in without a refresh.

---

## Tips for hosts

- Pick something between **5 and 8 letters** for the best balance of pain and possibility.
- Avoid double letters if you want to keep things merciful — they make green/yellow disambiguation brutal.
- You can replace your own active round at any time via the Host Panel.

## Tips for players

- Use early guesses to **probe letters**, not to win. With no positional feedback, breadth beats precision.
- Track your own guess history (auto-saved, visible at the top of the board) and look for stable green counts when you swap one letter at a time.
- The insults are ordered. The longer you stay, the worse it gets. Embrace it.

---

*Part of the [Kingstop Fanclub](../README.md) platform. See the main README for auth, approval, and the rest of the modules.*
