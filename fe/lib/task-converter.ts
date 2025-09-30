import type { Task, DailyTask, HourData } from '@/types/timeTracking'

/**
 * Convert legacy individual tasks to new daily task format
 */
export function convertTasksToDailyTasks(tasks: Task[]): DailyTask[] {
    const dailyTasksMap = new Map<string, DailyTask>()

    tasks.forEach(task => {
        const date = task.date

        if (!dailyTasksMap.has(date)) {
            dailyTasksMap.set(date, {
                id: task.id, // Use first task's ID as daily task ID
                date: date,
                wellBeingTags: task.wellBeingTags || [],
                hours: Array(24).fill(null)
            })
        }

        const dailyTask = dailyTasksMap.get(date)!
        dailyTask.hours[task.hour] = {
            taskName: task.taskName,
            category: task.category,
            subcategoryId: task.subcategoryId,
            duration: task.duration,
            subcategory: task.subcategory
        }

        // Merge well-being tags
        if (task.wellBeingTags) {
            dailyTask.wellBeingTags = Array.from(new Set([...dailyTask.wellBeingTags, ...task.wellBeingTags]))
        }
    })

    return Array.from(dailyTasksMap.values())
}

/**
 * Convert daily task back to individual tasks (for backward compatibility)
 */
export function convertDailyTaskToTasks(dailyTask: DailyTask): Task[] {
    const tasks: Task[] = []

    dailyTask.hours.forEach((hourData, hour) => {
        if (hourData) {
            tasks.push({
                id: `${dailyTask.id}-${hour}`,
                date: dailyTask.date,
                hour: hour,
                taskName: hourData.taskName,
                category: hourData.category,
                subcategoryId: hourData.subcategoryId,
                wellBeingTags: dailyTask.wellBeingTags,
                duration: hourData.duration,
                subcategory: hourData.subcategory
            })
        }
    })

    return tasks
}

/**
 * Update a specific hour in a daily task
 */
export function updateHourInDailyTask(
    dailyTask: DailyTask,
    hour: number,
    hourData: HourData | null
): DailyTask {
    const updatedHours = [...dailyTask.hours]
    updatedHours[hour] = hourData

    return {
        ...dailyTask,
        hours: updatedHours
    }
}

/**
 * Get task for a specific hour from daily task
 */
export function getTaskForHour(dailyTask: DailyTask, hour: number): HourData | null {
    return dailyTask.hours[hour] || null
}

/**
 * Get all non-null hours from daily task
 */
export function getNonEmptyHours(dailyTask: DailyTask): { hour: number; data: HourData }[] {
    return dailyTask.hours
        .map((hourData, hour) => hourData ? { hour, data: hourData } : null)
        .filter((item): item is { hour: number; data: HourData } => item !== null)
}
