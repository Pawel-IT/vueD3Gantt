<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted } from 'vue'
const width = 900
const height = 600
const margin = { top: 30, right: 50, bottom: 60, left: 80 }

onMounted(() => {
  const svg = d3.select('#scatterplot').append('svg').attr('width', width).attr('height', height)

  const tooltip = d3.select('.tooltip')

  d3.csv(
    'https://gist.githubusercontent.com/sumera21/df73fc451d2f4169263fd33ae20043bd/raw/566920b9f6f68577cc80bb4cb839647698d05bb2/Cal_wildfire_ICE5.csv',
  )
    .then((data) => {
      data.forEach((d) => {
        d.incident_extinguished = d3.timeParse('%m-%d-%Y')(d.incident_extinguished)
        d.incident_longitude = +d.incident_longitude
        d.incident_latitude = +d.incident_latitude
        d.incident_acres_burned = +d.incident_acres_burned
      })
      console.log('date', d3.timeParse('%m-%d-%Y', new Date()).toString())
      // Remove outliers (using IQR method)
      const q1 = (arr) => d3.quantile(arr, 0.25)
      const q3 = (arr) => d3.quantile(arr, 0.75)
      const iqr = (q1, q3) => q3 - q1
      const lonValues = data.map((d) => d.incident_longitude).sort(d3.ascending)
      const latValues = data.map((d) => d.incident_latitude).sort(d3.ascending)

      const lonQ1 = q1(lonValues)
      const lonQ3 = q3(lonValues)
      const latQ1 = q1(latValues)
      const latQ3 = q3(latValues)
      // console.log(lonValues, lonQ1)

      const lonIQR = iqr(lonQ1, lonQ3)
      const latIQR = iqr(latQ1, latQ3)

      data = data.filter(
        (d) =>
          d.incident_longitude >= lonQ1 - 1.5 * lonIQR &&
          d.incident_longitude <= lonQ3 + 1.5 * lonIQR &&
          d.incident_latitude >= latQ1 - 1.5 * latIQR &&
          d.incident_latitude <= latQ3 + 1.5 * latIQR,
      )

      // Set scale domains
      const lonExtent = d3.extent(data, (d) => d.incident_longitude)
      const latExtent = d3.extent(data, (d) => d.incident_latitude)
      const xScale = d3
        .scaleLinear()
        .domain([lonExtent[0] - 0.1, lonExtent[1] + 0.1])
        .range([margin.left, width - margin.right])

      const yScale = d3
        .scaleLinear()
        .domain([latExtent[0] - 0.1, latExtent[1] + 0.1])
        .range([height - margin.bottom, margin.top])

      const radiusScale = d3
        .scaleSqrt()
        .domain(d3.extent(data, (d) => d.incident_acres_burned))
        .range([3, 25])

      const xAxis = d3.axisBottom(xScale)
      const yAxis = d3.axisLeft(yScale)

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('dy', '2.5em')
        .attr('fill', 'white')
        .style('text-anchor', 'middle')
        .text('Longitude')

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('dy', '-3em')
        .attr('fill', 'white')
        .style('text-anchor', 'middle')
        .text('Latitude')

      // Add scatter points
      svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.incident_longitude))
        .attr('y', (d) => height - yScale(d.incident_latitude) - margin.bottom)
        .attr('height', (d) => yScale(d.incident_latitude))
        .attr('width', (d) => radiusScale(d.incident_acres_burned))
        .attr('fill', 'lightgreen')
        .attr('opacity', 0.3)
      console.log(margin.top)
    })
    .catch((error) => {
      console.error('Error loading data:', error)
    })
})
</script>

<template>
  <div id="scatterplot"></div>
</template>

<style>
svg {
  background-color: #181818;
}
</style>
