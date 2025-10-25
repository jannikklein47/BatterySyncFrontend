<template>
  <q-page class="main">
    <div class="bg-1"></div>
    <div class="text">
      <h1>
        Willkommen bei <br />
        <span class="text-gradient">BatterySync</span>
      </h1>
    </div>

    <form class="login" @submit.prevent="login">
      <h2>Anmelden</h2>
      <p>Oder direkt Registrieren</p>
      <q-input
        :disable="loginLoading"
        standout="bg-grey-8"
        autofocus
        label="Nutzername"
        v-model="inputUsername"
        autocomplete="login username"
      />
      <q-input
        :disable="loginLoading"
        type="password"
        standout="bg-grey-8"
        label="Passwort"
        v-model="inputPassword"
        autocomplete="login password"
      />

      <q-btn type="submit" label="Absenden" no-caps flat :loading="loginLoading" />
    </form>
  </q-page>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const $q = useQuasar()

const inputUsername = ref('')
const inputPassword = ref('')
const loginLoading = ref(false)

async function login() {
  loginLoading.value = true
  const result = await userStore.login(inputUsername.value, inputPassword.value)
  if (result === true) {
    router.push({ name: 'dashboard' })
  } else {
    $q.notify({
      message: result,
      timeout: 6000,
      type: 'negative',
      position: 'bottom-right',
    })
  }
  loginLoading.value = false
}
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
  width: min(100%, 600px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #000000aa;
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
    font-size: 24px;
  }

  button {
    width: 200px;
    background-image: linear-gradient(100deg, #7cde89 0%, #28b0a5 53%, #3e73b8 100%);
  }

  * {
    color: #fff;
  }
}
</style>
