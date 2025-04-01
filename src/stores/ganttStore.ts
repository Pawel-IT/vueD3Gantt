// stores/ganttStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { scaleTime, scaleLinear } from 'd3-scale'

export const useGanttStore = defineStore('gantt', () => {
  // State
  const tasks = ref([
    {
      id: 1,
      name: 'Task 1',
      start: new Date(2023, 0, 1),
      end: new Date(2023, 0, 10),
      color: '#4E79A7',
    },
    {
      id: 2,
      name: 'Task 2',
      start: new Date(2023, 0, 5),
      end: new Date(2023, 0, 15),
      color: '#F28E2B',
    },
    {
      id: 3,
      name: 'Task 3',
      start: new Date(2023, 0, 12),
      end: new Date(2023, 0, 20),
      color: '#E15759',
    },
  ])

  const viewStart = ref(new Date(2023, 0, 1))
  const viewEnd = ref(new Date(2023, 1, 1))
  const zoomLevel = ref(1)
  const containerWidth = ref(1000)
  const rowHeight = ref(40)
  const padding = ref({ top: 20, right: 20, bottom: 40, left: 150 })

  // Getters
  const timeScale = computed(() => {
    return scaleTime()
      .domain([viewStart.value, viewEnd.value])
      .range([padding.value.left, containerWidth.value - padding.value.right])
  })

  const yScale = computed(() => {
    return scaleLinear()
      .domain([0, tasks.value.length])
      .range([padding.value.top, rowHeight.value * tasks.value.length + padding.value.top])
  })

  const visibleTasks = computed(() => {
    return tasks.value.map((task, i) => ({
      ...task,
      y: yScale.value(i),
      x: timeScale.value(task.start),
      width: timeScale.value(task.end) - timeScale.value(task.start),
    }))
  })

  // Actions
  function updateTaskDates(id, newStart, newEnd) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.start = newStart
      task.end = newEnd
    }
  }

  function zoom(factor) {
    zoomLevel.value = Math.max(0.1, Math.min(5, zoomLevel.value * factor))

    const range = viewEnd.value - viewStart.value
    const center = new Date(viewStart.value.getTime() + range / 2)
    const newRange = (viewEnd.value - viewStart.value) / factor

    viewStart.value = new Date(center.getTime() - newRange / 2)
    viewEnd.value = new Date(center.getTime() + newRange / 2)
  }

  function pan(days) {
    const dayInMs = 24 * 60 * 60 * 1000
    viewStart.value = new Date(viewStart.value.getTime() + days * dayInMs)
    viewEnd.value = new Date(viewEnd.value.getTime() + days * dayInMs)
  }

  return {
    tasks,
    viewStart,
    viewEnd,
    zoomLevel,
    containerWidth,
    rowHeight,
    padding,
    timeScale,
    yScale,
    visibleTasks,
    updateTaskDates,
    zoom,
    pan,
  }
})
