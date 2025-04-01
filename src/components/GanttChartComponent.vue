<!-- components/GanttChart.vue -->
<template>
  <div class="gantt-container" ref="container">
    <v-stage
      ref="stage"
      :config="stageConfig"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <v-layer ref="mainLayer">
        <!-- Background grid -->
        <v-group v-for="(tick, i) in axisTicks" :key="'tick-' + i">
          <v-line
            :config="{
              x: tick.x,
              y: 0,
              points: [0, 0, 0, stageConfig.height],
              stroke: '#e0e0e0',
              strokeWidth: 1,
            }"
          />
          <v-text
            :config="{
              x: tick.x,
              y: stageConfig.height - 20,
              text: tick.label,
              fontSize: 12,
              fill: '#666',
            }"
          />
        </v-group>

        <!-- Task bars -->
        <v-group v-for="task in visibleTasks" :key="task.id">
          <v-rect
            :config="{
              x: task.x,
              y: task.y,
              width: task.width,
              height: rowHeight - 10,
              fill: task.color,
              cornerRadius: 4,
              shadowColor: 'black',
              shadowBlur: 3,
              shadowOpacity: 0.2,
              name: 'task-' + task.id,
              draggable: true,
            }"
            @dragstart="handleDragStart(task.id)"
            @dragmove="handleDragMove($event, task.id)"
            @dragend="handleDragEnd"
          />

          <!-- Task label -->
          <v-text
            :config="{
              x: padding.left - 10,
              y: task.y + (rowHeight - 10) / 2,
              text: task.name,
              fontSize: 12,
              fill: '#333',
              align: 'right',
              width: padding.left - 20,
            }"
          />

          <!-- Left resize handle -->
          <v-rect
            :config="{
              x: task.x - 4,
              y: task.y,
              width: 8,
              height: rowHeight - 10,
              fill: 'rgba(0,0,0,0.2)',
              cornerRadius: 2,
              name: 'left-resize-' + task.id,
            }"
            @mousedown="startResize(task.id, 'left')"
          />

          <!-- Right resize handle -->
          <v-rect
            :config="{
              x: task.x + task.width - 4,
              y: task.y,
              width: 8,
              height: rowHeight - 10,
              fill: 'rgba(0,0,0,0.2)',
              cornerRadius: 2,
              name: 'right-resize-' + task.id,
            }"
            @mousedown="startResize(task.id, 'right')"
          />
        </v-group>
      </v-layer>
    </v-stage>

    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
      <button @click="panLeft">←</button>
      <button @click="panRight">→</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGanttStore } from '@/stores/ganttStore'
import { timeFormat } from 'd3'

const store = useGanttStore()
const { rowHeight, padding, tasks, visibleTasks, timeScale, zoom, pan, updateTaskDates } = store
const container = ref(null)
const stage = ref(null)
const mainLayer = ref(null)

// Format date for axis labels
const formatDate = timeFormat('%b %d %Y')

// Stage configuration
const stageConfig = ref({
  width: store.containerWidth,
  height: computed(
    () => store.padding.top + store.tasks.length * store.rowHeight + store.padding.bottom,
  ),
})

// Axis ticks
const axisTicks = computed(() => {
  const ticks = []
  const timeScale = store.timeScale
  const domain = timeScale.domain()
  const range = domain[1] - domain[0]

  // Determine tick interval based on zoom level
  let interval
  if (range < 1000 * 60 * 60 * 24 * 7) {
    // Less than 1 week
    interval = 1000 * 60 * 60 * 24 // 1 day
  } else if (range < 1000 * 60 * 60 * 24 * 30) {
    // Less than 1 month
    interval = 1000 * 60 * 60 * 24 * 7 // 1 week
  } else {
    interval = 1000 * 60 * 60 * 24 * 30 // 1 month
  }

  // Generate ticks
  let current = new Date(Math.ceil(domain[0].getTime() / interval) * interval)
  while (current < domain[1]) {
    ticks.push({
      x: timeScale(current),
      label: formatDate(current),
      date: current,
    })
    current = new Date(current.getTime() + interval)
  }

  return ticks
})

// Handle window resize
onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
})

function updateContainerSize() {
  if (container.value) {
    store.containerWidth = container.value.clientWidth
    stageConfig.value.width = store.containerWidth
  }
}

// Zoom and pan controls
function zoomIn() {
  store.zoom(1.2)
}

function zoomOut() {
  store.zoom(0.8)
}

function panLeft() {
  store.pan(-7)
}

function panRight() {
  store.pan(7)
}

// Mouse wheel zoom
function handleWheel(e) {
  e.evt.preventDefault()
  const factor = e.evt.deltaY > 0 ? 0.8 : 1.2
  store.zoom(factor)
}

// Task dragging
let isDragging = false
let draggedTaskId = null
let originalStart = null
let originalEnd = null

function handleDragStart(taskId) {
  isDragging = true
  draggedTaskId = taskId
  const task = store.tasks.find((t) => t.id === taskId)
  originalStart = task.start
  originalEnd = task.end
}

function handleDragMove(e, taskId) {
  if (!isDragging) return

  const timeScale = store.timeScale
  const task = store.tasks.find((t) => t.id === taskId)
  const dx = e.target.x() - timeScale(task.start)
  const daysMoved =
    ((dx / (timeScale.range()[1] - timeScale.range()[0])) *
      (timeScale.domain()[1] - timeScale.domain()[0])) /
    (24 * 60 * 60 * 1000)

  const newStart = new Date(originalStart.getTime() + daysMoved * 24 * 60 * 60 * 1000)
  const newEnd = new Date(originalEnd.getTime() + daysMoved * 24 * 60 * 60 * 1000)

  store.updateTaskDates(taskId, newStart, newEnd)
}

function handleDragEnd() {
  isDragging = false
  draggedTaskId = null
  originalStart = null
  originalEnd = null
}

// Task resizing
let isResizing = false
let resizeTaskId = null
let resizeSide = null
let resizeOriginalX = null
let resizeOriginalStart = null
let resizeOriginalEnd = null

function startResize(taskId, side) {
  isResizing = true
  resizeTaskId = taskId
  resizeSide = side
  const task = store.tasks.find((t) => t.id === taskId)
  resizeOriginalStart = task.start
  resizeOriginalEnd = task.end
  resizeOriginalX = store.timeScale(task[side === 'left' ? 'start' : 'end'])
}

function handleMouseDown(e) {
  const node = e.target
  if (node && node.name() && node.name().startsWith('left-resize-')) {
    const taskId = parseInt(node.name().replace('left-resize-', ''))
    startResize(taskId, 'left')
  } else if (node && node.name() && node.name().startsWith('right-resize-')) {
    const taskId = parseInt(node.name().replace('right-resize-', ''))
    startResize(taskId, 'right')
  }
}

function handleMouseMove(e) {
  if (!isResizing) return

  const timeScale = store.timeScale
  const task = store.tasks.find((t) => t.id === resizeTaskId)
  const mouseX = e.evt.layerX
  const dx = mouseX - resizeOriginalX
  const daysMoved =
    ((dx / (timeScale.range()[1] - timeScale.range()[0])) *
      (timeScale.domain()[1] - timeScale.domain()[0])) /
    (24 * 60 * 60 * 1000)

  if (resizeSide === 'left') {
    const newStart = new Date(resizeOriginalStart.getTime() + daysMoved * 24 * 60 * 60 * 1000)
    if (newStart < task.end) {
      store.updateTaskDates(resizeTaskId, newStart, task.end)
    }
  } else {
    const newEnd = new Date(resizeOriginalEnd.getTime() + daysMoved * 24 * 60 * 60 * 1000)
    if (newEnd > task.start) {
      store.updateTaskDates(resizeTaskId, task.start, newEnd)
    }
  }
}

function handleMouseUp() {
  isResizing = false
  resizeTaskId = null
  resizeSide = null
  resizeOriginalX = null
  resizeOriginalStart = null
  resizeOriginalEnd = null
}
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 5px;
}

.controls button {
  padding: 5px 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
}

.controls button:hover {
  background: #f0f0f0;
}
</style>
