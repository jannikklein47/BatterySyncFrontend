<template>
  <q-page class="main">
    <div class="bg-2"></div>
    <h1>Guten Tag, {{ computedUser.email }}</h1>
    <h2 v-if="criticalDevices.length > 0">
      {{ criticalDevices.length }} Gerät{{
        criticalDevices.length === 1 ? ' benötigt' : 'e benötigen'
      }}
      deine Aufmerksamkeit.
    </h2>
    <h2 v-else>Alles ist ruhig.</h2>

    <div class="attention critical" v-if="criticalDevices.length > 0">
      <div class="header">
        Kritisch <q-space />
        <span>{{ criticalDevices.length }}</span>
      </div>
      <div class="element" v-for="device in criticalDevices" :key="device.id">
        <q-icon name="battery_0_bar" color="red" />
        <div>
          <h2>Dein {{ device.name }} muss geladen werden.</h2>
          <p>
            Akkustand: {{ Math.round(device.battery * 100) }}% -
            {{
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
                  'Akku hält noch',
                  D ? `${D} d` : '',
                  H ? `${H} h` : '',
                  D < 1 ? `${M} m` : '',
                  '.',
                ]
                  .filter(Boolean)
                  .join(' ')
              })()
            }}
          </p>
        </div>
        <q-space />
        <q-btn label="Okay" flat no-caps class="action" @click="setDeviceCritical(device)" />
      </div>
    </div>

    <div class="attention soon" v-if="warnedDevices.length > 0">
      <div class="header">
        Bald laden <q-space />
        <span>{{ warnedDevices.length }}</span>
      </div>
      <div class="element" v-for="device in warnedDevices" :key="device.id">
        <q-icon name="battery_1_bar" color="orange" />
        <div>
          <h2>Dein {{ device.name }} bald laden</h2>
          <p>
            {{
              (() => {
                const d = device.predictedZeroAt

                const t = new Date(d) - new Date()
                if (!d) {
                  return 'Analyse erfolgt...'
                } else if (t < 0) {
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
                  'Akku hält noch',
                  D ? `${D} d` : '',
                  H ? `${H} h` : '',
                  D < 1 ? `${M} m` : '',
                  '.',
                ]
                  .filter(Boolean)
                  .join(' ')
              })()
            }}
          </p>
          <p>{{ Math.round(device.battery * 100) }}% verbleibend</p>
        </div>
        <q-space />
        <q-btn
          label="Erinnerung erhalten"
          flat
          no-caps
          class="action"
          v-if="!device.hasOrderedNotification"
          @click="orderNotification(device.id)"
        />
      </div>
    </div>

    <div class="overview">
      <h2>Übersicht</h2>
      <div v-for="device in computedDevices" :key="device.id">
        <q-btn
          class="device"
          flat
          dense
          no-caps
          :to="'devices?id=' + device.id"
          :style="
            '--device-color: ' +
            (device.battery === 0 ? '#f77' : '#fffa') +
            '; --critical-color: ' +
            (device.battery === 0 ? '#f77' : '#fff')
          "
        >
          <div class="content">
            <q-icon
              :name="device.type === 'laptop' ? 'laptop_mac' : 'smartphone'"
              :style="device.battery === 0 ? 'color: #f00' : ''"
            />
            <div>
              <span class="text-information"
                >{{ device.name
                }}<span class="remaining" :style="device.battery === 0 ? 'color: #f77' : ''">{{
                  ' | ' +
                  (() => {
                    const d = device.predictedZeroAt

                    if (device.isPluggedIn && !device.chargingStatus) {
                      return 'angeschlossen.'
                    } else if (device.isPluggedIn && device.chargingStatus) {
                      return 'lädt.'
                    }

                    const t = new Date(d) - new Date()
                    if (!d) {
                      return 'Analyse erfolgt...'
                    } else if (t < 0) {
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
                      'verbleiben',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  })()
                }}</span></span
              >
              <div class="progress-bar" :style="'--battery-level:' + device.battery * 100 + '%;'">
                <span
                  class="progress-thumb"
                  :class="{ charging: device.chargingStatus }"
                  :style="'width:' + device.battery * 100 + '%;'"
                ></span>
              </div>
            </div>
            <span style="width: 90px" class="end" :style="device.battery === 0 ? 'color: #f77' : ''"
              >{{ Math.round(device.battery * 100) }}% <q-icon name="arrow_right"
            /></span>
          </div>
        </q-btn>
      </div>
    </div>

    <div class="misc">
      <h2>Empfehlungen</h2>
      <div class="grid">
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
                    : '#fff9')
              "
            />
          </div>

          <div class="content">
            <span class="title"> {{ r.title }} </span>
            <span class="caption"> {{ r.caption }} </span>
          </div>
        </div>
      </div>
      <span v-if="recommendations.length < 1"> Aktuell liegen keine Empfehlungen vor. </span>
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
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const deviceStore = useDeviceStore()
const userStore = useUserStore()
const computedDevices = computed(() => deviceStore.devices)
const criticalDevices = computed(() =>
  deviceStore.devices.filter(
    (dev) => dev.battery < 0.1 && !dev.isPluggedIn && !dev.chargingStatus && !dev.isCritical,
  ),
)
const warnedDevices = computed(() =>
  deviceStore.devices.filter(
    (dev) =>
      dev.battery >= 0.1 &&
      (dev.battery < 0.3 || new Date(dev.predictedZeroAt) < new Date() + 1000 * 60 * 60 * 2) &&
      !dev.isPluggedIn &&
      !dev.chargingStatus,
  ),
)
const computedUser = computed(() => userStore.user)

const recommendations = ref([])
const recommendationModel = ref({ show: false, data: {}, loading: false, success: null })

let recommendationGenerationInterval

onMounted(async () => {
  await deviceStore.loadDevices()
  recommendations.value = generateRecommendations()
  recommendationGenerationInterval = setInterval(() => {
    recommendations.value = generateRecommendations()
    console.log('generate recs')
  }, 5000)

  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})

onUnmounted(() => {
  clearInterval(recommendationGenerationInterval)
})

function generateRecommendations() {
  function sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const result = []

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

function openRecommendationWindow(recommendation) {
  recommendationModel.value.show = true
  recommendationModel.value.data = recommendation
}

async function orderNotification(deviceId) {
  recommendationModel.value.loading = true
  const result = await api.post('/notification/new', { deviceId: deviceId })
  recommendationModel.value.loading = false
  if (result.status === 200) {
    recommendationModel.value.success = true
    deviceStore.setLocalHasOrderedNotification(deviceId)
    recommendations.value = generateRecommendations()
  } else {
    recommendationModel.value.success = false
  }
}

function setDeviceCritical(device) {
  device.isCritical = true
  deviceStore.setCritical(device.id)
}
</script>

<style scoped lang="scss">
.main {
  color: #eee;
  padding: var(--std-pad);
  display: flex;
  flex-direction: column;

  > h1 {
    font-size: 48px;
    margin: 0;
    line-height: normal;
    color: #fff;
    font-weight: 500;
  }
  > h2 {
    font-size: 24px;
    margin: 0;
    line-height: normal;
    color: #ccc;
    font-weight: 400;
    margin-bottom: 24px;
  }
}

.attention {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;

  .header {
    font-weight: 500;
    font-size: 24px;
    padding: 3px 12px;
    border-radius: 12px 12px 6px 6px;
    position: relative;
    background-image: var(--bg-grad);
    display: flex;

    span {
      color: #aaa;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, #0000, #fff, #fff, #0000);
      opacity: 0.1;
      pointer-events: none;
      transition: opacity 0.3s;
    }
  }
  &.critical {
    --bg-grad: linear-gradient(to right, #fc2b2b33, #ffffff08 50%);
    --border-color: #fdadad;
  }
  &.soon {
    --bg-grad: linear-gradient(to right, #fcb62b33, #ffffff08 50%);
    --border-color: #fcb62b;
  }
  &:hover {
    .header::after {
      opacity: 0.2;
    }
  }

  .element {
    background-image: var(--bg-grad);
    padding: 12px 0;
    padding-right: 15px;
    padding-left: 3px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > i {
      font-size: 48px;
    }

    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;

      h2 {
        font-size: 24px;
        margin: 0;
        line-height: normal;
        font-weight: 500;
      }
      p {
        margin: 0;
        color: #bbb;
      }
    }

    .action {
      background-color: #2d3e53cc;
      border-radius: 6px;
    }

    &::after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      pointer-events: none;
      opacity: 0.15;
      transition: opacity 0.4s;
    }

    &:hover::after {
      opacity: 0.25;
    }
  }
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  h2 {
    font-size: 36px;
    margin: 0;
    line-height: normal;
    font-weight: 500;
    margin-left: 11px;
  }

  > div {
    border: 1px solid #fff2;
    border-radius: 12px;

    .device {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      color: var(--critical-color);
      //background-color: );
      background-image: linear-gradient(
        to right,
        color-mix(in srgb, var(--device-color) 10%, #0000),
        #ffffff08 50%
      );
      .content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        > div {
          display: flex;
          flex-direction: column;
          align-items: start;
          width: calc(100% - 90px);
          overflow: hidden;
          gap: 6px;
        }

        .text-information {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 100%;
          text-align: left;
          line-height: normal;
        }

        .progress-bar {
          width: 100%;
        }
        .remaining {
          color: #ccc;
        }

        .end {
          text-align: right;
          display: flex;
          justify-content: end;
        }
      }
    }
  }
}

.misc {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  h2 {
    font-size: 36px;
    font-weight: 500;
    margin: 0;
    line-height: normal;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
    width: 100%;
  }
}

.progress-bar {
  background-color: #0000007d;
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

@media only screen and (max-width: 800px) {
}

.bg-2 {
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
    radial-gradient(20% 34% at 6% 48%, #19948a 0%, #0000 96%),
    radial-gradient(68% 50% at 36% 92%, #2674d9 0%, #073aff00 100%),
    radial-gradient(44% 56% at 28% 70%, #26d93e 10%, #073aff00 100%),
    radial-gradient(22% 30% at 38% 85%, #26d93e 8%, #073aff00 100%),
    radial-gradient(34% 46% at 10% 96%, #26d93e70 22%, #073aff00 100%),
    radial-gradient(38% 60% at 88% 72%, #26d9ca 12%, #073aff00 100%),
    radial-gradient(30% 58% at 64% 90%, #7a26d9 0%, #0000 100%),
    linear-gradient(132deg, #000000ff 0%, #000000ff 100%);
  opacity: 0.05;
}

.recommendation {
  background-color: #ffffff08;
  padding: 12px;
  padding-left: 0;
  border-radius: 12px;
  border: 1px solid #fff1;
  display: flex;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: #ffffff17;
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

  &.news {
    min-width: min(800px, 100vw);
  }
}
</style>
