/**
 * PathWise — Weight-Based Learning Path Algorithm
 *
 * Formula:
 *   adjustedHours   = base_hours × skillMultiplier × complexity_weight
 *   weeksPerModule  = Math.ceil(adjustedHours / hoursPerWeek)
 *   weekStart/End   = rolling cumulative week counter
 *   totalWeeks      = Σ weeksPerModule  (+ 10% buffer, rounded up)
 *   isOverloaded    = totalWeeks > deadlineWeeks
 */

const SKILL_MULTIPLIERS = {
  beginner:     1.5,
  intermediate: 1.0,
  advanced:     0.6,
}

const BUFFER_FACTOR = 1.10  // 10% review buffer

/**
 * Generate a learning path from a list of modules + student inputs.
 *
 * @param {Array}  modules       - Array of Module documents from DB
 * @param {string} skillLevel    - 'beginner' | 'intermediate' | 'advanced'
 * @param {number} hoursPerWeek  - Hours available per week
 * @param {number|null} deadlineWeeks - Optional target deadline in weeks
 *
 * @returns {Object} { pathModules, totalWeeks, totalHours, isOverloaded, skillMultiplier }
 */
function generatePath(modules, skillLevel, hoursPerWeek, deadlineWeeks = null) {
  const skillMultiplier = SKILL_MULTIPLIERS[skillLevel] ?? 1.0

  // Sort modules by priority (ascending = first things first)
  const sorted = [...modules].sort((a, b) => a.priority - b.priority)

  let currentWeek = 1
  let totalHours = 0
  const pathModules = []

  for (const mod of sorted) {
    // Core formula
    const adjustedHours = Math.ceil(mod.base_hours * skillMultiplier * mod.complexity_weight)
    const weeksNeeded   = Math.ceil(adjustedHours / hoursPerWeek)

    const weekStart = currentWeek
    const weekEnd   = currentWeek + weeksNeeded - 1

    pathModules.push({
      moduleId:         mod._id,
      name:             mod.name,
      adjustedHours,
      complexityWeight: mod.complexity_weight,
      weekStart,
      weekEnd,
      completed:        false,
      completedAt:      null,
      resource:         mod.resource ?? null,
    })

    totalHours   += adjustedHours
    currentWeek   = weekEnd + 1
  }

  // Apply 10% buffer (round up)
  const rawWeeks   = currentWeek - 1
  const totalWeeks = Math.ceil(rawWeeks * BUFFER_FACTOR)

  // Deadline overload check
  const isOverloaded = deadlineWeeks != null && totalWeeks > deadlineWeeks

  return {
    pathModules,
    totalWeeks,
    totalHours,
    isOverloaded,
    skillMultiplier,
  }
}

module.exports = { generatePath, SKILL_MULTIPLIERS }
