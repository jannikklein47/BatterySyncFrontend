<template>
  <q-page>
    <q-input dark label="sql" v-model="input" />
    <q-btn label="send" style="color: white" @click="send" />
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'

const input = ref('')

async function send() {
  await api.post('/sql', { input: input })
}
</script>
