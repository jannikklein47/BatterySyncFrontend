<template>
  <q-page class="main">
    <!--Overview-->
    <aside class="device-list" v-if="computedDevices.length > 0">
      <div class="favorites">
        <h2>Favoriten</h2>
        <q-btn
          flat
          no-caps
          align="left"
          padding="12px"
          v-for="device in computedDevices.filter((dev) => dev.favorite)"
          :key="device.id"
          @click="scrollToDevice(device.id)"
          :data-target="'device-setting-' + device.id"
          >{{ device.name }}
        </q-btn>
      </div>

      <div class="list">
        <h2>Geräte</h2>
        <q-btn
          flat
          no-caps
          align="left"
          padding="12px"
          v-for="device in computedDevices.filter((dev) => !dev.favorite)"
          :key="device.id"
          @click="scrollToDevice(device.id)"
          :data-target="'device-setting-' + device.id"
          >{{ device.name }}
        </q-btn>
      </div>
    </aside>

    <!--Scrollable container for devices-->
    <div class="scrollable-content">
      <div
        class="device-setting"
        v-for="device in computedDevices"
        :key="device.id"
        :id="'device-setting-' + device.id"
      >
        <div class="heading">
          <span>{{ device.name }}</span>
          <q-space />
          <q-btn
            class="favorite-button"
            flat
            icon="favorite"
            no-caps
            :class="{ 'active-favorite': device.favorite }"
            @click="changeFavorite(device)"
            ><span class="cont">Favorit</span></q-btn
          >
        </div>

        <div v-if="device.isLegacy">
          <span class="text-orange"
            >Legacy-Gerät: Dieses Gerät verwendet die veraltete App. Aktualisiere Zeitnah.</span
          >
        </div>

        <q-separator dark style="margin-bottom: -10px" />

        <div class="battery-info">
          <h2>
            {{ Math.round(device.battery * 100) }}%
            <span>
              {{
                device.predictedZeroAt
                  ? ' - ' +
                    (() => {
                      const d = device.predictedZeroAt

                      const t = new Date(d) - new Date()
                      if (t < 0) {
                        if (device.battery > 0) {
                          return 'Akku ist inzwischen wahrscheinlich leer.'
                        } else {
                          return 'Akku ist leer.'
                        }
                      }

                      const D = Math.floor(t / 86400000)
                      const H = Math.floor((t % 86400000) / 3600000)
                      const M = Math.floor((t % 3600000) / 60000)

                      return [
                        D ? `${D} d` : '',
                        H ? `${H} h` : '',
                        D < 1 ? `${M} m` : '',
                        ' verbleiben',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    })()
                  : device.chargingStatus
                    ? ' - lädt'
                    : device.isPluggedIn
                      ? ' - angeschlossen'
                      : device.battery === 0
                        ? ' - Akku ist leer.'
                        : ' - Analyse erfolgt...'
              }}
            </span>
          </h2>
          <div
            class="progress-bar"
            :style="
              '--battery-level:' + device.battery * 100 + '%;--device-color:' + device.color + ';'
            "
          >
            <span
              class="progress-thumb"
              :class="{ charging: device.chargingStatus }"
              :style="'width:' + device.battery * 100 + '%;'"
            ></span>
            <span
              class="battery-protected-indicator"
              v-if="device.isPluggedIn && !device.chargingStatus"
              >]</span
            >
          </div>
        </div>

        <div class="get-notification">
          <span>Erinnerung erhalten, wenn das Gerät in 2 Stunden leer ist?</span>
          <q-space />
          <q-btn-group rounded flat class="reminder-buttons">
            <q-btn
              label="Aus"
              no-caps
              class="off"
              :class="{ active: !device.hasOrderedNotification && !device.permanentNotification }"
              :disable="disableNotificationSelect"
              @click="turnOffNotification(device.id)"
            />
            <q-separator vertical />
            <q-btn
              label="Ein Mal"
              no-caps
              class="once"
              :class="{ active: device.hasOrderedNotification && !device.permanentNotification }"
              @click="turnOnNotificationOnce(device.id)"
              :disable="device.chargingStatus || device.isPluggedIn || disableNotificationSelect"
            />
            <q-separator vertical />
            <q-btn
              label="Immer"
              no-caps
              class="permanent"
              :class="{ active: device.hasOrderedNotification && device.permanentNotification }"
              :disable="device.chargingStatus || device.isPluggedIn || disableNotificationSelect"
              @click="turnOnNotificationForever(device.id)"
            />
          </q-btn-group>
        </div>

        <div class="day-graph">
          <span>Heutiger Verbrauch</span>
          <canvas :id="'day-graph-device-' + device.id" style="height: 100%; width: 100%"></canvas>
        </div>

        <div class="week-graph">
          <span>Verbrauch der letzten 7 Tage</span>
          <canvas :id="'week-graph-device-' + device.id" style="height: 100%; width: 100%"></canvas>
        </div>

        <div class="get-notification">
          <span>Widget-Sichtbarkeit</span>
          <q-space />
          <q-btn-group rounded flat class="reminder-buttons">
            <q-btn
              label="Aus"
              no-caps
              class="off"
              :class="{ active: !device.isShown }"
              @click="hideDevice(device.id)"
            />
            <q-separator vertical />
            <q-btn
              label="An"
              no-caps
              class="once"
              :class="{ active: device.isShown }"
              @click="showDevice(device.id)"
            />
          </q-btn-group>
        </div>

        <div class="footer">
          <q-space />
          <q-btn
            label="Gerät Umbennen"
            flat
            class="rename"
            no-caps
            @click="
              () => {
                renameDeviceWindow.show = true
                renameDeviceWindow.data = device
              }
            "
          />
          <q-btn
            label="Gerät löschen"
            flat
            class="delete"
            no-caps
            @click="
              () => {
                deleteDeviceWindow.show = true
                deleteDeviceWindow.data = device
              }
            "
          />
        </div>
      </div>

      <div class="no-devices" v-if="computedDevices.length < 1">
        Du hast keine Geräte registriert.
      </div>
    </div>

    <q-dialog
      v-model="deleteDeviceWindow.show"
      backdrop-filter="blur(10px)"
      @before-hide="deleteDeviceWindow.data = null"
    >
      <div
        class="recommendation-popup"
        :style="'--gradient-start: ' + '#ff000044' + ';--gradient-end:' + '#ff00008a'"
      >
        <div class="title">
          <h1>{{ deleteDeviceWindow.data.name }} löschen</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span>
            Dein Gerät wird hierdurch permanent gelöscht. Deine zugehörigen Nutzungsdaten sind dann
            nicht mehr abrufbar und werden von unseren Servern gelöscht.
          </span>
          <q-btn
            label="Permanent löschen
            "
            flat
            class="confirm-button"
            @click="deleteDevice(deleteDeviceWindow.data.id)"
          />
        </div>
      </div>
    </q-dialog>

    <q-dialog
      v-model="renameDeviceWindow.show"
      backdrop-filter="blur(10px)"
      @before-hide="renameDeviceWindow.data = {}"
      @before-show="renameDeviceWindow.text = renameDeviceWindow.data?.name || ''"
    >
      <div
        class="recommendation-popup positive"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>{{ renameDeviceWindow.data.name }} umbennen</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span> Vergib einen neuen Namen für dein Gerät: </span>
          <q-input
            color="white"
            dark
            filled
            type="text"
            label="Neuer Name"
            v-model="renameDeviceWindow.text"
          />
          <q-btn
            label="Absenden
            "
            flat
            no-caps
            class="confirm-button"
            @click="renameDevice(renameDeviceWindow.data.id)"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { computed, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router'
Chart.register(...registerables)

const deviceStore = useDeviceStore()
const userStore = useUserStore()

const computedDevices = computed(() => deviceStore.devices)
const computedUser = computed(() => userStore.user)

const deleteDeviceWindow = ref({ show: false, data: null })
const renameDeviceWindow = ref({ show: false, data: {}, text: '' })

const router = useRouter()

const disableNotificationSelect = ref(false)

onMounted(async () => {
  if (!computedUser.value.email) {
    return
  }
  await deviceStore.loadDevices()
  await deviceStore.loadHistory()
  await deviceStore.loadWeekistory()

  const buttons = document.querySelectorAll('button[data-target]')

  const sections = [...buttons].map((btn) => document.getElementById(btn.dataset.target))

  // Create the observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id
        if (id.includes('device-setting-')) {
          const btn = document.querySelectorAll(`button[data-target="${id}"]`)
          if (entry.isIntersecting) {
            // Remove highlight from all
            buttons.forEach((b) => b.classList.remove('active'))
            // Highlight the matching button
            btn.forEach((b) => b.classList.add('active'))
          }
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '-20% 0px -60% 0px',
    },
  )

  // Observe all sections
  sections.forEach((sec) => observer.observe(sec))

  for (const device of computedDevices.value) {
    setupDayGraph(device.id, device)
    setupWeekGraph(device.id, device)
  }

  if (!isNaN(router.currentRoute.value.query.id)) {
    scrollToDevice(router.currentRoute.value.query.id)
  }

  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})

watch(
  computed(() => deviceStore.onLoadDevice),
  () => {
    disableNotificationSelect.value = false
  },
)

function scrollToDevice(id) {
  document.getElementById('device-setting-' + id).scrollIntoView({ behavior: 'smooth' })
}

async function setupDayGraph(id, device) {
  const rawData = deviceStore.deviceHistory[id]

  const ctx = document.getElementById('day-graph-device-' + id).getContext('2d')

  const up = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined)

  function createGradient(context, chartArea, color) {
    const temp = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    temp.addColorStop(1, color + '70')
    temp.addColorStop(0.1, color + '00')

    return temp
  }

  let width, height, gradient, lastBaseColor

  function getLevelGradient(context, chartArea, baseColor) {
    const chartWidth = chartArea.right - chartArea.left
    const chartHeight = chartArea.bottom - chartArea.top
    if (
      !gradient ||
      width !== chartWidth ||
      height !== chartHeight ||
      baseColor !== lastBaseColor
    ) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      lastBaseColor = baseColor
      width = chartWidth
      height = chartHeight
      gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      gradient.addColorStop(1, baseColor)
      gradient.addColorStop(0.3, baseColor)
      gradient.addColorStop(0.2, colorMixHex('#ffa600', baseColor, 0.5))
      gradient.addColorStop(0.1, colorMixHex('#ff0000', baseColor, 0.3))
    }

    return gradient
  }

  function generateGraphDataset(deviceName, data, color, deviceId) {
    return {
      label: deviceName,
      data: data,
      cubicInterpolationMode: 'monotone',
      borderWidth: 5,
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
      segment: {
        borderDash: (ctx) => up(ctx, [1, 8], deviceId),
      },
      borderColor: (ctx) => {
        return (function (context) {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) {
            // This case happens on initial chart load
            return
          }
          return getLevelGradient(ctx, chartArea, color)
        })(ctx)
      },
      spanGaps: true,
      fill: true,
      backgroundColor: (ctx) => {
        return (function (context) {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) {
            // This case happens on initial chart load
            return
          }
          return createGradient(ctx, chartArea, color, deviceId)
        })(ctx)
      },
    }
  }

  async function createDatasets(device) {
    const dataset = []
    if (rawData) {
      dataset.push(generateGraphDataset(device.name, rawData, device.color, device.id))
    }

    //console.log('Processed data: ', dataset)
    return dataset
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: await createDatasets(device),
    },
    options: {
      locale: 'de-DE',
      responsive: true,
      maintainAspectRatio: false,
      color: '#ffffff',
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: { hour: 'HH:mm' },
          },
          min: Date.now() - 24 * 60 * 60 * 1000,
          max: Date.now(),
          title: { display: false, text: 'Zeit', color: '#fff' },
          ticks: {
            display: false,
            maxTicksLimit: 5,
            color: '#fff',
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: 0,
          max: 100,
          title: { display: false, text: 'Batteriestand (%)', color: '#fff' },
          ticks: {
            callback: (value) => (value % 50 === 0 ? value + '%' : ''),
            color: '#fff',
            display: true,
            font: {
              size: 14,
              weight: 1000,
            },
            padding: -60,
            z: 1,
          },
          border: { display: false, color: '#fff' },
          position: 'right',
          offset: true,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: customTooltip,
        },
      },
      layout: {
        padding: {
          right: -20,
        },
      },

      radius: 0,
    },
  })
}

async function setupWeekGraph(id, device) {
  const rawData = deviceStore.deviceWeekHistory[id]

  const ctx = document.getElementById('week-graph-device-' + id).getContext('2d')

  const up = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined)

  function createGradient(context, chartArea, color) {
    const temp = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    temp.addColorStop(1, color + '70')
    temp.addColorStop(0.1, color + '00')

    return temp
  }

  let width, height, gradient, lastBaseColor

  function getLevelGradient(context, chartArea, baseColor) {
    const chartWidth = chartArea.right - chartArea.left
    const chartHeight = chartArea.bottom - chartArea.top
    if (
      !gradient ||
      width !== chartWidth ||
      height !== chartHeight ||
      baseColor !== lastBaseColor
    ) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      lastBaseColor = baseColor
      width = chartWidth
      height = chartHeight
      gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      gradient.addColorStop(1, baseColor)
      gradient.addColorStop(0.3, baseColor)
      gradient.addColorStop(0.2, colorMixHex('#ffa600', baseColor, 0.5))
      gradient.addColorStop(0.1, colorMixHex('#ff0000', baseColor, 0.3))
    }

    return gradient
  }

  function generateGraphDataset(deviceName, data, color, deviceId) {
    return {
      label: deviceName,
      data: data,
      cubicInterpolationMode: 'monotone',
      borderWidth: 5,
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
      segment: {
        borderDash: (ctx) => up(ctx, [1, 8], deviceId),
      },
      borderColor: (ctx) => {
        return (function (context) {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) {
            // This case happens on initial chart load
            return
          }
          return getLevelGradient(ctx, chartArea, color)
        })(ctx)
      },
      spanGaps: true,
      fill: true,
      backgroundColor: (ctx) => {
        return (function (context) {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) {
            // This case happens on initial chart load
            return
          }
          return createGradient(ctx, chartArea, color, deviceId)
        })(ctx)
      },
    }
  }

  async function createDatasets(device) {
    const dataset = []
    if (rawData) {
      dataset.push(generateGraphDataset(device.name, rawData, device.color, device.id))
    }

    //console.log('Processed data: ', dataset)
    return dataset
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: await createDatasets(device),
    },
    options: {
      locale: 'de-DE',
      responsive: true,
      maintainAspectRatio: false,
      color: '#ffffff',
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: { hour: 'HH:mm' },
          },
          min: Date.now() - 7 * 24 * 60 * 60 * 1000,
          max: Date.now(),
          title: { display: false, text: 'Zeit', color: '#fff' },
          ticks: {
            display: false,
            maxTicksLimit: 0,
            color: '#fff',
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: 0,
          max: 100,
          title: { display: false, text: 'Batteriestand (%)', color: '#fff' },
          ticks: {
            color: '#fff',
            display: false,
            font: {
              size: 14,
              weight: 1000,
            },
            padding: -60,
            z: 1,
          },
          border: { display: false, color: '#fff' },
          position: 'right',
          offset: true,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: customTooltip,
        },
      },
      layout: {
        padding: {
          right: -20,
        },
      },

      radius: 0,
    },
  })
}
function customTooltip(context) {
  const { chart, tooltip } = context

  // Create tooltip element if missing
  let tooltipEl = document.getElementById('chartjs-custom-tooltip')
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'chartjs-custom-tooltip'
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.background = 'rgba(0,0,0,0.8)'
    tooltipEl.style.color = '#fff'
    tooltipEl.style.padding = '6px 8px'
    tooltipEl.style.borderRadius = '4px'
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.transition = '0.2s ease'
    tooltipEl.style.whiteSpace = 'nowrap'
    document.body.appendChild(tooltipEl)
  }

  // Hide if no tooltip
  if (!tooltip || tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0
    return
  }

  // Get the closest datapoint
  const dp = tooltip.dataPoints[0]

  // Tooltip content
  const label = dp.parsed.x || ''
  const value = dp.formattedValue || dp.raw

  tooltipEl.innerHTML = `
    <div><strong>${new Date(label).toLocaleTimeString('de-DE', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })}</strong></div>
    <div>${value + '%'}</div>
  `

  // Positioning
  const canvasRect = chart.canvas.getBoundingClientRect()
  tooltipEl.style.opacity = 1
  tooltipEl.style.left = canvasRect.left + window.pageXOffset + tooltip.caretX + 10 + 'px'
  tooltipEl.style.top = canvasRect.top + window.pageYOffset + tooltip.caretY + 10 + 'px'
}

function colorMixHex(hex1, hex2, percent2) {
  function convertHexToRGBA(hex) {
    //console.log('input hex: ', hex)
    hex = hex.split('#')[1].toLowerCase() // hex -> ab432100

    const splitted = {
      r: hex.substring(0, 2),
      g: hex.substring(2, 4),
      b: hex.substring(4, 6),
      a: hex.length === 8 ? hex.substring(6, 8) : 'ff',
    }

    // Convert every hex value to decimal
    function convertHexToDecimal(hex) {
      let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
      const hexDigits = hex.split('')

      let decDigits = []
      for (let i in hexDigits) {
        decDigits.unshift(values.indexOf(hexDigits[i]))
      }

      let newValue = 0
      for (let i in decDigits) {
        newValue += Math.pow(16, i) * decDigits[i]
      }
      return newValue
    }

    const converted = {
      r: convertHexToDecimal(splitted.r),
      g: convertHexToDecimal(splitted.g),
      b: convertHexToDecimal(splitted.b),
      a: convertHexToDecimal(splitted.a),
    }
    //console.log('Converted: ', converted)
    return converted
  }

  function convertRGBAToHex({ r = 0, g = 0, b = 0, a = 255 }) {
    /**@param {Number} decimal  */
    //console.log('Converting ', { r: r, g: g, b: b, a: a }, ' to HEX')

    function convertHex(decimal) {
      let hexNumber = []

      //console.log('Converting part', decimal)
      do {
        const digits = [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          '0',
        ]
        const digit = digits[decimal % 16]
        hexNumber.unshift(digit)
        decimal = Math.floor(decimal / 16)
      } while (decimal / 16 > 0)

      hexNumber = hexNumber.reduce((prev, curr) => prev + curr, '')
      if (hexNumber.length % 2 !== 0) hexNumber = '0' + hexNumber
      //console.log('Hexnumber: ', hexNumber)
      return hexNumber
    }

    return convertHex(r) + convertHex(g) + convertHex(b) + convertHex(a)
  }

  function scaleRGBValues({ r, g, b, a }, scalar) {
    //console.log('Scaling ', { r, g, b, a }, 'by ', scalar)
    r *= scalar
    g *= scalar
    b *= scalar
    a *= scalar

    //console.log('To: ', { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b), a: Math.floor(a) })
    return { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b), a: Math.floor(a) }
  }

  function addRGBA(rgb1, rgb2) {
    /*
    console.log('Adding ', rgb1, ' and ', rgb2, 'to', {
      r: rgb1.r + rgb2.r,
      g: rgb1.g + rgb2.g,
      b: rgb1.b + rgb2.b,
      a: rgb1.a + rgb2.a,
    })
      */
    return {
      r: rgb1.r + rgb2.r,
      g: rgb1.g + rgb2.g,
      b: rgb1.b + rgb2.b,
      a: rgb1.a + rgb2.a,
    }
  }

  const rgb1 = convertHexToRGBA(hex1)
  const rgb2 = convertHexToRGBA(hex2)

  //console.log(rgb1, rgb2)

  const mixedColorRGB = addRGBA(scaleRGBValues(rgb1, 1 - percent2), scaleRGBValues(rgb2, percent2))

  const mixedColorHex = convertRGBAToHex(mixedColorRGB)

  return '#' + mixedColorHex
}

async function turnOffNotification(id) {
  const result = await api.post('/notification/off', { deviceId: id })

  if (result.status === 200) {
    disableNotificationSelect.value = true
  }
}

async function turnOnNotificationOnce(id) {
  const result = await api.post('/notification/new', { deviceId: id })

  if (result.status === 200) {
    disableNotificationSelect.value = true
  }
}

async function turnOnNotificationForever(id) {
  await turnOffNotification(id)
  const result = await api.post('/notification/new', { deviceId: id, permanent: true })

  if (result.status === 200) {
    disableNotificationSelect.value = true
  }
}

async function changeFavorite(device) {
  const set = !device.favorite
  const result = await api.post('/device/favorite', { deviceId: device.id, set: set })

  if (result.status === 200) {
    device.favorite = set
  }
}

async function deleteDevice(id) {
  const result = await api.delete('/device?deviceId=' + id)

  if (result.status === 200) {
    deleteDeviceWindow.value.show = false
  }
}

async function showDevice(id) {
  await deviceStore.setIsShown(id, true)
}
async function hideDevice(id) {
  await deviceStore.setIsShown(id, false)
}
async function renameDevice(id) {
  const name = renameDeviceWindow.value.text
  if (name.length < 1) {
    //
  } else {
    const result = await deviceStore.rename(id, renameDeviceWindow.value.text)
    if (result === true) {
      renameDeviceWindow.value.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
.main {
  padding: var(--std-pad);
  color: white;
  display: flex;
  gap: var(--std-pad);
  position: relative;
  overflow: visible;
}

.device-list {
  width: 350px;
  display: flex;
  align-items: start;
  justify-content: start;
  flex-direction: column;
  gap: var(--std-pad);
  position: sticky;
  top: calc(50px + var(--std-pad));
  height: fit-content;

  .favorites,
  .list {
    width: 100%;
    background-color: #ffffff10;
    padding: 12px;
    border-radius: var(--std-pad);
    display: flex;
    flex-direction: column;
    box-shadow:
      0 2px 10px #00000055,
      0 2px 2px #ffffff11 inset;

    h2 {
      margin: 0;
      line-height: 1em;
      font-size: 24px;
      margin: 12px;
      font-weight: 500;
    }

    button {
      border-radius: 12px;

      &.active {
        background-color: #ffffff10;
      }
    }
  }
}

.scrollable-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--std-pad);

  .no-devices {
    width: 100%;
    text-align: center;
    color: #ffffff70;
  }
}

::-webkit-scrollbar-track {
  background-color: #00000000;
}

.device-setting {
  width: 100%;
  background-color: #ffffff10;
  border-radius: var(--std-pad);
  padding: var(--std-pad);
  display: flex;
  flex-direction: column;
  gap: var(--std-pad);
  box-shadow:
    0 2px 10px #00000055,
    0 2px 2px #ffffff11 inset;

  .heading {
    width: 100%;
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 24px;

    .favorite-button {
      background-color: #ffffff10;
      border-radius: 8px;

      &.active-favorite {
        background-color: #7eafab43;
        color: #28b0a5;
      }
    }
  }

  .battery-info {
    h2 {
      margin: 0;
      font-size: 24px;
      line-height: 2em;
      font-weight: 400;
    }
  }

  .get-notification {
    display: flex;
    align-items: center;

    > span {
      font-size: 18px;
    }

    .off {
      background-color: #ffffff10;
    }
    .once {
      background-color: #ffffff10;
    }
    .permanent {
      background-color: #ffffff10;
    }
    .active {
      background-color: #ffffff20;
    }
  }

  .day-graph {
    position: relative;
    height: 200px;

    span {
      position: absolute;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .week-graph {
    position: relative;
    height: 100px;

    span {
      position: absolute;
      top: -10px;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .footer {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 12px;

    .delete {
      background-color: #ff000019;
      color: #e30000;
      border-radius: 6px;
    }

    .rename {
      background-color: #ffffff10;
      color: #eee;
      border-radius: 6px;
    }
  }

  &:last-child {
    min-height: calc(100vh - 50px - 48px);
  }
}

.progress-bar {
  background-color: #ffffff22;
  //width: 100%;
  height: 16px;
  border-radius: 8px;
  position: relative;
  //overflow: hidden;
  --battery-level: 0%;

  @keyframes charging-bar {
    0% {
      background-position-x: -100%;
    }
    100% {
      background-position-x: 200%;
    }
  }

  .progress-thumb {
    display: block;
    height: 16px;
    background-color: var(--device-color); //rgba(40, 176, 165, 1);
    background-size: 40%;
    background-repeat: no-repeat;
    border-radius: inherit;
    transition: width 1s;

    width: var(--battery-level);

    &.charging {
      background-image: linear-gradient(90deg, #00000000 0%, #ffffff50 50%, #00000000 100%);
      animation: charging-bar 2s forwards infinite;
    }
  }
  .battery-protected-indicator {
    display: block;
    font-size: 20px;
    position: absolute;
    left: var(--battery-level);
    top: 8px;
    color: var(--device-color);
    line-height: 0;
    font-weight: 1000;
  }
}

.recommendation-popup {
  min-width: min(400px, 100vw);
  background-color: var(--main-bg-color);
  color: #fff;
  --gradient-start: #000000;
  --gradient-end: #ffffff;

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

    label {
      width: 100%;
    }

    .confirm-button {
      margin-top: 12px;
      font-size: 18px;
      background-color: #d50e006e;
      color: red;
      min-width: 250px;
    }
  }
  &.positive .confirm-button {
    color: white;
    background-color: #fff1;
  }

  &.news {
    min-width: min(800px, 100vw);
  }
}

@media only screen and (max-width: 700px) {
  .device-list {
    display: none;
  }

  .favorite-button .cont {
    display: none;
  }
}

@media only screen and (max-width: 400px) {
  .reminder-buttons {
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;

    button {
      border-radius: 0;
    }
  }
}
</style>
