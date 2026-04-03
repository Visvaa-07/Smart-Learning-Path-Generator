/**
 * PathWise — Hybrid Weight + Deadline Learning Path Algorithm
 *
 * Features:
 * - Weight-based hours (existing)
 * - Global deadline constraint
 * - Hybrid allocation if overloaded
 * - Carry-over weekly scheduling (continuous hours)
 */

const SKILL_MULTIPLIERS = {
  beginner: 1.5,
  intermediate: 1.0,
  advanced: 0.6,
}

const BUFFER_FACTOR = 1.10 // 10% review buffer

function generatePath(modules, skillLevel, hoursPerWeek, deadlineWeeks = null) {
  const skillMultiplier = SKILL_MULTIPLIERS[skillLevel] ?? 1.0

  // Sort modules by priority (ascending = higher priority first)
  const sorted = [...modules].sort((a, b) => a.priority - b.priority)

  // ==============================
  // STEP 1: Compute adjusted hours
  // ==============================
  const modulesWithHours = sorted.map(mod => {
    const adjustedHours = Math.ceil(
      mod.base_hours * skillMultiplier * mod.complexity_weight
    )

    return {
      ...mod._doc,
      adjustedHours,
      allocatedHours: adjustedHours, // default (may change if overloaded)
    }
  })

  // ==============================
  // STEP 2: Compute totals
  // ==============================
  const totalRequiredHours = modulesWithHours.reduce(
    (sum, m) => sum + m.adjustedHours,
    0
  )

  let totalAvailableHours = totalRequiredHours
  let isOverloaded = false

  if (deadlineWeeks != null) {
    totalAvailableHours = deadlineWeeks * hoursPerWeek
    isOverloaded = totalAvailableHours < totalRequiredHours
  }

  // ==============================
  // STEP 3: HYBRID ALLOCATION
  // ==============================
  if (isOverloaded) {
    const baselineRatio = totalAvailableHours / totalRequiredHours

    // Baseline: everyone gets some progress
    modulesWithHours.forEach(m => {
      m.allocatedHours = Math.floor(m.adjustedHours * baselineRatio)
    })

    let usedHours = modulesWithHours.reduce(
      (sum, m) => sum + m.allocatedHours,
      0
    )

    let remainingHours = totalAvailableHours - usedHours

    // Priority boost: higher priority first
    const prioritySorted = [...modulesWithHours].sort(
      (a, b) => a.priority - b.priority
    )

    for (const m of prioritySorted) {
      if (remainingHours <= 0) break

      const needed = m.adjustedHours - m.allocatedHours
      const extra = Math.min(needed, remainingHours)

      m.allocatedHours += extra
      remainingHours -= extra
    }
  }

  // ==============================
  // STEP 4: SCHEDULING (carry-over)
  // ==============================
  let currentWeek = 1
  let remainingHoursInWeek = hoursPerWeek
  let totalHours = 0
  const pathModules = []

  for (const mod of modulesWithHours) {
    const adjustedHours = mod.adjustedHours
    const allocatedHours = mod.allocatedHours

    totalHours += allocatedHours

    const weekStart = currentWeek
    let moduleRemainingHours = allocatedHours

    while (moduleRemainingHours > 0) {
      if (remainingHoursInWeek === 0) {
        currentWeek++
        remainingHoursInWeek = hoursPerWeek
      }

      const allocate = Math.min(moduleRemainingHours, remainingHoursInWeek)
      moduleRemainingHours -= allocate
      remainingHoursInWeek -= allocate
    }

    const weekEnd = currentWeek

    pathModules.push({
      moduleId: mod._id,
      name: mod.name,
      adjustedHours, // original required
      allocatedHours, // what user will actually do
      completion: Math.round((allocatedHours / adjustedHours) * 100),
      complexityWeight: mod.complexity_weight,
      weekStart,
      weekEnd,
      completed: false,
      completedAt: null,
      resource: mod.resource ?? null,
    })
  }

  // ==============================
  // STEP 5: Final calculations
  // ==============================
  const rawWeeks = currentWeek
  const totalWeeks = Math.ceil(rawWeeks * BUFFER_FACTOR)

  return {
    pathModules,
    totalWeeks,
    totalHours,
    totalRequiredHours,
    totalAvailableHours,
    isOverloaded,
    skillMultiplier,
  }
}

module.exports = { generatePath, SKILL_MULTIPLIERS }