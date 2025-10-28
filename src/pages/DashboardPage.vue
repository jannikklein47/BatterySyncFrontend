<template>
  <q-page class="main">
    <div class="element main-element">
      <h1>Guten Tag, {{ computedUser.email || 'neuer Besucher!' }}</h1>
    </div>
    <div class="element overview">
      <h2>Übersicht</h2>

      <div class="contents">
        <div class="device-list">
          <div
            class="device-element-small"
            v-for="device in computedDevices.filter((device) => device.isShown)"
            :key="device.id"
          >
            <q-icon
              class="device-symbol normal"
              :name="device.type === 'laptop' ? 'laptop_mac' : 'smartphone'"
              size="lg"
            />
            <q-icon
              class="device-symbol settings"
              name="settings"
              size="lg"
              style="position: absolute"
            />
            <div class="contents">
              <span
                >{{ device.name }}
                <q-icon
                  size="xs"
                  name="electric_bolt"
                  v-if="device.chargingStatus"
                  class="charging-symbol"
                  color="blue"
                />
                <q-icon
                  v-if="device.isPluggedIn && !device.chargingStatus"
                  name="shield"
                  class="shield-symbol"
                  color="blue"
                />
              </span>
              <span class="percentage">{{ Math.floor(device.battery * 100) }} %</span>
              <div
                class="progress-bar"
                :style="
                  '--battery-level:' +
                  device.battery * 100 +
                  '%;--device-color:' +
                  device.color +
                  ';'
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
          </div>
        </div>
        <div class="recent-events">Keine Neuigkeiten</div>
      </div>
    </div>

    <div class="element graph">
      <div class="left">
        <h2>
          Akku-Insights
          <span>Akkuverbrauch der letzten 24 Stunden</span>
        </h2>
        <canvas id="chart-device-usage-dashboard-main" style="height: 100%; width: 100%"></canvas>
      </div>
      <div class="right">
        <div
          class="recommendation"
          v-for="r in recommendations"
          :key="r"
          @click="openRecommendationWindow(r)"
        >
          <div class="icon">
            <q-icon
              :name="
                r.type === 'battery_low'
                  ? 'battery_1_bar'
                  : r.type === 'battery_info'
                    ? 'circle'
                    : r.type === 'battery_empty'
                      ? 'battery_0_bar'
                      : r.type === 'battery_suggestion'
                        ? 'lightbulb'
                        : ''
              "
              :size="r.type === 'battery_info' ? '1em' : '3em'"
              :style="
                'color: ' +
                (r.type === 'battery_empty'
                  ? '#ff0000'
                  : r.type === 'battery_low'
                    ? '#fc5203'
                    : r.color)
              "
            />
          </div>

          <div class="content">
            <span class="title"> {{ r.title }} </span>
            <span class="caption"> {{ r.caption }} </span>
          </div>
        </div>
      </div>
    </div>

    <q-dialog
      v-model="recommendationModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="recommendationModel.success = null"
    >
      <div
        class="recommendation-popup"
        :style="
          '--gradient-start: ' +
          recommendationModel.data.gradientStart +
          ';--gradient-end:' +
          recommendationModel.data.gradientEnd
        "
      >
        <div class="title">
          <h1>{{ recommendationModel.data.title }}</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div
          class="content"
          v-if="
            recommendationModel.data.type === 'battery_suggestion' ||
            recommendationModel.data.type === 'battery_info'
          "
        >
          <span class="caption">
            {{ recommendationModel.data.caption }}
          </span>
          <span>
            <span class="text-bold">BatterySync</span> kann dich daran erinnern, dein Gerät zu
            laden. Dazu werden rechtzeitig Benachrichtigungen an all deine Geräte versendet.
          </span>
          <q-btn
            :label="
              recommendationModel.data.hasOrderedNotification
                ? 'Erinnerung wird gesendet'
                : recommendationModel.success === null
                  ? 'Erinnerung aktivieren'
                  : ''
            "
            flat
            no-caps
            class="confirm-button"
            @click="orderNotification(recommendationModel.data.id)"
            :disable="
              recommendationModel.success === true ||
              recommendationModel.data.hasOrderedNotification
            "
            :loading="recommendationModel.loading"
            :icon="
              recommendationModel.success === true
                ? 'check'
                : recommendationModel.success === false
                  ? 'close'
                  : undefined
            "
          />
        </div>
      </div>
    </q-dialog>

    <div class="blocker" v-if="!computedUser.email">
      Melde Dich an, <br />
      um auf das Dashboard zuzugreifen!
    </div>
  </q-page>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDeviceStore } from 'src/stores/device-store'
import downsampler from 'downsample-lttb'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/user-store'

Chart.register(...registerables)

const deviceStore = useDeviceStore()
const userStore = useUserStore()

const computedDevices = computed(() => deviceStore.devices)
const computedUser = computed(() => userStore.user)

const recommendations = ref([])
const batteryFlow = ref({ gained: 0, used: 0 })
const recommendationModel = ref({ show: false, data: {}, loading: false, success: null })

let recommendationGenerationInterval = null

onMounted(async () => {
  if (!computedUser.value.email) {
    return
  }
  await deviceStore.loadDevices()
  await deviceStore.loadHistory()

  await setupGraph()

  recommendations.value = generateRecommendations()

  recommendationGenerationInterval = setInterval(() => {
    recommendations.value = generateRecommendations()
    console.log('generate recs')
  }, 5000)

  let batteryGained = 0,
    batteryUsed = 0

  for (const device of computedDevices.value) {
    const history = deviceStore.deviceHistory[device.id]
    if (history) {
      const { used, gained } = summarizeBatteryFlow(history)
      batteryGained += gained
      batteryUsed += used
    }
  }

  batteryFlow.value.gained = batteryGained
  batteryFlow.value.used = batteryUsed
})

onUnmounted(() => {
  clearInterval(recommendationGenerationInterval)
})

function downsample(data) {
  const mapped = data.map((entry) => ({
    x: new Date(entry.createdAt).getTime(),
    y: entry.battery * 100,
    //charging: entry.chargingStatus,
  }))

  const standardized = mapped.map((entry) => [entry.x, entry.y])

  const reduced = downsampler.processData(
    standardized,
    Math.floor(Math.sqrt(standardized.length) + 100 / (standardized.length + 10) + 10),
    //20,
  )

  return reduced
}

async function setupGraph() {
  const rawData = deviceStore.deviceHistory

  const ctx = document.getElementById('chart-device-usage-dashboard-main').getContext('2d')

  const up = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined)

  function createGradient(context, chartArea, color) {
    const temp = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    temp.addColorStop(1, color + '20')
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

  async function createDatasets() {
    const dataset = []
    const devices = deviceStore.devices

    for (const device of devices.filter((val) => val.isShown === true)) {
      //console.log(device)
      if (rawData[device.id]) {
        dataset.push(
          generateGraphDataset(
            device.name,
            downsample(rawData[device.id]),
            device.color,
            device.id,
          ),
        )
      }
    }
    //console.log('Processed data: ', dataset)
    return dataset
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: await createDatasets(),
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
      plugins: {
        legend: { display: false },
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

/**
 * Generates a list of recommendations about device usage.
 */
function generateRecommendations() {
  function sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  // Battery is low; even include those that have an ordered notification (should not happen!)
  let lowBattery =
    computedDevices.value.filter(
      (device) =>
        ((device.predictedZeroAt &&
          device.predictedZeroAt < new Date(Date.now() + 2 * 60 * 60 * 1000)) ||
          (device.battery <= 0.15 && device.battery > 0)) &&
        device.isPluggedIn === false,
    ) || []

  const result = []

  // Analyse devices with low battery that are not charging
  for (const device of lowBattery) {
    if (device.predictedZeroAt) {
      result.push({
        type: 'battery_low',
        title: 'Dein ' + device.name + ' ist fast leer.',
        caption:
          'Nach dem aktuellen Verbrauchsmuster wird es um ' +
          device.predictedZeroAt.getHours().toString().padStart(2, '0') +
          ':' +
          device.predictedZeroAt.getMinutes().toString().padStart(2, '0') +
          ' Uhr leer sein.',
        id: device.id,
        gradientStart: '#fe8255',
        gradientEnd: '#ff5c69',
      })
    } else {
      result.push({
        type: 'battery_low',
        title: 'Dein ' + device.name + ' ist fast leer.',
        caption:
          'Dein Verbrauchsmuster konnte nicht analysiert werden. Schließe es baldmöglichst an.',
        id: device.id,
        gradientStart: '#fe8255',
        gradientEnd: '#ff5c69',
      })
    }
    /*
    let history24hours = deviceStore.deviceHistory[device.id] || []

    if (!history24hours || history24hours.length < 1) {
      result.push({
        type: 'battery_low',
        title: 'Dein ' + device.name + ' ist fast leer.',
        caption:
          'Wir konnten dein Verbrauchsmuster nicht analysieren. Schließe dein Gerät zeitnah an.',
        id: device.id,
      })
      continue
    }

    const lowBatteryAnalysis = analyzeSinceLastUnplug(history24hours)
    console.log(lowBatteryAnalysis)
    if (lowBatteryAnalysis.predictedZeroAt) {
      result.push({
        type: 'battery_low',
        title: 'Dein ' + device.name + ' ist fast leer.',
        caption:
          'Nach dem aktuellen Verbrauchsmuster wird es um ' +
          lowBatteryAnalysis.predictedZeroAt.getHours().toString().padStart(2, '0') +
          ':' +
          lowBatteryAnalysis.predictedZeroAt.getMinutes().toString().padStart(2, '0') +
          ' Uhr leer sein.',
        id: device.id,
      })
    } else {
      result.push({
        type: 'battery_low',
        title: 'Dein ' + device.name + ' ist fast leer.',
        caption:
          'Dein Verbrauchsmuster konnte nicht analysiert werden. Schließe es baldmöglichst an.',
        id: device.id,
        gradientStart: '#fe8255',
        gradientEnd: '#ff5c69',
      })
    }
      */
  }

  // Devices that are empty?
  for (const device of computedDevices.value.filter(
    (device) =>
      device.battery === 0 &&
      device.predictedZeroAt &&
      device.predictedZeroAt >= new Date(Date.now() + 2 * 60 * 60 * 1000),
  )) {
    result.push({
      type: 'battery_empty',
      title: 'Dein ' + device.name + ' muss geladen werden.',
      caption: 'Der Akku ist leer.',
      id: device.id,
      gradientStart: '#dd0000',
      gradientEnd: '#ad0e48',
    })
  }

  // When can you expect to charge?
  for (const device of computedDevices.value.filter(
    (device) =>
      device.battery > 0.15 &&
      device.isPluggedIn === false &&
      ((device.predictedZeroAt &&
        device.predictedZeroAt > new Date(Date.now() + 2 * 60 * 60 * 1000)) ||
        device.predictedZeroAt === null),
  )) {
    if (device.predictedZeroAt) {
      device.predictedZeroAt = new Date(device.predictedZeroAt)
      if (sameDay(device.predictedZeroAt, new Date(Date.now()))) {
        if (!device.hasOrderedNotification) {
          result.push({
            type: 'battery_suggestion',
            title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
            caption:
              'Nach dem aktuellen Verbrauchsmuster wird es um ' +
              device.predictedZeroAt.getHours().toString().padStart(2, '0') +
              ':' +
              device.predictedZeroAt.getMinutes().toString().padStart(2, '0') +
              ' Uhr leer sein.',
            id: device.id,
            color: device.color,
            gradientStart: '#fe5f55',
            gradientEnd: '#7cde89',
            hasOrderedNotification: false,
          })
        } else {
          result.push({
            type: 'battery_info',
            title: 'Status von ' + device.name,
            caption:
              'Nach dem aktuellen Verbrauchsmuster wird es um ' +
              device.predictedZeroAt.getHours().toString().padStart(2, '0') +
              ':' +
              device.predictedZeroAt.getMinutes().toString().padStart(2, '0') +
              ' Uhr leer sein.',
            id: device.id,
            color: device.color,
            gradientStart: '#fe5f55',
            gradientEnd: '#7cde89',
            hasOrderedNotification: true,
          })
        }
      } else if (device.predictedZeroAt.getTime() - 7 * 24 * 60 * 60 * 1000 > Date.now()) {
        if (!device.hasOrderedNotification) {
          result.push({
            type: 'battery_suggestion',
            title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
            caption: 'Nach dem aktuellen Verbrauchsmuster musst du es erst nächste Woche laden.',
            id: device.id,
            color: device.color,
            gradientStart: '#3e73b8',
            gradientEnd: '#7cde89',
            hasOrderedNotification: false,
          })
        } else {
          result.push({
            type: 'battery_info',
            title: 'Status von ' + device.name,
            caption: 'Nach dem aktuellen Verbrauchsmuster musst du es erst nächste Woche laden.',
            id: device.id,
            color: device.color,
            gradientStart: '#3e73b8',
            gradientEnd: '#7cde89',
            hasOrderedNotification: true,
          })
        }
      } else if (device.predictedZeroAt.getTime() - 7 * 24 * 60 * 60 * 1000 <= Date.now()) {
        if (!device.hasOrderedNotification) {
          result.push({
            type: 'battery_suggestion',
            title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
            caption:
              'Nach dem aktuellen Verbrauchsmuster reicht der Akku noch bis ' +
              device.predictedZeroAt.toLocaleDateString('de-DE', {
                weekday: 'long',
              }) +
              '.',
            id: device.id,
            color: device.color,
            gradientStart: '#fe9355',
            gradientEnd: '#7cde89',
            hasOrderedNotification: false,
          })
        } else {
          result.push({
            type: 'battery_info',
            title: 'Status von ' + device.name,
            caption:
              'Nach dem aktuellen Verbrauchsmuster reicht der Akku noch bis ' +
              device.predictedZeroAt.toLocaleDateString('de-DE', {
                weekday: 'long',
              }) +
              '.',
            id: device.id,
            color: device.color,
            gradientStart: '#fe9355',
            gradientEnd: '#7cde89',
            hasOrderedNotification: true,
          })
        }
      }
    } else if (device.hasOrderedNotification === false) {
      result.push({
        type: 'battery_suggestion',
        title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
        caption:
          'Wir konnten dein Verbauchsmuster noch nicht analysieren. Du kannst aber jetzt schon eine Erinnerung einstellen!',
        id: device.id,
        color: device.color,
        gradientStart: '#fe9355',
        gradientEnd: '#7cde89',
        hasOrderedNotification: false,
      })
    }

    /*
    const analysis = analyzeSinceLastUnplug(deviceStore.deviceHistory[device.id])
    if (analysis && analysis.predictedZeroAt) {
      if (sameDay(analysis.predictedZeroAt, new Date(Date.now()))) {
        result.push({
          type: 'battery_info',
          title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
          caption:
            'Nach dem aktuellen Verbrauchsmuster wird es um ' +
            analysis.predictedZeroAt.getHours().toString().padStart(2, '0') +
            ':' +
            analysis.predictedZeroAt.getMinutes().toString().padStart(2, '0') +
            ' Uhr leer sein.',
          id: device.id,
          color: device.color,
          gradientStart: '#fe5f55',
          gradientEnd: '#7cde89',
        })
      } else if (analysis.predictedZeroAt.getTime() - 7 * 24 * 60 * 60 * 1000 > Date.now()) {
        result.push({
          type: 'battery_info',
          title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
          caption: 'Nach dem aktuellen Verbrauchsmuster musst du es erst nächste Woche laden.',
          id: device.id,
          color: device.color,
          gradientStart: '#3e73b8',
          gradientEnd: '#7cde89',
        })
      } else if (analysis.predictedZeroAt.getTime() - 7 * 24 * 60 * 60 * 1000 <= Date.now()) {
        result.push({
          type: 'battery_info',
          title: 'Erhalte eine Erinnerung, wenn dein ' + device.name + ' aufgeladen werden muss.',
          caption:
            'Nach dem aktuellen Verbrauchsmuster reicht der Akku noch bis ' +
            analysis.predictedZeroAt.toLocaleDateString('de-DE', {
              weekday: 'long',
            }) +
            '.',
          id: device.id,
          color: device.color,
          gradientStart: '#fe9355',
          gradientEnd: '#7cde89',
        })
      }
    }
      */
  }

  return result
}
/*
function analyzeSinceLastUnplug(log) {
  if (!log || !log.length || log[0].isPluggedIn) return null

  const now = new Date(log[1].createdAt).getTime()
  let startEntry = null

  // newest entry at index 0
  for (let i = 1; i < log.length - 1; i++) {
    const newer = log[i]
    const older = log[i + 1]

    // detect unplug (charging ended)
    if (older.isPluggedIn === true && newer.isPluggedIn === false) {
      startEntry = newer
      console.log(i)
      break
    }
  }

  // fallback: if never unplugged in log, use newest entry
  if (!startEntry) {
    startEntry = log[log.length - 1]
  }

  const startTime = new Date(startEntry.createdAt).getTime()
  const elapsedMs = now - startTime
  if (elapsedMs <= 0) return null

  const latest = log[0] // newest entry
  const latestBattery = Math.floor(latest.battery * 100)
  const startBattery = Math.floor(startEntry.battery * 100)
  const deltaBattery = latestBattery - startBattery
  const ratePerMs = deltaBattery / elapsedMs

  let predictedZeroAt = null
  if (ratePerMs < 0) {
    const timeToZeroMs = latestBattery / Math.abs(ratePerMs)
    predictedZeroAt = new Date(now + timeToZeroMs)
  }

  return {
    startEntry,
    elapsedMinutes: elapsedMs / 60000,
    avgRatePerHour: ratePerMs * 3600000, // % per hour
    predictedZeroAt,
  }
}
  */
function summarizeBatteryFlow(log) {
  if (log.length < 2) return { used: 0, gained: 0 }

  let used = 0
  let gained = 0

  // log is newest → oldest
  for (let i = 0; i < log.length - 1; i++) {
    const curr = log[i]
    const next = log[i + 1] // older entry

    const delta = curr.battery - next.battery

    // charging → gain if battery increased
    if (delta > 0) gained += delta
    // discharging → usage if battery decreased
    if (delta < 0) used += -delta
  }

  return { used, gained }
}

function openRecommendationWindow(recommendation) {
  recommendationModel.value.show = true
  recommendationModel.value.data = recommendation
}

async function orderNotification(deviceId) {
  recommendationModel.value.loading = true
  const result = await api.post(
    '/notification/new',
    { deviceId: deviceId },
    {
      headers: { Authorization: '$2b$11$ZBvdt5hZkN6HS9x9VYvvkexTc3qxbn2dFHiBQxGq1Zq6quBLF.LNO' },
    },
  )
  recommendationModel.value.loading = false
  if (result.status === 200) {
    recommendationModel.value.success = true
    deviceStore.setLocalHasOrderedNotification(deviceId)
    recommendations.value = generateRecommendations()
  } else {
    recommendationModel.value.success = false
  }
}
</script>

<style lang="scss" scoped>
:root {
  --std-pad: 24px;
}

.main {
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: column;
  gap: 24px;
  font-weight: 400;
  font-size: 15px;
  padding: var(--std-pad);

  > div {
    width: 100%;
  }

  .element {
    box-shadow:
      0 2px 10px #00000055,
      0 2px 2px #ffffff11 inset;
    //background: #ffffff05;
    border-radius: var(--std-pad);
    padding: var(--std-pad);
  }
}

.main-element {
  background: #3e73b8;
  background: linear-gradient(220deg, #3e73b8 0%, rgba(40, 176, 165, 1) 53%, #7cde89 100%);
  grid-column: span 2;
  //min-height: 300px;

  h1 {
    font-weight: 500;
    font-size: 48px;
    line-height: 1em;
    margin: 0;
  }
  > span {
    position: relative;
    left: 3px;
    font-size: 20px;
  }
}
.side-content {
  grid-column: span 2;
  grid-row: span 2;
}
.overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    line-height: 1em;
  }

  > .contents {
    display: flex;
    flex-direction: row;
    gap: var(--std-pad);
  }

  .device-list {
    background-color: #ffffff05;
    border-radius: 12px;
    width: 50%;
    padding: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-shadow: 0 0 24px #00000030;
    min-height: 100px;
  }
  .recent-events {
    background-color: #ffffff10;
    border-radius: 12px;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff30;
    min-height: 100px;
    font-size: 20px;
  }
  .device-element-small {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    gap: 12px;
    position: relative;
    cursor: pointer;

    .device-symbol {
      position: relative;
      top: 3px;
      transition: opacity 0.2s;

      &.settings {
        opacity: 0;
      }
    }

    .contents {
      width: 100%;

      .percentage {
        position: absolute;
        top: 6px;
        right: 0;
      }
    }

    .shield-symbol {
      font-size: 17px;
      position: relative;
      bottom: 2px;
    }

    .charging-symbol {
      position: relative;
      bottom: 1px;

      @keyframes charging-pulse {
        0% {
          scale: 0;
          opacity: 0.3;
        }
        50% {
          scale: 4;
          opacity: 0;
        }
        100% {
          scale: 4;
          opacity: 0;
        }
      }

      &::after {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #3e73b8;
        position: absolute;
        animation: charging-pulse 2s infinite forwards;
      }
    }

    &:hover {
      .normal {
        opacity: 0;
      }
      .settings {
        opacity: 1;
      }
    }
  }

  .progress-bar {
    background-color: #00000022;
    //width: 100%;
    height: 8px;
    border-radius: 4px;
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
      height: 8px;
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
      font-size: 15px;
      position: absolute;
      left: var(--battery-level);
      top: 4px;
      color: var(--device-color);
      line-height: 0;
      font-weight: 1000;
    }
  }
}
.graph {
  color: white;
  display: flex;
  flex-direction: row;

  h2,
  h2 > span {
    margin: 0;
    line-height: 1em;
    font-weight: 500;
  }
  h2 {
    font-size: 24px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    padding-right: 12px;
    align-items: end;
  }
  h2 > span {
    font-size: 18px;
    color: #ffffffd0;
  }

  .left {
    width: 60%;
    margin-bottom: var(--std-pad);
    height: 350px;
    position: relative;
    //margin-right: -24px;

    &::after {
      content: '';
      position: absolute;
      width: 15px;
      height: 100%;
      background-color: var(--main-bg-color);
      background: linear-gradient(90deg, #30394a00 0%, var(--main-bg-color) 85%);
      bottom: -40px;
      right: 0px;
      z-index: 0;
    }
  }
  .right {
    width: 40%;
    border-radius: 12px;
    background-color: #ffffff10;
    color: #ffffff;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 12px;
    //overflow: auto;
    //max-height: 400px;
  }
  .recommendation {
    background-color: var(--main-bg-color);
    padding: 6px;
    padding-left: 0;
    border-radius: 6px;
    box-shadow: 0 0 12px #00000011;
    display: flex;
    width: 100%;
    cursor: pointer;

    &:hover {
      background-color: #1f2530;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 3em;
    }

    .content {
      display: flex;
      flex-direction: column;
    }

    .title {
      font-weight: 500;
      font-size: 16px;
    }
    .caption {
      color: #c0c0c0;
    }
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

    .confirm-button {
      margin-top: 12px;
      font-size: 18px;
      background-color: #fe5f55;
      min-width: 250px;
    }
  }
}

@media only screen and (max-width: 900px) {
  .graph {
    flex-direction: column;
    gap: 36px;

    .left h3 {
      margin-bottom: 6px;
    }

    .left,
    .right {
      width: 100%;
    }
  }
}
@media only screen and (max-width: 800px) {
  :root {
    --std-pad: 12px;
  }
  .main-element h1 {
    font-size: 36px;
  }
  .overview {
    gap: 12px;

    > h2 {
      margin-top: 3px;
    }
    > .contents {
      flex-direction: column;

      > div {
        width: 100%;
      }
    }
  }

  .recommendation-popup {
    height: 100vh;
  }
}

.blocker {
  position: fixed;
  top: 50px;
  left: 0;
  //pointer-events: all;
  width: 100%;
  height: 100vh;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 500;
  color: white;
  text-align: center;
  overflow: hidden;
}
</style>
