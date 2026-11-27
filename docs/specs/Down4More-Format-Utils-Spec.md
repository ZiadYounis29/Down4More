# Down4More: `formatSpeed` / `formatEta` Spec

> **Scope:** `core/utils/format-speed.ts`, `core/utils/format-eta.ts`. Both were already named in the Project Tree and referenced by example output only (`"17.2 MB/s"`, `"40 hrs"` — shared spec §3) with no actual rounding/unit rule. This spec gives both a full algorithm, in the same style as the already-specified `formatDuration`/`formatSize` (shared spec §3).
> **Backend:** none — pure functions, no Angular, each gets a `.spec.ts` per the Project Tree's `core/utils/` convention.

---

## 1. `formatSpeed`

```ts
export function formatSpeed(bytesPerSec: number | null): string {
  if (bytesPerSec == null) return '—';
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
  if (bytesPerSec < 1024 ** 2) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  if (bytesPerSec < 1024 ** 3) return `${(bytesPerSec / 1024 ** 2).toFixed(1)} MB/s`;
  return `${(bytesPerSec / 1024 ** 3).toFixed(2)} GB/s`;
}
```

**Naming note** (same kind of note the shared spec already makes for `done` vs "Succeeded," §3): `DownloadItem.speedBps` holds **bytes per second**, not bits, despite the field name — consistent with `downloadedBytes`/`totalBytes` being byte-denominated everywhere else in the model. Don't "fix" the name without also checking every call site; it's left as-is here only to avoid an unrelated rename.

**Units:** B/s under 1 KB/s (rounded, no decimal), KB/s and MB/s with one decimal place, GB/s with two (speeds that high are effectively never hit by the mock, but the function should not break if they are).

| Input (bytes/sec) | Output |
|---|---|
| `null` | `—` |
| `0` | `0 B/s` |
| `512` | `512 B/s` |
| `10,035,814` (≈ 9.8 MB/s) | `9.8 MB/s` |
| `18,035,814` (≈ 17.2 MB/s) | `17.2 MB/s` |
| `22,545,612` (≈ 21.5 MB/s) | `21.5 MB/s` |

The four other mock speeds in the Downloads spec's table (4.1, 6.3, 2.2 MB/s) follow the same rule — all three stay in the MB/s bucket.

---

## 2. `formatEta`

```ts
export function formatEta(sec: number | null): string {
  if (sec == null) return '—';
  if (sec < 60) return `${Math.round(sec)} sec`;
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} min`;
  return `${Math.max(1, Math.round(sec / 3600))} hrs`;
}
```

**No "days" bucket, intentionally** (§3 explains why) — hours keep counting indefinitely for large ETAs, matching the design's own `"40 hrs"` rather than `"1.7 days"`.

**Rounding:** plain `Math.round`, with a floor of `1` once a value has crossed into the minutes or hours bucket, so a 61-second ETA never displays as `"0 min"`.

| Input (seconds) | Output | Source |
|---|---|---|
| `null` | `—` | processing/done rows have no ETA |
| `6` | `6 sec` | Downloads spec §8, "Lo-fi study mix" |
| `1,680` | `28 min` | Downloads spec §8, "Interview: building a boat" |
| `720` | `12 min` | Downloads spec §8, "How tides actually work" |
| `3,600` | `1 hr` *(rendered as `"1 hrs"` by the function above — see §3.1)* | Downloads spec §8, "Keyboard sound test" |
| `10,800` | `3 hrs` | Downloads spec §8, "Street food tour" |
| `144,000` | `40 hrs` | Downloads spec §8, "Rocket landing" |

### 3.1 Singular vs plural

The design shows `"1 hr"` (singular) but `"3 hrs"` / `"40 hrs"` (plural) — the function above always appends `hrs`. Pick one:

```ts
const hrs = Math.max(1, Math.round(sec / 3600));
return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
```

Apply the same singular check to `min` if you want `"1 min"` rather than `"1 mins"` (the design never shows a plural-ambiguous minute value, so this is a judgment call either way — `min` reads fine either singular or plural in English, `hr`/`hrs` does not).

---

## 3. Done when

- [ ] Every row of both tables in §1 and §2 passes as a unit test.
- [ ] `formatEta(3600)` renders `"1 hr"` (singular), not `"1 hrs"`.
- [ ] Neither function throws or returns `NaN`/`undefined` for `0`, negative input (clamp to `0` before formatting), or very large numbers.
- [ ] Both are exported the same way `formatDuration`/`formatSize` are (plain functions; add template pipes only if a page actually needs one — unlike duration/size, no page spec currently binds these directly in a template, they're only read inside `download-info`'s meta line as plain strings).

---

## 4. Choices made that you can change

1. **No "days" bucket for ETA.** If downloads can realistically run for multiple days in your real backend, add one (`>= 86400 → N days`) — nothing else references this threshold, so it's an isolated change.
2. **One-decimal KB/MB, two-decimal GB** for speed. Pick whatever precision reads best in your actual UI; the Downloads spec's example values (all one-decimal MB/s) were the only hard constraint.
3. **Floor of 1 for minutes/hours** avoids a `"0 min"`/`"0 hrs"` ever appearing once a value has rounded up into that bucket. An alternative is to let it show `"0 min"` and rely on the user seeing the percentage instead — not recommended, since `"0 min"` reads as "about to finish" when it might mean "61 seconds left."
