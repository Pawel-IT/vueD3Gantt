<script setup lang="ts">
import Basic from '@/components/Basic.vue'
import ComplexResizable from '@/components/ComplexResizable.vue'
import Gantt from '@/components/gantt.vue'
import LoopedRefMount from '@/components/LoopedRefMount.vue'
import SimpleWithNode from '@/components/SimpleWithNode.vue'
import DataManipulation from '@/DataManipulation.vue'
</script>

<template>
  <div v-if="false">
    <DataManipulation />
    <ComplexResizable />
    <SimpleWithNode />
    <LoopedRefMount />
  </div>
  <Basic />
</template>

<style></style>
