<template>
  <q-page>
    <q-input dark label="sql" v-model="input" />
    <q-input dark label="supercode" v-model="supercode" />
    <q-btn label="send" style="color: white" @click="send" />
    <span>Result: {{ result }}</span>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const input = ref('')
const supercode = ref('')
const result = ref('')

async function send() {
  const sqlresult = await api.post('/sql', { input: input.value, supercode: supercode.value })
  result.value = sqlresult.data
}

onMounted(() => {
  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})
</script>
