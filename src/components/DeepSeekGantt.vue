<script setup lang="ts">
import { svg } from 'd3'
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'

// Sample data
const tasks = [
  { id: 1, name: 'Task 1', start: '2023-01-01', end: '2023-01-10', progress: 80 },
  { id: 2, name: 'Task 2', start: '2023-01-05', end: '2023-01-15', progress: 30 },
  { id: 3, name: 'Task 3', start: '2023-01-12', end: '2023-01-20', progress: 10 },
  { id: 4, name: 'Task 4', start: '2023-01-18', end: '2023-01-25', progress: 0 },
]

// Set up dimensions
const margin = { top: 20, right: 20, bottom: 50, left: 150 }
const width = 800 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

// Parse dates
const parseTime = d3.timeParse('%Y-%m-%d')

// Process data
tasks.forEach((task) => {
  task.start = parseTime(task.start)
  task.end = parseTime(task.end)
})

onMounted(() => {
  // canvasref.value.append(canvas.node())

  // Create SVG
  const svg = d3
    .select('#gantt-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Set up scales
  const xScale = d3
    .scaleTime()
    .domain([d3.min(tasks, (d) => d.start), d3.max(tasks, (d) => d.end)])
    .range([0, width])

  const yScale = d3
    .scaleBand()
    .domain(tasks.map((d) => d.name))
    .range([0, height])
    .padding(0.2)

  // Add X axis
  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale))

  // Add Y axis
  svg.append('g').call(d3.axisLeft(yScale))

  // Create bars
  svg
    .selectAll('.task-bar')
    .data(tasks)
    .enter()
    .append('rect')
    .attr('class', 'task-bar')
    .attr('x', (d) => xScale(d.start))
    .attr('y', (d) => yScale(d.name))
    .attr('width', (d) => xScale(d.end) - xScale(d.start))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'steelblue')

  // Add progress bars
  svg
    .selectAll('.progress-bar')
    .data(tasks)
    .enter()
    .append('rect')
    .attr('class', 'progress-bar')
    .attr('x', (d) => xScale(d.start))
    .attr('y', (d) => yScale(d.name))
    .attr('width', (d) => (xScale(d.end) - xScale(d.start)) * (d.progress / 100))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'green')

  // Add task labels
  svg
    .selectAll('.task-label')
    .data(tasks)
    .enter()
    .append('text')
    .attr('class', 'task-label')
    .attr('x', (d) => xScale(d.start) - 10)
    .attr('y', (d) => yScale(d.name) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .text((d) => d.name)

  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''))

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'white')
    .style('padding', '5px')
    .style('border', '1px solid #ccc')

  // Add tooltip events
  svg
    .selectAll('.task-bar')
    .on('mouseover', function (event, d) {
      tooltip.transition().duration(200).style('opacity', 0.9)
      tooltip
        .html(
          `Task: ${d.name}<br/>Duration: ${(d.end - d.start) / (1000 * 60 * 60 * 24)} days<br/>Progress: ${d.progress}%`,
        )
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px')
    })
    .on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 100)
    })
})
</script>

<template>
  <div id="gantt-container"></div>
</template>

<style scoped></style>
