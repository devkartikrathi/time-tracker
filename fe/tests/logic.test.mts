/**
 * Domain logic tests.
 *
 * These cover the pure functions the product's correctness rests on — streak
 * arithmetic, achievement unlocking, goal pacing and the insight rules — none
 * of which need a database or a browser. Run with `npm test`.
 */

import { computeStreak } from '../lib/streaks.js'
import { evaluateAchievements } from '../lib/achievements.js'
import { generateInsights } from '../lib/insights.js'
import { goalProgress, totalsForDay, longestRun, dailySeries } from '../lib/stats.js'
import { toDayKey, fromDayKey, addDayKey, dayKeyRange, formatHourShort, friendlyDate } from '../lib/date.js'
import type { DailyTask, HourSlots, Subcategory } from '../types/index.js'

let pass = 0, fail = 0
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  ok ? pass++ : fail++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`)
}

// ---- date helpers ----
eq('toDayKey/fromDayKey roundtrip', toDayKey(fromDayKey('2026-03-09')), '2026-03-09')
eq('addDayKey crosses month', addDayKey('2026-02-28', 1), '2026-03-01')
eq('addDayKey crosses leap', addDayKey('2024-02-28', 1), '2024-02-29')
eq('dayKeyRange inclusive', dayKeyRange(fromDayKey('2026-01-30'), fromDayKey('2026-02-02')).length, 4)
eq('formatHourShort noon', formatHourShort(12), '12p')
eq('formatHourShort midnight', formatHourShort(0), '12a')

const TODAY = '2026-08-20'
eq('friendlyDate today', friendlyDate(TODAY), 'Today')

// ---- streaks ----
eq('empty streak', computeStreak([], TODAY).current, 0)
eq('logged today only', computeStreak([TODAY], TODAY).current, 1)
eq('3 consecutive ending today', computeStreak(['2026-08-18','2026-08-19',TODAY], TODAY).current, 3)
// Today blank but yesterday logged: streak alive and flagged at risk.
const risk = computeStreak(['2026-08-18','2026-08-19'], TODAY)
eq('yesterday-anchored streak alive', risk.current, 2)
eq('yesterday-anchored flagged at risk', risk.atRisk, true)
// Two-day gap breaks it, but longest is remembered.
const lapsed = computeStreak(['2026-08-10','2026-08-11','2026-08-12'], TODAY)
eq('lapsed streak current=0', lapsed.current, 0)
eq('lapsed streak longest=3', lapsed.longest, 3)
eq('future dates ignored', computeStreak([TODAY,'2026-12-01'], TODAY).current, 1)
eq('duplicates deduped', computeStreak([TODAY,TODAY,'2026-08-19'], TODAY).current, 2)

// ---- helpers to build days ----
const sub = (id: string, cat: any): Subcategory => ({ id, name: id, color: '#2a78d6', category: cat })
const mk = (date: string, spec: Array<[number, number, string, string]>, mood: number | null = null): DailyTask => {
  const hours: HourSlots = Array(24).fill(null)
  for (const [from, to, id, cat] of spec)
    for (let h = from; h < to; h++) hours[h] = { taskName: id, category: cat as any, subcategoryId: id }
  return { id: date, date, hours, wellBeingTags: [], mood, note: null }
}

eq('totalsForDay', totalsForDay(mk('2026-08-20', [[0,7,'sleep','REST'],[9,17,'work','WORK']])), { REST: 7, WORK: 8, OTHER: 0 })
eq('longestRun WORK', longestRun(mk('x', [[9,15,'w','WORK'],[16,18,'w','WORK']]).hours, 'WORK'), 6)

// ---- achievements ----
const perfect = mk('2026-08-19', [[0,24,'w','WORK']])
const got = evaluateAchievements({ tasks: [perfect], currentStreak: 1, longestStreak: 1 })
eq('perfect_day unlocked', got.includes('perfect_day'), true)
eq('deep_focus unlocked (24h work)', got.includes('deep_focus'), true)
eq('early_bird unlocked (hour 5 filled)', got.includes('early_bird'), true)
eq('streak_7 NOT unlocked at streak 1', got.includes('streak_7'), false)
eq('first_day unlocked', got.includes('first_day'), true)
const none = evaluateAchievements({ tasks: [], currentStreak: 0, longestStreak: 0 })
eq('no achievements with no data', none.length, 0)

// ---- goals ----
const days = [mk(TODAY, [[9,12,'deep','WORK']])]
const dailyGoal = { id:'g', name:'Deep work', targetHours:2, period:'DAILY' as const, category:'WORK' as const, subcategoryId:'deep', isActive:true }
const gp = goalProgress(dailyGoal, days, TODAY)
eq('daily goal logged', gp.logged, 3)
eq('daily goal met', gp.met, true)
const weekly = goalProgress({ ...dailyGoal, period: 'WEEKLY' }, days, TODAY)
eq('weekly target scales to 14', weekly.target, 14)
eq('weekly not met yet', weekly.met, false)

// ---- insights ----
const empty = generateInsights({ tasks: [], subcategories: [], goals: [], today: TODAY, currentStreak: 0 })
eq('empty state single prompt', empty.length, 1)
eq('empty state id', empty[0]!.id, 'empty')

// Marathon detection + sorted by priority
const marathonDays = [mk(TODAY, [[9,18,'deep','WORK']])]
const ins = generateInsights({ tasks: marathonDays, subcategories: [sub('deep','WORK')], goals: [], today: TODAY, currentStreak: 5 })
eq('marathon insight present', ins.some(i => i.id === 'marathon'), true)
eq('streak insight present', ins.some(i => i.id === 'streak'), true)
eq('insights sorted desc by priority', ins.every((v,i,a) => i===0 || a[i-1]!.priority >= v.priority), true)

// Mood correlation needs >= 8 rated days
const rated: DailyTask[] = []
for (let i = 0; i < 10; i++) {
  const d = addDayKey(TODAY, -i)
  // Good days have lots of OTHER (life) time; bad days have almost none.
  rated.push(i % 2 === 0 ? mk(d, [[9,17,'w','WORK'],[18,23,'life','OTHER']], 5)
                         : mk(d, [[9,17,'w','WORK']], 2))
}
const moodIns = generateInsights({ tasks: rated, subcategories: [sub('w','WORK'), sub('life','OTHER')], goals: [], today: TODAY, currentStreak: 10 })
const mc = moodIns.find(i => i.id === 'mood-correlation')
eq('mood correlation found', Boolean(mc), true)
eq('mood correlation names Life', Boolean(mc && /life/i.test(mc.title)), true)

// ---- series ----
const s = dailySeries(days, [addDayKey(TODAY,-1), TODAY])
eq('dailySeries pads missing days', s[0]!.total, 0)
eq('dailySeries fills present day', s[1]!.WORK, 3)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
