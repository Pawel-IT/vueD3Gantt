<script lang="ts">
import Basic from '@/components/Basic.vue'
import * as d3 from 'd3'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { Basic },
  data: function () {
    return {
      whales: [
        { age: 13, weight: 114 },
        { age: 33, weight: 101 },
        { age: 52, weight: 139 },
      ],
    }
  },
  watch: {
    whales: {
      deep: true,
      handler() {
        this.plot()
      },
    },
  },
  methods: {
    plot() {
      this.x.domain([0, d3.max(this.whales, (d) => d.age)])
      this.y.domain([0, d3.max(this.whales, (d) => d.weight)])

      this.xAxis.call(d3.axisBottom(this.x))
      this.yAxis.call(d3.axisLeft(this.y))

      this.chart
        .selectAll('.point')
        .data(this.whales)
        .join('g')
        .attr('class', 'point')
        .attr('transform', (d) => `translate(${this.x(d.age)}, ${this.y(d.weight)})`)
        .append('circle')
        .attr('r', 5)
    },
    addWhale() {
      this.whales.push({
        age: Math.random() * 80,
        weight: Math.random() * 200,
      })
    },
    modifyWhale() {
      if (this.whales.length > 0) {
        const i = Math.floor(Math.random() * this.whales.length)
        this.whales[i].age = Math.floor(Math.random() * 80)
        this.whales[i].weight = Math.floor(Math.random() * 200)
      }
    },
    removeWhale() {
      if (this.whales.length > 0) {
        const i = Math.floor(Math.random() * this.whales.length)
        this.whales.splice(i, 1)
      }
    },
  },
  mounted() {
    const width = 400
    const height = 200
    const margin = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 60,
    }

    this.chart = d3
      .select('#chart')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.x = d3.scaleLinear().range([0, width - margin.left - margin.right])

    this.y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])

    this.xAxis = this.chart
      .append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)

    this.yAxis = this.chart.append('g')

    this.chart
      .append('text')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.top - margin.bottom + 40)
      .text('Age (years)')

    this.chart
      .append('text')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (height - margin.top - margin.bottom) / 2)
      .attr('y', -40)
      .text('Weight (tons)')

    this.plot()
  },
})
</script>

<template>
  <Basic />
  <button @click="addWhale">Add whale</button>
  <button @click="modifyWhale">Modify whale</button>
  <button @click="removeWhale">Remove whale</button>
  <svg id="chart" viewBox="0 0 500 500"></svg>
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
