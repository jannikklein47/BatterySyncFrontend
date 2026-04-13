<template>
  <router-view />
  <q-dialog v-model="showDialog" backdrop-filter="blur(10px)" persistent style="z-index: 10000">
    <div
      class="recommendation-popup"
      :style="'--gradient-start: #3e73b8' + ';--gradient-end: #7cde89'"
    >
      <div class="title">
        <h1 class="text-gradient">App-Probleme</h1>
      </div>
      <div class="content">
        <span class="caption">
          Es gibt Probleme, die BatterySync-Server zu erreichen. Bitte überprüfe deine
          Internetverbindung und versuche es erneut. Falls das Problem weiterhin besteht,
          kontaktiere bitte den Support.
        </span>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const showDialog = ref(false)

let checkInterval = null

onMounted(() => {
  //$q.dark.set(true)
  document.getElementById('loading-progress').style.height = '30%'

  setTimeout(() => {
    if (document.getElementById('loading-screen').style.opacity !== '0') {
      showDialog.value = true
      checkInterval = setInterval(() => {
        if (document.getElementById('loading-screen').style.opacity === '0') {
          showDialog.value = false
          clearInterval(checkInterval)
        }
      }, 500)
    }
  }, 5000)
})
</script>

<style lang="scss">
.recommendation-popup {
  background-color: var(--main-bg-color);
  color: #fff;
  --gradient-start: #000000;
  --gradient-end: #ffffff;
  width: 100%;

  > div {
    padding: 24px 48px;
  }

  .title {
    min-height: 100px;
    background: linear-gradient(220deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    position: relative;

    h1 {
      margin: 0;
      line-height: 1.2em;
      font-size: 30px;
      font-weight: 500;
    }

    .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: #ffffff30;
    }
  }

  .content {
    font-size: 18px;
    display: flex;
    align-items: start;
    flex-direction: column;
    gap: 12px;
    color: white;
    background-color: #25262c;

    > label {
      width: 100%;
    }

    .confirm-button {
      margin-top: 12px;
      font-size: 18px;
      background-color: #00d50b1b;
      color: green;
      min-width: 250px;
    }
  }

  &.news {
    min-width: min(800px, 100vw);
  }
}
</style>
