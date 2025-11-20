import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    deviceArray: [],
    deviceHistoryArray: [],
    deviceWeekHistoryArray: [],
    interval: null,
    graphReloadTrigger: false,
  }),

  getters: {
    devices: (state) => {
      return state.deviceArray
    },
    deviceHistory: (state) => {
      return state.deviceHistoryArray
    },
    deviceWeekHistory: (state) => {
      return state.deviceWeekHistoryArray
    },
    watchGraphReloadTrigger: (state) => {
      return state.graphReloadTrigger
    },
  },

  actions: {
    async loadDevices() {
      console.log('Load devices')
      // We fetch this route to enable / disable notification ordering for certain devices
      const result = await api.get('/battery/withNotificationInfo')

      for (const device of result.data) {
        device.hasOrderedNotification =
          device.notificationIds.length && device.notificationIds[0] !== null
        device.predictedZeroAt =
          device.predictedZeroAt !== null ? new Date(device.predictedZeroAt) : null
      }

      this.deviceArray = result.data

      const gradientStops = [
        { pos: 0, color: [62, 115, 184] },
        { pos: 0.18, color: [55, 135, 178] },
        { pos: 0.35, color: [48, 154, 172] },
        { pos: 0.53, color: [40, 176, 165] },
        { pos: 0.69, color: [67, 191, 156] },
        { pos: 0.85, color: [97, 207, 146] },
        { pos: 1, color: [124, 222, 137] },
      ]

      // helper: interpolate between two numbers
      const lerp = (a, b, t) => a + (b - a) * t

      // helper: convert [r,g,b] to hex string
      const rgbToHex = ([r, g, b]) =>
        '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')

      // interpolate color at position t (0–1)
      function getColorAt(t) {
        // find stops
        let left = gradientStops[0]
        let right = gradientStops[gradientStops.length - 1]
        for (let i = 0; i < gradientStops.length - 1; i++) {
          if (t >= gradientStops[i].pos && t <= gradientStops[i + 1].pos) {
            left = gradientStops[i]
            right = gradientStops[i + 1]
            break
          }
        }
        // normalize t between the two stops
        const span = (t - left.pos) / (right.pos - left.pos)
        const rgb = left.color.map((c, i) => Math.round(lerp(c, right.color[i], span)))
        return rgbToHex(rgb)
      }

      // Example: assign colors for array of length N
      function assignColors(arr) {
        const n = arr.length
        return arr.map((item, i) => {
          const t = n === 1 ? 0 : i / (n - 1) // evenly spaced
          return { ...item, color: getColorAt(t) }
        })
      }

      this.deviceArray = assignColors(this.deviceArray)

      if (!this.interval) {
        this.interval = setInterval(() => this.loadDevices(), 1000)
      }

      return result.data
    },
    async loadHistory() {
      if (this.deviceHistoryArray.length > 0) {
        return this.deviceHistoryArray
      }

      const result = await api.get('/battery/history/all')

      //const processedData = []

      /*
      for (let i in result.data) {
        const deviceHistory = result.data[i]

        //console.log('Device History: ', deviceHistory)

        let newArray = []

        deviceHistory.forEach((val) => {
          newArray[val.createdAt] = { battery: val.battery, chargingStatus: val.chargingStatus }
        })

        //console.log('New Array: ', newArray)

        processedData[i] = newArray
      }
      */

      //await new Promise((r) => setTimeout(() => r(), 1000))

      this.deviceHistoryArray = result.data
      return result.data
    },
    async loadWeekistory() {
      if (this.deviceHistoryArray.length > 0) {
        return this.deviceHistoryArray
      }

      const result = await api.get('/battery/history/all/week')

      this.deviceWeekHistoryArray = result.data
      return result.data
    },
    setLocalHasOrderedNotification(deviceId) {
      this.deviceArray.find((val) => val.id === deviceId).hasOrderedNotification = true
    },
    async setIsShown(deviceName, isShown) {
      const result = await api.put('/device', { name: deviceName, isShown: isShown })

      this.deviceArray[this.deviceArray.findIndex((val) => val.name === deviceName)].isShown =
        isShown

      return result
    },
    async changeDeviceColor(deviceName, color) {
      const result = await api.put('/device', { name: deviceName, color: color })

      this.deviceArray[this.deviceArray.findIndex((val) => val.name === deviceName)].color = color

      this.graphReloadTrigger = !this.graphReloadTrigger

      return result
    },
    stopInterval() {
      clearInterval(this.interval)
      this.interval = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeviceStore, import.meta.hot))
}
