<template>
  <q-page class="main">
    <h3>Impressum</h3>
    <p>Dort, wo die Akkus leer sind...</p>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})
</script>

<style scoped>
.main {
  color: white;
  padding: var(--std-pad);
}
</style>
