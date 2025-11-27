<template>
  <q-page class="main-container">
    <div class="bg-1" id="gradient-bg"></div>
    <h1>Alle Akkus. <span class="text-gradient">Eine App.</span></h1>
    <p class="headline-description">
      Mit <span class="text-gradient">BatterySync</span> überwachst du den Akku all deiner Geräte.
      <br />
      <span class="text-bold">Egal welche Plattform. </span>
    </p>

    <div class="platform-list">
      <div>
        <div>
          <h2>
            <span class="text-gradient">BatterySync</span>
            <span style="color: #ffffffaa; font-weight: 400">MacOS</span>
          </h2>
          <q-expansion-item label="Mehr Erfahren" switch-toggle-side>
            <p>
              Mit der MacOS App erhälst du Widgets verschiedener Größen. Dort werden deine Geräte
              angezeigt. <br />Außerdem kannst du Geräte verwalten und erhälst
              Erinnerungsbenachrichtigungen. <br />
              Leider kann die MacOS-Version aktuell nicht heruntergeladen werden.
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
            <span style="color: #ffffffaa; font-weight: 400">Android</span>
          </h2>
          <q-expansion-item label="Mehr Erfahren" switch-toggle-side>
            <p>
              Mit der Android App erhälst du ein Home&shy;screen-Widget, wo deine Geräte angezeigt
              werden. Außerdem erhälst du Erinnerungen, wenn du deine Geräte anschließen musst.
            </p>
          </q-expansion-item>

          <q-space />

          <div class="actions">
            <q-btn label="Download" class="btn" flat @click="downloadApk" :disable="lock" />
          </div>
        </div>

        <div>
          <h2>
            <span class="text-gradient">BatterySync</span> Lite
            <span style="color: #ffffffaa; font-weight: 400">Any Desktop Platform</span>
          </h2>
          <q-expansion-item label="Mehr Erfahren" switch-toggle-side>
            <p>
              BatterySync Lite bietet einen Hintergrund-Service, basierend auf Python. Dadurch
              kannst du den Akku deines Geräts tracken. Dieses Script funktioniert auf allen
              Platformen, die Python und die psutil-Library unterstützen. <br />
              Leider kann das Python-Script aktuell nicht heruntergeladen werden.
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
          <q-expansion-item label="Mehr Erfahren" switch-toggle-side>
            <p>
              In Entwicklung: <br />
              Mit der Android WearOS App stattest du deine Wearable mit dem BatterySync-Service aus,
              sodass du auch Akku-Insights für deine Uhr bekommst.
            </p>
          </q-expansion-item>

          <q-space />

          <div class="actions">
            <q-btn label="Download" class="btn" flat disable />
          </div>
        </div>
      </div>
    </div>

    <div class="wide">
      <div class="text">
        <h2>
          Unsere Server synchronisieren <br />
          deine Geräte <span class="text-bold">24/7</span>
        </h2>
        <p>Davon merkst Du nichts - die Apps laufen einfach im Hintergrund.</p>
        <h2 class="text-gradient-eco">Sparsam und Datenfreundlich</h2>
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
            Ca. 0.5% Akkuverbrauch am Tag
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
            Ca. 100 MB Datennutzung pro Monat
          </p>
        </div>
        <h2>
          Sicherheit
          <span style="display: inline-block">
            geht vor
            <svg
              class="locksvg"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#ffffff"
            >
              <path
                d="M420-360h120l-23-129q20-10 31.5-29t11.5-42q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 23 11.5 42t31.5 29l-23 129Zm60 280q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"
              />
            </svg>
          </span>
        </h2>
        <p id="p_ssl">Mit SSL-Verschlüsselung bleiben sogar deine Akkustände geheim.</p>
      </div>
      <div class="presentation">
        <img src="/Sync illustration.png" alt="" />
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { api } from 'src/boot/axios'
import { saveAs } from 'file-saver' // npm install file-saver

import { Notify } from 'quasar'
import { onMounted, ref } from 'vue'

const lock = ref(false)

async function downloadApk() {
  const notif = Notify.create({ type: 'ongoing', message: 'Downloading...' })
  lock.value = true
  try {
    const response = await api.get('/file/android', {
      responseType: 'blob',
    })

    saveAs(response.data, 'batterysync-android.apk')
    notif({ type: 'positive', message: 'Download abgeschlossen' })

    lock.value = false
  } catch {
    notif({ type: 'positive', message: 'Download fehlgeschlagen' })
    lock.value = false
  }
}

onMounted(() => {
  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 500)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})

/*
import { onMounted, onUnmounted } from 'vue'

function gradientShift() {
  const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
  if (scrollProgress > 0.5) return

  // Use HSL to smoothly change color hues based on scroll
  const hue1 = Math.floor(175 + scrollProgress * 60)
  const hue2 = Math.floor(214 + scrollProgress * 60)
  const hue3 = Math.floor(128 + scrollProgress * 60)
  const hue4 = Math.floor(268 + scrollProgress * 60)

  document.getElementById('gradient-bg').style.backgroundImage = `
    radial-gradient(16% 32% at 3% 53%, hsl(${hue1}, 71%, 34%) 0%, transparent 99%),
    radial-gradient(70% 53% at 32% 89%, hsl(${hue2}, 70%, 50%) 0%, transparent 100%),
    radial-gradient(42% 53% at 31% 73%, hsl(${hue3}, 70%, 50%) 7%, transparent 100%),
    radial-gradient(18% 28% at 35% 87%, hsl(${hue3}, 70%, 50%) 7%, transparent 100%),
    radial-gradient(31% 43% at 7% 98%, hsl(${hue3}, 70%, 50%) 24%, transparent 100%),
    radial-gradient(35% 56% at 91% 74%, hsl(${hue1}, 70%, 50%) 9%, transparent 100%),
    radial-gradient(27% 55% at 66% 88%, hsl(${hue4}, 70%, 50%) 0%, transparent 100%),
    linear-gradient(125deg, #000000 1%, #000000 100%)
  `
}

onMounted(() => {
  window.addEventListener('scroll', gradientShift)
})

onUnmounted(() => {
  window.removeEventListener('scroll', gradientShift)
})
  */
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
}

.bg-1 {
  z-index: -1;
  position: absolute;
  width: 100vw; //min(1200px, calc(100vw)

  height: 100%;
  top: 0;
  left: calc(-1 * (100vw - min(600px, calc(50vw))) + 50vw);
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
h1 {
  font-size: 56px;
  font-weight: 500;
  color: #ffffff;
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
  color: #fff;
  font-size: 20px;
}
.platform-list {
  width: calc(100% + 2 * var(--std-pad));
  position: relative;
  margin-left: calc(-1 * var(--std-pad));
  display: flex;
  justify-content: center;
  margin-bottom: 96px;

  > div {
    display: flex;
    flex-direction: row;
    //justify-content: center;
    gap: 24px;
    overflow: auto;
    padding: 12px;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer / Edge */

    /* Hide scrollbar for Chrome, Safari, and Opera */
    &::-webkit-scrollbar {
      display: none;
    }
  }

  > div > div {
    background-color: #00000092;
    border-radius: 24px;
    padding: 24px;
    box-shadow:
      0 0 12px #0f0f0f70,
      0 2px 3px #ffffff10 inset;
    //backdrop-filter: blur(10px);
    max-width: 300px;
    min-width: 300px;
    height: 100%;
    display: flex;
    flex-direction: column;

    h2 {
      width: 100%;
      margin: 0;
      margin-bottom: 12px;
      line-height: 1em;
      font-size: 30px;
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
  }
}
.wide {
  width: 100%;
  display: flex;
  gap: 24px;
  margin-top: 48px;
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
    }

    p {
      font-size: 18px;
      font-weight: 500;
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

.footer {
  background-color: black;
  width: 100vw;
  min-height: 300px;
  position: absolute;
  bottom: 0;
  left: 0;
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
</style>
