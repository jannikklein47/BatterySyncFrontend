<template>
  <q-page class="main-container">
    <div class="top">
      <div class="bg-1" id="gradient-bg"></div>
      <h1>
        {{ $t('indexpage.slogan-1') }}
        <span class="text-gradient">{{ $t('indexpage.slogan-2') }}</span>
      </h1>
      <p class="headline-description">
        {{ $t('indexpage.slogan-detail-1') }} <span class="text-gradient">BatterySync</span>
        {{ $t('indexpage.slogan-detail-2') }}
        <br />
        <span class="text-bold">{{ $t('indexpage.slogan-detail-3') }} </span>
      </p>

      <div class="platform-list">
        <q-btn
          class="nav left"
          icon="keyboard_arrow_left"
          flat
          dense
          :class="{ off: $q.platform.is.mobile }"
          @click="removeScroll"
        />
        <div id="platform-carousel">
          <div>
            <h2>
              <span class="text-gradient">BatterySync</span>
              <span style="color: #ffffffaa; font-weight: 400">MacOS</span>
            </h2>
            <q-expansion-item :label="$t('indexpage.viewmore')" switch-toggle-side>
              <p>
                {{ $t('indexpage.macos') }}
              </p>
            </q-expansion-item>

            <q-space />

            <div class="actions">
              <q-btn label="Download" class="btn" flat @click="downloadDmg" :disable="lock" />
            </div>
          </div>
          <div>
            <h2>
              <span class="text-gradient">BatterySync</span>
              <span style="color: #ffffffaa; font-weight: 400">Android</span>
            </h2>
            <q-expansion-item :label="$t('indexpage.viewmore')" switch-toggle-side>
              <p>
                {{ $t('indexpage.android') }}
              </p>
            </q-expansion-item>

            <q-space />

            <div class="actions">
              <q-btn
                label="Changelog"
                no-caps
                flat
                to="/releases"
                style="background-color: #ffffff20"
                rounded
              />
              <q-space />
              <q-btn
                label="Download"
                class="btn"
                flat
                @click="downloadVersion(newestBuild)"
                :disable="lock"
              />
            </div>
          </div>

          <div>
            <h2>
              <span class="text-gradient">BatterySync</span>Lite
              <span style="color: #ffffffaa; font-weight: 400">Desktop</span>
            </h2>
            <q-expansion-item :label="$t('indexpage.viewmore')" switch-toggle-side>
              <p>
                {{ $t('indexpage.desktop') }}
              </p>
            </q-expansion-item>

            <q-space />

            <div class="actions">
              <q-btn label="Download" class="btn" flat disable />
            </div>
          </div>

          <div>
            <h2>
              <span class="text-gradient">BatterySync</span>
              <span style="color: #ffffffaa; font-weight: 400">WearOS</span>
            </h2>
            <q-expansion-item :label="$t('indexpage.viewmore')" switch-toggle-side>
              <p>
                {{ $t('indexpage.wearos') }}
              </p>
            </q-expansion-item>

            <q-space />

            <div class="actions">
              <q-btn label="Download" class="btn" flat disable />
            </div>
          </div>
        </div>

        <q-btn
          class="nav right"
          icon="keyboard_arrow_right"
          flat
          dense
          :class="{ off: $q.platform.is.mobile }"
          @click="addScroll"
        />
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        class="q-mb-none"
        style="
          width: 100vw;
          position: relative;
          bottom: -12px;
          left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        "
      >
        <path
          fill="#000000"
          fill-opacity="1"
          d="M0,256L60,234.7C120,213,240,171,360,170.7C480,171,600,213,720,208C840,203,960,149,1080,144C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
    </div>

    <div class="sync-information">
      <div>
        <rolling-counter :value="syncCounter" />
        <p class="text-grey-3">{{ $t('indexpage.syncs') }}</p>
      </div>
      <div>
        <h2>{{ $t('indexpage.howitworks') }}</h2>
        <span><span class="text-gradient">1.</span> {{ $t('indexpage.installapp') }}</span>
        <q-icon name="keyboard_arrow_down" />
        <span><span class="text-gradient">2.</span> {{ $t('indexpage.adddevice') }}</span>
        <q-icon name="keyboard_arrow_down" />
        <span><span class="text-gradient">3.</span> {{ $t('indexpage.automaticsync') }}</span>
      </div>
    </div>
    <div
      class="phone-noti-advert"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
      "
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" st>
        <path
          fill="#3e73b8"
          fill-opacity="1"
          d="M0,160L80,154.7C160,149,320,139,480,154.7C640,171,800,213,960,208C1120,203,1280,149,1360,122.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>

      <div
        style="background-color: #3e73b8; margin-top: -12px; max-height: none; overflow: hidden"
        class="q-px-lg"
      >
        <div style="padding: 0 calc(50vw - 600px)">
          <q-intersection transition="scale" class="content-block" once>
            <div
              class="text-h2 text-weight-bold phone-noti-headline text-white"
              style="letter-spacing: 0.1em"
            >
              {{ $t('indexpage.neverempty-1') }}
              <span class="text-warning text-weight-bolder">{{
                $t('indexpage.neverempty-2')
              }}</span>
            </div>
          </q-intersection>

          <div style="width: 100%; display: flex" class="phone-noti-section">
            <q-intersection transition="scale" class="content-block" once>
              <div style="max-width: 450px">
                <div class="text-h6 text-grey-1" style="font-size: 24px">
                  {{ $t('indexpage.getreminders') }}
                </div>
                <div class="text-body2 text-grey-3 q-mt-md" style="font-size: 18px">
                  {{ $t('indexpage.getremindersdetail') }}
                </div>
                <div class="text-body2 text-grey-3 q-mt-md" style="font-size: 18px">
                  {{ $t('indexpage.forgetdevice') }}
                </div>
              </div>
            </q-intersection>
            <div>
              <phone-with-notification style="top: -550px; left: 200px" class="phone-svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      class="below-phone-wave"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #3e73b8;
        margin-top: -10px;
      "
    >
      <path
        fill="#28B0A5"
        fill-opacity="1"
        d="M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,186.7C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
      ></path>
    </svg>
    <div
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #28b0a5;
        margin-top: -10px;
      "
    >
      <div
        style="
          padding: 0 calc(50vw - 600px);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 48px;
        "
        class="phone-widget-section"
      >
        <q-intersection transition="scale" class="content-block" once>
          <div style="max-width: 540px" class="q-pa-lg">
            <div
              class="text-h2 text-weight-bold text-white phone-widget-headline q-mb-md"
              style="letter-spacing: 0.1em"
            >
              {{ $t('indexpage.alwaysvisible') }}
            </div>
            <div class="text-h6 text-grey-1">
              {{ $t('indexpage.widgetdetail-1') }}
              <span class="text-weight-bolder">BatterySync</span
              >{{ $t('indexpage.widgetdetail-2') }}
            </div>
            <div class="text-body2 text-grey-3 q-mt-md" style="font-size: 18px">
              {{ $t('indexpage.widgetversions') }}
            </div>
          </div>
        </q-intersection>

        <div class="q-pa-lg">
          <apple-widget style="width: min(calc(100vw - 48px), 495px); height: fit-content" />
        </div>
      </div>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #28b0a5;
        margin-top: 0;
      "
    >
      <path
        fill="#252525"
        fill-opacity="1"
        d="M0,96L80,101.3C160,107,320,117,480,133.3C640,149,800,171,960,160C1120,149,1280,107,1360,85.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      ></path>
    </svg>

    <div
      class="info-section q-pa-lg"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #252525;
        margin-top: -10pxpx;
        display: flex;
        align-items: center;
        margin-bottom: -5px;
        top: -1px;
      "
    >
      <q-intersection transition="scale" class="content-block" once>
        <div class="text-h3 text-weight-regular text-center">
          {{ $t('indexpage.allweek') }} <span class="text-weight-bold">24/7</span>
        </div>
      </q-intersection>

      <q-intersection transition="scale" class="content-block" once>
        <p class="q-mt-md">{{ $t('indexpage.inbackground') }}</p>
      </q-intersection>

      <q-intersection transition="scale" class="content-block" once>
        <h2>{{ $t('indexpage.efficient') }}</h2>
      </q-intersection>

      <q-intersection transition="scale" class="content-block" once>
        <div class="savings">
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path
                d="M120-320v-320 320Zm40 80q-50 0-85-35t-35-85v-240q0-50 35-85t85-35h480v80H160q-17 0-28.5 11.5T120-600v240q0 17 11.5 28.5T160-320h480v80H160Zm560-80v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z"
              />
            </svg>
            {{ $t('indexpage.batteryperday') }}
          </p>
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path
                d="M480-120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM254-346l-84-86q59-59 138.5-93.5T480-560q92 0 171.5 35T790-430l-84 84q-44-44-102-69t-124-25q-66 0-124 25t-102 69ZM84-516 0-600q92-94 215-147t265-53q142 0 265 53t215 147l-84 84q-77-77-178.5-120.5T480-680q-116 0-217.5 43.5T84-516Z"
              />
            </svg>
            {{ $t('indexpage.datapermonth') }}
          </p>
        </div>
      </q-intersection>
    </div>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #3e73b8;
        margin-top: 0;
      "
    >
      <path
        fill="#252525"
        fill-opacity="1"
        d="M0,128L80,138.7C160,149,320,171,480,165.3C640,160,800,128,960,106.7C1120,85,1280,75,1360,69.3L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
      ></path>
    </svg>

    <div
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #3e73b8;
        margin-top: -10px;
      "
    >
      <div
        style="
          padding: 0 calc(50vw - 600px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 48px;
        "
      >
        <q-intersection transition="scale" class="content-block" once>
          <div class="q-pa-lg">
            <div class="text-h2 text-weight-bold text-white" style="letter-spacing: 0.1em">
              {{ $t('indexpage.safety') }}
            </div>
            <div class="text-h6 text-grey-2 q-mt-md">
              <span class="text-weight-bolder">BatterySync</span> {{ $t('indexpage.safetyslogan') }}
            </div>
            <div class="text-body2 text-grey-4 q-mt-md" style="font-size: 18px">
              {{ $t('indexpage.safetydetail1') }}
            </div>
            <div
              class="text-body2 text-grey-4 q-mt-md"
              style="font-size: 18px; margin-bottom: -50px"
            >
              {{ $t('indexpage.safetydetail2') }}
            </div>
          </div>
        </q-intersection>

        <div class="q-pa-lg">
          <secure-connection style="width: min(calc(100vw - 48px), 800px); height: fit-content" />
        </div>
      </div>
    </div>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      style="
        width: 100vw;
        position: relative;
        left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
        background-color: #000;
        margin-top: 0;
      "
    >
      <path
        fill="#3e73b8"
        fill-opacity="1"
        d="M0,128L48,106.7C96,85,192,43,288,48C384,53,480,107,576,112C672,117,768,75,864,53.3C960,32,1056,32,1152,48C1248,64,1344,96,1392,112L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      ></path>
    </svg>

    <div class="faq">
      <div class="bg-2" id="gradient-bg-asd"></div>

      <h2>FAQ</h2>
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            {{ $t('indexpage.faq-why-head') }} <span class="text-gradient">BatterySync</span>?
          </h3>
          <p>
            {{ $t('indexpage.faq-why-content') }}
          </p>
        </div>
      </q-intersection>
      <q-separator dark inset />
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            {{ $t('indexpage.faq-cost-head-1') }} <span class="text-gradient">BatterySync</span>
            {{ $t('indexpage.faq-cost-head-2') }}
          </h3>
          <p>
            {{ $t('indexpage.faq-cost-content') }}
          </p>
        </div>
      </q-intersection>
      <q-separator dark inset />
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            <span class="text-gradient"> BatterySync </span> {{ $t('indexpage.faq-battery-head') }}
          </h3>
          <p>
            {{ $t('indexpage.faq-battery-content') }}
          </p>
        </div>
      </q-intersection>
      <q-separator dark inset />
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            {{ $t('indexpage.faq-security-head-1') }} <span class="text-gradient">BatterySync</span>
            {{ $t('indexpage.faq-security-head-2') }}
          </h3>
          <p>
            {{ $t('indexpage.faq-security-content') }}
          </p>
        </div>
      </q-intersection>
      <q-separator dark inset />
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            {{ $t('indexpage.faq-where-head-1') }} <span class="text-gradient">BatterySync</span>
            {{ $t('indexpage.faq-where-head-2') }}
          </h3>
          <p>{{ $t('indexpage.faq-where-content') }}</p>
        </div>
      </q-intersection>
      <q-separator dark inset />
      <q-intersection transition="scale" class="content-block" once>
        <div>
          <h3>
            {{ $t('indexpage.faq-os-head-1') }} <span class="text-gradient">BatterySync</span>
            {{ $t('indexpage.faq-os-head-2') }}
          </h3>
          <p>
            {{ $t('indexpage.faq-os-content') }}
          </p>
        </div>
      </q-intersection>
    </div>
  </q-page>
</template>
<script setup>
import { api } from 'src/boot/axios'
import { saveAs } from 'file-saver' // npm install file-saver

import { Notify } from 'quasar'
import { onMounted, ref } from 'vue'
import RollingCounter from 'src/components/RollingCounter.vue'
import PhoneWithNotification from 'src/components/PhoneWithNotification.vue'
import AppleWidget from 'src/components/AppleWidget.vue'
import SecureConnection from 'src/components/SecureConnection.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const lock = ref(false)

let counterStart = { val: 1000000, date: new Date(2025, 11, 17, 15, 52), growth: 0.00044 }
const syncCounter = ref(
  counterStart.val + (new Date(Date.now()) - counterStart.date) * counterStart.growth,
)
const targetValue = ref(
  counterStart.val + (new Date(Date.now()) - counterStart.date) * counterStart.growth,
)

const newestBuild = ref('')

async function downloadDmg() {
  const notif = Notify.create({ type: 'ongoing', message: 'Downloading...' })
  lock.value = true
  try {
    const response = await api.get('/file/macos', {
      responseType: 'blob',
    })

    saveAs(response.data, 'batterysync-macos.dmg')
    notif({ type: 'positive', message: t('indexpage.download-success') })

    lock.value = false
  } catch {
    notif({ type: 'positive', message: t('indexpage.download-fail') })
    lock.value = false
  }
}

onMounted(async () => {
  // Get the timings for the counter
  const result = await api.get('/appinfo/syncs')
  counterStart = {
    val: result.data.val,
    date: new Date(result.data.date).setDate(new Date(result.data.date).getDate() + 1),
    growth: result.data.growth,
  }
  syncCounter.value =
    counterStart.val + (new Date(Date.now()) - counterStart.date) * counterStart.growth
  targetValue.value =
    counterStart.val + (new Date(Date.now()) - counterStart.date) * counterStart.growth

  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }

  // Start the request counter
  function updateTarget() {
    targetValue.value = counterStart.val + (Date.now() - counterStart.date) * counterStart.growth

    const delay = 5000 * Math.random()
    setTimeout(updateTarget, delay)
  }

  updateTarget()

  function startRolling() {
    const step = () => {
      if (syncCounter.value < targetValue.value) {
        syncCounter.value += 1
      }
      setTimeout(step, 500 + Math.random() * 1000) // smooth tick, no randomness
    }
    step()
  }

  startRolling()

  getNewestBuild()
})

function addScroll() {
  const currScroll = document.getElementById('platform-carousel').scrollLeft
  const distanceNeeded = document.querySelectorAll('#platform-carousel > div')[0].scrollWidth
  document.getElementById('platform-carousel').scroll({
    left: currScroll + distanceNeeded,
    behavior: 'smooth',
  })
}

function removeScroll() {
  const currScroll = document.getElementById('platform-carousel').scrollLeft
  const distanceNeeded = document.querySelectorAll('#platform-carousel > div')[0].scrollWidth
  document.getElementById('platform-carousel').scroll({
    left: currScroll - distanceNeeded,
    behavior: 'smooth',
  })
}

async function getNewestBuild() {
  try {
    const response = await api.get('/appInfo/updates/android/all')
    newestBuild.value = response.data[0].build
  } catch (error) {
    console.error(error)
  }
}

const downloadVersion = (version) => {
  // We point the browser directly to the download URL
  // Replace with your actual base URL
  const url = `https://batterysync.de:3000/appInfo/updates/download/${version}`
  window.open(url, '_blank')
}
</script>
<style lang="scss" scoped>
.main-container {
  min-height: 400vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  //align-items: center;
  color: white;
  padding: var(--std-pad);
  padding-bottom: 0;
  //gap: 48px;

  > div {
    // page chapter containers
    position: relative;
  }
}

.bg-1 {
  z-index: -1;
  position: absolute;
  width: 100vw; //min(1200px, calc(100vw)

  height: 100%;
  top: 0;
  left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
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
    radial-gradient(35% 56% at 91% 74%, #26d9ca 9%, #073aff00 100%),
    radial-gradient(27% 55% at 66% 88%, #7a26d9 0%, #0000 100%),
    linear-gradient(125deg, #000000ff 1%, #000000ff 100%);
}
.bg-2 {
  z-index: -1;
  position: absolute;
  width: 100vw; //min(1200px, calc(100vw)

  height: 100%;
  top: 0;
  left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw - var(--std-pad));
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
    radial-gradient(20% 34% at 6% 48%, #19948a 0%, #0000 96%),
    radial-gradient(68% 50% at 36% 92%, #2674d9 0%, #073aff00 100%),
    radial-gradient(44% 56% at 28% 70%, #26d93e 10%, #073aff00 100%),
    radial-gradient(22% 30% at 38% 85%, #26d93e 8%, #073aff00 100%),
    radial-gradient(34% 46% at 10% 96%, #26d93e70 22%, #073aff00 100%),
    radial-gradient(38% 60% at 88% 72%, #26d9ca 12%, #073aff00 100%),
    radial-gradient(30% 58% at 64% 90%, #7a26d9 0%, #0000 100%),
    linear-gradient(132deg, #000000ff 0%, #000000ff 100%);
  opacity: 0.2;
}
h1 {
  font-size: 56px;
  font-weight: 500;
  text-align: center;
}
.text-gradient {
  background-image: linear-gradient(10deg, #3e73b8 0%, #28b0a5 53%, #7cde89 100%);
  color: transparent;
  background-clip: text;
  font-weight: 500;
  display: inline-block;
}
.text-gradient-eco {
  background-image: linear-gradient(135deg, #ffffff 0%, #00e171 100%);
  color: transparent;
  background-clip: text;
  font-weight: 500;
}
.headline-description {
  text-align: center;
  margin-bottom: 48px;
  font-size: 20px;
}
.platform-list {
  width: calc(100% + 2 * var(--std-pad));
  position: relative;
  margin-left: calc(-1 * var(--std-pad));
  display: flex;
  justify-content: center;
  //margin-bottom: 96px;
  align-items: center;

  > div {
    display: flex;
    flex-direction: row;
    //justify-content: center;
    gap: 24px;
    overflow: auto;
    padding: 12px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer / Edge */

    scroll-snap-type: x mandatory;

    position: relative;

    -webkit-mask: linear-gradient(90deg, #0000, #000 5% 95%, #0000);

    /* Hide scrollbar for Chrome, Safari, and Opera */
    &::-webkit-scrollbar {
      display: none;
    }
  }

  > div > div {
    border-radius: 24px;
    padding: 24px;
    max-width: min(400px, calc(100vw - 96px));
    min-width: min(400px, calc(100vw - 96px));
    height: fit-content;
    display: flex;
    flex-direction: column;
    scroll-snap-align: center;

    background-color: #60606043;
    border: 1px solid #fff2;
    position: relative;

    &:first-child {
      margin-left: 2%;
    }

    &:last-child {
      margin-right: 2%;
    }

    h2 {
      width: 100%;
      margin: 0;
      margin-bottom: 12px;
      line-height: 1em;
      font-size: 30px;
      span:first-child {
        margin-right: 6px;
      }
    }
    .actions {
      width: 100%;
      display: flex;
      justify-content: end;
      margin-top: 12px;

      .btn {
        background-image: linear-gradient(100deg, #7cde89 0%, #28b0a5 53%, #3e73b8 100%);
      }
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      pointer-events: none;
      background: linear-gradient(to right, #0000, #ffff, #0000);
      opacity: 0.25;
      transition: opacity 0.4s;
    }

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      pointer-events: none;
      background: linear-gradient(to right, #0000, #ffff, #0000);
      opacity: 0.1;
      transition: opacity 0.4s;
    }

    &:hover::after,
    &:hover::before {
      opacity: 0.4;
    }
  }

  .nav {
    width: fit-content;
    height: fit-content;
    border-radius: 100px;
    background-color: #fff2;

    &.off {
      display: none;
    }
  }
}

.top {
  color: #eee;
}

.wide {
  width: 100%;
  display: flex;
  gap: 24px;
  margin-top: 48px;
  margin-bottom: 48px;
  justify-content: space-between;

  .text {
    display: flex;
    flex-direction: column;

    h2 {
      margin: 0;
      margin-bottom: 12px;
      font-size: 40px;
      font-weight: 500;
      line-height: 1.2em;
      color: #eee;
    }

    p {
      font-size: 18px;
      font-weight: 500;
      color: #ddd;
    }

    .savings {
      p {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 12px;

        svg {
          fill: #00e171;
        }
      }
    }

    .locksvg {
      scale: 1.5;
      fill: #26d9ca;
    }
  }

  .presentation {
    img {
      height: 400px;
      border-radius: 24px;
      box-shadow: 0 0 24px #00000077;
    }
  }
}

.info-section {
  display: flex;
  flex-direction: column;

  h2 {
    margin: 0;
    margin-bottom: 12px;
    font-size: 40px;
    font-weight: 500;
    line-height: 1.2em;
    color: #eee;
  }

  p {
    font-size: 18px;
    font-weight: 500;
    color: #ddd;
  }

  .savings {
    p {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 12px;

      svg {
        fill: #00e171;
      }
    }
  }

  .locksvg {
    scale: 1.5;
    fill: #26d9ca;
  }
}

.sync-information {
  margin-top: 24px;
  display: flex;
  > div {
    width: 50%;
    padding: var(--std-pad);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    h2 {
      margin: 0;
      margin-bottom: 12px;
      font-size: 36px;
      font-weight: 500;
    }

    > span {
      font-weight: 400;
      font-size: 20px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 12px;

      .text-gradient {
        font-size: 28px;
      }
    }

    i {
      color: #bbb;
    }
  }
}

.faq {
  color: #bbb;
  h2 {
    width: 100%;
    text-align: center;
    font-weight: 500;
    color: #aaa;
    margin-bottom: 30px;
  }

  > div {
    transition: color 0.5s;
    padding: var(--std-pad);
    p {
      font-size: 16px;
    }
    &:hover {
      color: #eee;
    }
  }
}

.footer {
  background-color: black;
  width: 100vw;
  min-height: 300px;
  position: absolute;
  bottom: 0;
  left: 0;
}

.phone-noti-advert {
  margin-bottom: -400px;
}

.phone-svg {
  zoom: 0.8;
}

.phone-widget-section {
  flex-direction: row;
}
@media only screen and (max-width: 800px) {
  .phone-noti-advert {
    //margin-bottom: 0;
  }

  .phone-noti-headline {
    width: 100%;
    text-align: center;
  }
  .phone-widget-headline {
    width: 100%;
    text-align: center;
  }
  .phone-noti-section {
    flex-direction: column;
    display: flex;
    align-items: center;

    .phone-svg {
      width: fit-content;
      bottom: 0;
      left: 0 !important;
      top: -600px !important;
      zoom: 0.7;
      -webkit-mask: linear-gradient(0deg, #000 30%, #0000 55%);
    }
  }

  .phone-widget-section {
    flex-direction: column;
  }
}

@media only screen and (max-width: 900px) {
  .wide {
    flex-direction: column;
    z-index: 1;

    * {
      text-align: center;
    }

    .text {
      align-items: center;
    }
  }
  .sync-information {
    flex-direction: column;

    > div {
      width: 100%;
    }
  }
  #p_ssl {
    padding: 0 12px;
  }
  .presentation {
    z-index: -1;
  }
  .presentation > img {
    margin-top: -100px;
    height: unset !important;
    width: 100%;
    display: none;
  }
}

.content-block {
  min-height: 100px;
}
</style>
