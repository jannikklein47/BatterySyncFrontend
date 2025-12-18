<template>
  <div class="rolling-counter">
    <span v-for="(digit, index) in paddedDigits" :key="index" class="digit">
      <div class="digit-wrapper" :style="wrapperStyle(digit)">
        <span v-for="n in 10" :key="n" class="digit-value">{{ n - 1 }}</span>
      </div>
      {{ (paddedDigits.length - index) % 3 === 1 && index < paddedDigits.length - 1 ? '.' : '' }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props: you pass the number you want to show
const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
})

// Convert number → array of digits
const paddedDigits = computed(() => {
  return String(Math.floor(props.value))
    .split('')
    .map((n) => Number(n))
})

// Height of a single digit (must match CSS)
const digitHeight = 56

// Translate wrapper so the correct digit is visible
const wrapperStyle = (digit) => ({
  transform: `translateY(-${digit * digitHeight}px)`,
})
</script>

<style scoped lang="scss">
.rolling-counter {
  display: inline-flex;
  gap: 2px;
  font-size: 56px;
  line-height: 56px;
  font-weight: bold;
  //font-family: monospace;
}

.digit {
  overflow: hidden;
  height: 56px; /* must match digitHeight in script */
  width: fit-content;
  position: relative;
  display: flex;
}

.digit-wrapper {
  display: flex;
  flex-direction: column;
  transition: transform 0.8s ease-out;
}

.digit-value {
  height: 56px; /* must match digitHeight */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
