<script setup lang="ts">
import Basic from '@/components/Basic.vue'
import OptionsDynamic from '@/components/OptionsDynamic.vue'
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'
const show_examples = ref(false)

const selected = ref(d3)
const val = ref(1)
const multiplyer = 5
const data = ref([
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 3, y: 7 },
])

const chart_options = ref({
  width: 500,
  height: d3.max(d3.map(data.value, (d) => d.y * multiplyer)),
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
})

onMounted(() => {
  selected.value = d3.selectAll('#container')
  plot()
})
watch(val, (newVal) => {
  const newHeight = newVal * 2
  d3.selectAll('#chart1-2').transition().duration(333).attr('height', newHeight)
  const mapped = d3.map(data.value, (d) => d.y * multiplyer)
  chart_options.value.height = d3.max([...mapped, newHeight])

  // data.value[1].y = newVal
  // plot()
})
const plot = () => {
  selected.value
    .selectAll('rect')
    .data(data.value)
    .join('rect')
    .transition()
    .duration(633)
    .attr('x', (d, i) => d.x * 12 * i)
    .attr('id', (d, i) => `chart1-${d.x}`)
    .attr('width', (d) => d.x * 11)
    .attr('height', (d) => d.y * multiplyer)
    // .attr('fill', 'orange')
    .attr('stroke', 'black')
    .attr('stroke-width', 0)
}
</script>

<template>
  <label for="val">{{ val }}</label>
  <input type="range" v-model="val" />
  <svg viewBox="0 0 200 200">
    <g class="relative">
      <svg id="container" :height="chart_options.height"></svg>
    </g>
  </svg>
  <button @click="show_examples = !show_examples">
    {{ show_examples ? 'Hide' : 'Show' }} Examples
  </button>
  <div v-if="show_examples">
    <Basic />
    <OptionsDynamic />
  </div>
</template>

<style scoped>
#container {
  fill: darkred;
  stroke: darkred;
}

#chart {
  fill: darkred;
  stroke: darkred;
}
</style>
