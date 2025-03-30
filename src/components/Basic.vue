<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import * as d3 from 'd3'
import { type BaseType, type Selection } from 'd3'
import { onMounted, ref } from 'vue'

const amplitude = ref(1)
const wavey = ref(0.5)
const points = 20

const visData = (
  selection: Selection<BaseType | SVGSVGElement, unknown, HTMLElement, undefined>,
  data,
) => {
  const lineGenerator = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y * amplitude.value)

  selection
    .selectAll('path')
    .data([null])
    .join('path')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 2)

  selection
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('r', (d) => d.r + d.y / 3)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y * amplitude.value)

  selection
    .selectAll('text')
    .data(data)
    .join('text')
    .text((d) => Math.round(d.y * amplitude.value))
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y * amplitude.value)
    .style('text-anchor', 'middle')
    .attr('class', 'text_label')
}
// selection.append('g').selectAll('path')

const pause_snake = ref(() => {})
const resume_snake = ref(() => {})
const isActive_snake = ref(true)

let t = 0
let t2 = 0
let grower = 1
const grow = () => {
  if (t2 > 10 && t2 < 20) {
    t2++
    grower--
  } else if (t2 > 1 && t2 < 10) {
    t2++
    grower++
  } else if (t2 >= 20) {
    t2 = 0
    grower = 1
  }
  t2 += 1

  return grower
}
onMounted(() => {
  setupChart()
})

const renderChart = () => {}
const setupChart = () => {
  const width = 600
  const height = 400
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  const svg = d3
    .select('#charter')
    .attr('width', width + 300)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  const { pause, resume, isActive } = useIntervalFn(() => {
    const data = d3.range(points).map((d, i) => ({
      x: d * 60 + 50,
      y: Math.round(150 + Math.sin(d * wavey.value + t) * 120),
      r: Math.max(0, grow() * 3 * Math.cos(i)),
    }))

    svg.call(visData, data)

    t += 0.3 //TODO: this will grow forever in memory, not a good idea lol so fix
    pause_snake.value = pause
    resume_snake.value = resume
    isActive_snake.value = isActive
  }, 100)
}
</script>

<template>
  <svg id="charter">
    <defs>
      <linearGradient id="header-shape-gradient" x2="0.35" y2="1">
        <stop offset="0%" stop-color="var(--color-stop)" />
        <stop offset="50%" stop-color="var(--color-stop)" />
        <stop offset="100%" stop-color="var(--color-bot)" />
      </linearGradient>
    </defs>
  </svg>

  <button
    v-if="isActive_snake.value"
    @click="pause_snake"
    style="background-color: darkred; color: white"
  >
    Pause
  </button>
  <button v-else @click="resume_snake" style="background-color: black; color: white">Resume</button>
  <label for="amplitude">Amplitude: {{ amplitude }}</label>
  <input type="range" v-model="amplitude" min="0" max="1.5" step=".05" />
  <label for="wavey">Wavey: {{ wavey }}</label>
  <input type="range" v-model="wavey" min="0" max="1.5" step=".05" />
</template>

<style>
svg circle {
  fill: url(#header-shape-gradient) chartreuse;
  fill-opacity: 0.4;
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 4;
  filter: drop-shadow(7px 7px 4px rgba(222, 222, 2, 0.2));
}
svg circle:hover {
  fill: chartreuse;
  fill-opacity: 0.7;
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 4;
  filter: drop-shadow(7px 7px 4px rgba(222, 222, 2, 0.2));
}
#header-shape-gradient {
  --color-stop: chartreuse;
  --color-bot: #faed34;
}

.text_label {
  color: white;
  fill: white;
  stroke-width: 0.5;
  stroke: black;
  font-size: 16px;
  font-weight: bold;
  filter: drop-shadow(3px 3px 4px rgba(0, 0, 2, 0.7));
}
</style>
