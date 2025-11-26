<template>
  <q-layout view="hHh lpr fFf" class="layout">
    <q-header class="header" v-if="$route.name === 'login'">
      <q-toolbar class="toolbar">
        <img
          src="/icons/favicon-96x96.png"
          alt="Icon"
          width="30px"
          style="margin-right: 10px"
          class="cursor-pointer"
          :class="{ 'box-highlight': $route.name === 'indexpage' }"
          @click="$router.push({ name: 'indexpage' })"
          tabindex="0"
        />
        <span class="text-gradient" style="font-size: 24px">BatterySync</span>
      </q-toolbar>
    </q-header>
    <q-header class="header" v-else>
      <q-toolbar class="toolbar">
        <img
          src="/icons/favicon-96x96.png"
          alt="Icon"
          width="30px"
          style="margin-right: 10px"
          class="cursor-pointer grayscale"
          :class="{ 'box-highlight': $route.name === 'indexpage' }"
          @click="$router.push({ name: 'indexpage' })"
          tabindex="0"
        />
        <div class="navigation-container">
          <q-btn
            flat
            no-caps
            label="Dashboard"
            class="nav-btn"
            :class="{ 'active-page': $route.name === 'dashboard' }"
            to="dashboard"
          />
          <q-btn
            flat
            class="nav-btn"
            no-caps
            :class="{ 'active-page': $route.name === 'devices' }"
            to="devices"
            v-if="isLoggedIn"
            ><div class="header-btn-label">Meine Geräte</div>
            <q-icon name="devices_other" class="header-btn-icon"
          /></q-btn>
          <q-btn
            flat
            class="nav-btn"
            no-caps
            :class="{ 'active-page': $route.name === 'issues' }"
            to="issues"
            ><div class="header-btn-label">Community</div>
            <q-icon name="group" class="header-btn-icon"
          /></q-btn>
        </div>

        <q-space />

        <q-btn flat dense no-caps v-if="!isLoggedIn" class="login-button" to="login">
          <span style="margin-right: 6px">Anmelden</span>
          <span class="profile-icon">?</span>
        </q-btn>

        <q-btn flat dense v-else>
          <span class="profile-icon">{{ (computedUser.email || '?').at(0) }}</span>
          <q-popup-proxy>
            <div class="account-list" v-if="computedUser.email">
              <div class="account-name">
                <span class="profile-icon">{{ (computedUser.email || '?').at(0) }}</span>
                <div>{{ computedUser.email }} {{ isAdmin ? ' - ADMIN ACCOUNT' : '' }}</div>
              </div>
              <q-separator />
              <q-btn
                flat
                no-caps
                align="left"
                v-if="isAdmin"
                @click="createNotificationModel.show = true"
                >Benachrichtigungen versenden</q-btn
              >

              <q-separator />
              <q-btn flat no-caps align="left">Passwort ändern</q-btn>
              <q-separator />
              <q-btn flat no-caps align="left" color="red">Account Löschen</q-btn>
              <q-separator />
              <q-btn flat no-caps align="left" color="orange" icon="logout" @click="logout"
                >Abmelden</q-btn
              >
            </div>
            <div class="account-list" v-else>
              <div>Melde Dich an, um auf alle Funktionen zuzugreifen.</div>
              <q-separator />
              <q-btn flat no-caps align="left">Hier Anmelden</q-btn>
            </div>
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="main-page-container">
      <router-view />
    </q-page-container>

    <div
      class="footer"
      v-if="['indexpage', 'impressum', 'issues', 'profile'].includes($route.name)"
    >
      <h2>Copyright © 2025 by Jannik Klein</h2>
      <div>
        <q-btn label="Feedback geben / Issues" no-caps flat to="issues" />
        <q-btn label="Impressum" no-caps flat to="impressum" />
        <q-btn label="API Usage Insights" no-caps flat to="apiusage" />
      </div>
    </div>

    <q-dialog
      v-model="createNotificationModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="createNotificationModel.data = {}"
      full-width
    >
      <div
        class="recommendation-popup"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Benachrichtigung an Nutzer versenden</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <q-input
            color="white"
            dark
            filled
            label="Titel"
            v-model="createNotificationModel.data.title"
          />
          <q-input
            color="white"
            dark
            filled
            type="textarea"
            label="Inhalt"
            v-model="createNotificationModel.data.content"
          />

          <q-input
            color="white"
            dark
            filled
            label="Spezielle User"
            v-model="createNotificationModel.data.users"
          />

          <q-btn
            label="Versenden
            "
            flat
            class="confirm-button"
            @click="sendNotificationToUsers()"
          />
        </div>
      </div>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

const userStore = useUserStore()
const router = useRouter()
const deviceStore = useDeviceStore()

const computedUser = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.loggedIn)
const isAdmin = computed(() => userStore.isAdmin)

const createNotificationModel = ref({ show: false, data: {} })

onMounted(async () => {
  await userStore.checkAdmin()
  await userStore.checkUserId()
})

function logout() {
  userStore.logout()
  deviceStore.stopInterval()
  router.push({ name: 'login' })
}

async function sendNotificationToUsers() {
  const data = createNotificationModel.value.data

  if (data.title && data.content) {
    const result = await api.post('/notification/new/custom', data)

    if (result.status === 200) {
      createNotificationModel.value.data = {}
    } else {
      Notify.create({ message: 'Ein Fehler ist aufgetreten', type: 'negative' })
    }
  } else {
    Notify.create({ message: 'Bitte fülle alle Felder aus', type: 'negative' })
  }
}
</script>

<style lang="scss" scoped>
.layout {
  --std-pad: 24px;
}

.main-page-container {
  //background-color: #30394a;
  display: flex;
  justify-content: center;
  > main {
    width: min(1200px, calc(100vw));
  }
}

.header {
  //background-color: #00000000;
  backdrop-filter: blur(10px);
  /*
  background: linear-gradient(
    220deg,
    rgba(62, 115, 184, 0.5) 0%,
    rgba(40, 176, 165, 0.5) 53%,
    rgba(124, 222, 137, 0.5) 100%
  );
  */
  background-color: color-mix(in srgb, var(--main-bg-color) 75%, #00000000);
  display: flex;
  justify-content: center;
  transition: background-color 1s;
}
.toolbar {
  padding: 0 var(--std-pad);
  width: min(1200px, calc(100vw));
}
.profile-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1em;
  border-radius: 15px;
  font-size: 15px;
  font-weight: bold;
  color: white;
  background: linear-gradient(10deg, #3e73b8cc 0%, #28b0a5cc 53%, #7cde89cc 100%);
}

.navigation-container {
  color: #ffffff99;

  .active-page {
    font-weight: bold;
    color: #fff;
  }
}

.box-highlight {
  filter: grayscale(0) !important;
}
.grayscale {
  filter: grayscale(1);
}

.account-list {
  background-color: white;
  > div {
    padding: 12px;
  }
  .account-name {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    gap: 12px;

    > div {
      font-weight: 500;
      font-size: 24px;
    }
  }
  button {
    width: 100%;
  }
}

.login-button {
  background-color: #ffffff20;
  border-radius: 30px;
  padding: 0 0 0 12px;
  font-size: 12px;
}

.text-gradient {
  background-image: linear-gradient(10deg, #3e73b8 0%, #28b0a5 53%, #7cde89 100%);
  color: transparent;
  background-clip: text;
  font-weight: 500;
  display: inline-block;
}

.nav-btn {
  padding: 10px 12px;
}

.footer {
  background-color: #131415;
  color: white;
  padding: var(--std-pad);
  padding-top: 60px;
  padding-bottom: 50px;

  h2 {
    grid-column: 1/-1;
    font-weight: 500;
    font-size: 24px;
    margin: 0;
    line-height: 1em;
    margin-bottom: 50px;
    text-align: center;
  }

  div {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    justify-items: center;
    align-items: center;
  }
}

.recommendation-popup {
  background-color: var(--main-bg-color);
  color: #fff;
  --gradient-start: #000000;
  --gradient-end: #ffffff;
  width: 100%;

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
    color: white;

    > label {
      width: 100%;
    }

    .confirm-button {
      margin-top: 12px;
      font-size: 18px;
      background-color: #00d50b1b;
      color: green;
      min-width: 250px;
    }
  }

  &.news {
    min-width: min(800px, 100vw);
  }
}

.header-btn-icon {
  display: none;
}
.header-btn-label {
  display: inline;
}

@media only screen and (max-width: 900px) {
  .layout {
    --std-pad: 12px;
  }
}
@media only screen and (max-width: 500px) {
  .header-btn-label {
    display: none;
  }
  .header-btn-icon {
    display: block;
  }
}
</style>

<style lang="scss">
html {
  background-color: var(--main-bg-color); //#30394a;
  transition: background-color 1s;
  --main-bg-color: black;
  //overflow-x: hidden;

  &:not(:has(header .box-highlight, header .text-gradient)) {
    --main-bg-color: #212126;
  }
  &:has(header .box-highlight, header .text-gradient) {
  }
}
</style>
