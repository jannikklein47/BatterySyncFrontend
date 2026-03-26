<template>
  <q-page class="main">
    <div class="bg-1"></div>
    <div class="text">
      <h1>
        Download <br />
        <span class="text-gradient">BatterySync</span>
      </h1>
    </div>

    <div class="login">
      <span class="text-subtitle2 text-grey-5 q-mb-md"
        >Der Download startet automatisch. Falls das nicht funktioniert, klicke bitte hier:</span
      >
      <q-btn
        class="submit-btn"
        label="Download"
        no-caps
        flat
        @click="downloadApk"
        :disable="lock"
      />
      <span class="text-overline text-grey-5 q-mt-xl"
        >Fortschritt: {{ Math.round(progress * 100) }}%</span
      >
      <q-linear-progress :value="progress" color="primary" class="q-mt-sm" animation-speed="200" />
    </div>
  </q-page>
</template>
<script setup>
import { Notify } from 'quasar'
import { onMounted, ref } from 'vue'
import { saveAs } from 'file-saver' // npm install file-saver
import { api } from 'src/boot/axios'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const progress = ref(0)

const lock = ref(false)
async function downloadApk() {
  const notif = Notify.create({ type: 'ongoing', message: 'Downloading...' })
  lock.value = true
  try {
    const response = await api.get('/file/android', {
      responseType: 'blob',
      onDownloadProgress: function (progressEvent) {
        progress.value = progressEvent.loaded / progressEvent.total
      },
    })

    saveAs(response.data, 'batterysync-android.apk')
    notif({ type: 'positive', message: t('indexpage.download-success') })

    lock.value = false
  } catch {
    notif({ type: 'positive', message: t('indexpage.download-fail') })
    lock.value = false
  }
}

onMounted(() => {
  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
  lock.value = true
  setTimeout(() => {
    downloadApk()
  }, 1000)
})
</script>
<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 24px;
  gap: 48px;
}
.text-gradient {
  background-image: linear-gradient(10deg, #3e73b8 0%, #28b0a5 53%, #7cde89 100%);
  color: transparent;
  background-clip: text;
  font-weight: 500;
  display: inline-block;
}

.bg-1 {
  z-index: -1;
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-size: max(500px, 100%) 100%;
  background-position:
    0px 0px,
    0px 0px,
    0px 0px,
    0px 0px,
    0px 0px,
    0px 0px,
    0px 0px,
    0px 0px;
  background-image:
    radial-gradient(16% 32% at 3% 53%, #19948a 0%, #0000 99%),
    radial-gradient(70% 53% at 32% 89%, #2674d9 0%, #073aff00 100%),
    radial-gradient(42% 53% at 31% 73%, #26d93e 7%, #073aff00 100%),
    radial-gradient(18% 28% at 35% 87%, #26d93e 7%, #073aff00 100%),
    radial-gradient(31% 43% at 7% 98%, #26d93e89 24%, #073aff00 100%),
    radial-gradient(35% 56% at 91% 80%, #26d9ca 9%, #073aff00 100%),
    radial-gradient(27% 55% at 66% 80%, #7a26d9 0%, #0000 100%),
    linear-gradient(125deg, #000000ff 1%, #000000ff 100%);
}
.text {
  width: 100%;
  text-align: center;
}
.text > h1 {
  font-size: 48px;
  color: white;
  line-height: 1.2em;
}
.login {
  //background-color: black;
  width: min(100%, 400px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #00000055;
  padding: 24px;
  border-radius: 24px;
  box-shadow:
    0 2px 3px #ffffff20 inset,
    0 0 24px #00000077;

  h2 {
    margin: 0;
    line-height: 1.2em;
    font-size: 48px;
    font-weight: 500;
  }

  p {
    font-size: 20px;
  }

  .submit-btn {
    width: 200px;
    background-image: linear-gradient(100deg, #7cde89 0%, #28b0a5 53%, #3e73b8 100%);
  }

  .register-btn {
    text-decoration: underline;
    font-size: 20px;
    padding: 6px;
  }

  * {
    color: #fff;
  }
}
</style>
