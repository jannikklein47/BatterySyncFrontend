<template>
  <q-page class="main">
    <div>
      <q-input label="Custom timeframe" type="text" v-model="timeframe" />
      <q-input label="Interval" type="text" v-model="interval" />
      <q-input label="Admin Key" type="password" v-model="key" />
      <q-btn @click="updateGraph" label="Request" />
      <div><canvas id="display-metrics"></canvas></div>
      <div><canvas id="display-routes"></canvas></div>
      <div><canvas id="display-userIdUsage"></canvas></div>
    </div>
  </q-page>
</template>

<script setup>
import { useAdminStore } from 'src/stores/admin-store'
import { computed, onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useQuasar } from 'quasar'

Chart.register(...registerables)

const $q = useQuasar()

const adminStore = useAdminStore()
const data = computed(() => adminStore.data)

const timeframe = ref('1 day')
const interval = ref('30 minutes')
const key = ref('')

const charts = []

async function updateGraph() {
  const result = await adminStore.loadData(timeframe.value, interval.value, key.value)

  if (!result) {
    $q.notify({ message: 'Access denied', type: 'negative' })
  } else {
    for (const c of charts) {
      c.destroy()
    }

    generateGraphs()
  }
}

function generateGraphs() {
  const metrics = data.value

  const chartData = {} // { datasetName: { "10:00": 5, "10:30": 7, ... } }
  let allLabels = []

  //
  // 1. Build a lookup map per dataset instead of arrays
  //
  Object.keys(metrics).forEach((key) => {
    const newData = metrics[key]

    // Case 1: metrics grouped by method (GET / POST / PUT)
    if (newData[0] && newData[0].method) {
      newData.forEach((entry) => {
        const time = new Date(entry.interval_start).toISOString()

        const datasetName = `${key}-${entry.method}`

        if (!chartData[datasetName]) {
          chartData[datasetName] = {}
        }

        chartData[datasetName][time] = entry.count

        allLabels.push(time)
      })

      // Case 2: simple metric (one series per metric)
    } else {
      newData.forEach((entry) => {
        const time = new Date(entry.interval_start).toISOString()

        if (!chartData[key]) {
          chartData[key] = {}
        }

        chartData[key][time] = entry.count

        allLabels.push(time)
      })
    }
  })

  //
  // 2. Deduplicate + sort all labels
  //
  allLabels = Array.from(new Set(allLabels)).sort((a, b) => {
    return new Date(a) - new Date(b)
  })

  const displayLabels = allLabels.map((ts) => {
    const d = new Date(ts)

    // Option A: Always show date + time
    return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' })

    // Option B: If multiple days → show day
    // Option C: If <24h → show time only
  })

  //
  // 3. Convert each dataset map to aligned array of values
  //
  Object.keys(chartData).forEach((datasetName) => {
    const datasetMap = chartData[datasetName]

    // convert map → array aligned with allLabels
    chartData[datasetName] = allLabels.map((label) => {
      return datasetMap[label] ?? null // insert null if no value for that interval
    })
  })

  function createDatasets(type) {
    const datasets = []
    Object.keys(chartData).forEach((key) => {
      if (key.includes('/') && type === 'routes') {
        datasets.push({
          label: key,
          data: chartData[key],
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y3',
        })
      }

      if (!key.includes('/') && type === 'requests') {
        if (key === 'responseSizes' || key === 'requestSizes') {
          datasets.push({
            label: key,
            data: chartData[key],
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'y1',
          })
        }
      }
      if (key.includes('total_userId-') && type === 'users') {
        datasets.push({
          label: key,
          data: chartData[key],
          borderWidth: 2,
          tension: 0.3,
          yAxisID: 'y4',
        })
      }
    })
    return datasets
  }

  const chartCanvas = document.getElementById('display-metrics').getContext('2d')
  const routeCanvas = document.getElementById('display-routes').getContext('2d')
  const userIdCanvas = document.getElementById('display-userIdUsage').getContext('2d')

  const stdChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: displayLabels,
      datasets: createDatasets('requests'),
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Requests' },
        },
        y1: {
          type: 'logarithmic',
          position: 'right',
          title: { display: true, text: 'Response Size' },
          grid: { drawOnChartArea: false }, // prevents overlapping grid lines
        },
      },
    },
  })

  const routeChart = new Chart(routeCanvas, {
    type: 'line',
    data: {
      labels: displayLabels,
      datasets: createDatasets('routes'),
    },
    options: {
      responsive: true,
      scales: {
        y3: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Requests' },
        },
      },
    },
  })

  const userIdUsageChart = new Chart(userIdCanvas, {
    type: 'line',
    data: {
      labels: displayLabels,
      datasets: createDatasets('users'),
    },
    options: {
      responsive: true,
      scales: {
        y4: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'User Usage' },
        },
      },
    },
  })

  charts.push(stdChart, routeChart, userIdUsageChart)
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

<style lang="scss" scoped>
.main {
  padding: var(--std-pad);
  display: flex;
  gap: var(--std-pad);
  background-color: white;

  > div {
    > div {
      height: 400px;
      width: min(1200px, calc(100vw));
    }
  }
}
</style>
