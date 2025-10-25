<template>
  <q-layout view="lHh Lpr lFf" class="layout">
    <q-header class="header" v-if="$route.name === 'login'">
      <q-toolbar class="toolbar">
        {{ $route.name }}
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
    <q-header elevated class="header" v-else>
      <q-toolbar class="toolbar">
        {{ $route.name }}
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
            label="Einstellungen"
            :class="{ 'active-page': $route.name === 'settings' }"
            to="settings"
          />
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
                <span class="profile-icon">J</span>
                <div>{{ computedUser.email }}</div>
              </div>
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
  </q-layout>
</template>

<script setup>
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const deviceStore = useDeviceStore()

const computedUser = computed(() => userStore.user)
const isLoggedIn = computed(() => userStore.loggedIn)

function logout() {
  userStore.logout()
  deviceStore.stopInterval()
  router.push({ name: 'login' })
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
  border-radius: 50px;
  box-shadow: 0 0 20px #ffffffbb;
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

@media only screen and (max-width: 900px) {
  .layout {
    --std-pad: 12px;
  }
}
</style>

<style lang="scss">
html {
  background-color: var(--main-bg-color); //#30394a;
  transition: background-color 1s;
  --main-bg-color: black;
  //overflow-x: hidden;

  &:not(:has(.box-highlight, .text-gradient)) {
    --main-bg-color: #222223;
  }
  &:has(.box-highlight, .text-gradient) {
  }
}
</style>
