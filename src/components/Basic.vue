<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'
import { color, type Path, range, svg } from 'd3'

onMounted(() => {
  const width = 600
  const height = 400
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  const svg = d3
    .select('#charter')
    .attr('width', width + 300)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // Append a path for the area (under the axes).

  let t = 0
  let t2 = 0
  let grower = 1

  const visData = (selection, data) => {
    const lineGenerator = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y)

    selection
      .selectAll('path')
      .data([null])
      .join('path')
      .attr('d', lineGenerator(data))
      .attr('fill', 'none')
      .attr('stroke', 'white')

    selection
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('r', (d) => d.r)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
  }

  setInterval(() => {
    const points = 20
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
    const data = d3.range(points).map((d, i) => ({
      x: d * 60 + 50,
      y: 250 + Math.sin(d * 0.5 + t) * 120,
      r: grower * 2 * i,
    }))
    //Define
    // const circles = svg.selectAll('circle').data(data)
    svg.call(visData, data)

    //Enter at Start
    // this works with the merge method below
    //const circlesEnter = circles.enter().append('circle').attr('r', 20)

    //Update
    // Merge makes it so it first does the enter state on first render then does updates
    // circles
    //   .merge(circlesEnter)
    //   .attr('cx', (d) => d.x)
    //   .attr('cy', (d) => d.y)

    // circles
    //   .join('circle')
    //   .attr('r', (d, i) => i * grower)
    //   .attr('cx', (d) => d.x)
    //   .attr('cy', (d) => d.y)

    t += 0.3
  }, 100)
})
</script>

<template>
  <svg id="charter"></svg>
</template>

<style>
svg circle {
  fill: chartreuse;
  opacity: 0.4;
  stroke: #f2f2f2;
  stroke-width: 2;
}
</style>
