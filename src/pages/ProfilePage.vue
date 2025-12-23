<template>
  <q-page class="page-container">
    <div class="content-wrapper">
      <div class="row items-center q-mb-xl">
        <q-avatar
          size="100px"
          font-size="50px"
          text-color="white"
          class="shadow-10 profile-picture"
        >
          {{ computedUser.email.charAt(0).toUpperCase() }}
          <q-badge floating class="badge" v-if="computedUser.data?.admin"><span>DEV</span></q-badge>
          <q-badge floating class="badge tester" v-if="computedUser.data?.tester"
            ><span>TESTER</span></q-badge
          >
        </q-avatar>

        <div class="q-ml-lg">
          <div class="text-h4 text-weight-bold brand-gradient-text q-mb-xs">
            {{ computedUser.email || 'Lade...' }}
          </div>
          <div class="text-grey-5 text-subtitle1">
            Mitglied seit
            {{
              new Date(computedUser.data.createdAt).toLocaleDateString('de-DE', {
                month: 'long',
                year: 'numeric',
              })
            }}
          </div>
          <div class="row items-center q-mt-sm">
            <q-icon name="devices" color="grey-5" class="q-mr-xs" />
            <span class="text-white">{{ computedDevices.length }} verknüpfte Geräte</span>
          </div>
        </div>
      </div>

      <div class="q-mb-xl">
        <div class="text-h6 text-white q-mb-md flex items-center">
          <q-icon name="insights" color="secondary" class="q-mr-sm" />
          Deine Akku-Insights
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">Synchronisierungen</div>
                <div class="text-h4 text-weight-bold text-secondary counter-font">
                  {{ formatNumber(stats.totalSyncs) }}
                </div>
                <div class="text-xs text-grey-6 q-mt-sm">
                  Kommunikationen zwischen deinen Geräten
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">Ladevorgänge</div>
                <div class="text-h4 text-weight-bold text-white counter-font">
                  {{ stats.totalCharges }}
                </div>
                <div class="text-xs text-grey-6 q-mt-sm">Gesamtzahl all deiner Geräte</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">Akku-Sieger 🏆</div>
                <div class="text-h5 text-weight-bold text-white text-overflow no-overflow">
                  {{ stats.longestDevice }}
                </div>
                <div class="text-caption text-teal q-mt-sm">
                  {{ stats.longestPeriod }} ohne zu Laden
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-gradient text-white" flat>
              <q-card-section>
                <div class="text-caption text-white-8 uppercase">Top User</div>
                <div class="text-h4 text-weight-bold">{{ stats.communityRank }}</div>
                <div class="text-xs text-white-8 q-mt-sm">Basierend auf deiner Aktivität</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="q-mb-xl">
        <div class="text-h6 text-white q-mb-md">Account Einstellungen</div>
        <q-list bordered class="rounded-borders bg-grey-10 text-white">
          <q-item clickable v-ripple class="q-py-md" @click="changePasswordModel.show = true">
            <q-item-section avatar>
              <q-icon name="lock_reset" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Passwort zurücksetzen </q-item-label>
              <q-item-label caption class="text-grey-6"
                >Wähle ein neues Passwort. Du wirst von allen Geräten abgemeldet; Für diesen Vorgang
                werden deine Geräte temporär entsperrt.</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>

          <q-separator dark inset />

          <q-item
            clickable
            v-ripple
            class="q-py-md"
            @click="changeUsernameModel.show = true"
            :disable="
              new Date(computedUser.data.lastRename) > new Date() - 30 * 24 * 60 * 60 * 1000
            "
          >
            <q-item-section avatar>
              <q-icon name="edit" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >Nutzername ändern
                <span
                  v-if="
                    new Date(computedUser.data.lastRename) > new Date() - 30 * 24 * 60 * 60 * 1000
                  "
                >
                  - noch bis
                  {{
                    new Date(
                      new Date(computedUser.data.lastRename).setDate(
                        new Date(computedUser.data.lastRename).getDate() + 30,
                      ),
                    ).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  }}
                  deaktiviert
                </span></q-item-label
              >
              <q-item-label caption class="text-grey-6"
                >Ändere deinen Nutzernamen. Du kannst dies nur ein Mal pro Monat tun.</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="danger-zone q-pa-md rounded-borders border-red q-mb-xl">
        <div class="text-subtitle1 text-red text-weight-bold q-mb-sm">Kritisches</div>
        <p class="text-grey-6 text-caption q-mb-md">
          Wenn du deinen Account gelöscht hast, gibt es kein Zurück mehr. Wir entfernen alle Daten
          von unseren Servern, die deinem Account zugeordnet sind.
        </p>

        <div class="row q-gutter-md">
          <q-btn
            outline
            color="red"
            label="Deine Daten löschen"
            no-caps
            icon="delete_sweep"
            disable
          />
          <q-btn
            disable
            unelevated
            color="red"
            label="Account permanent löschen"
            no-caps
            class="text-black"
          />
        </div>
      </div>

      <div class="danger-zone q-pa-md rounded-borders border-red">
        <div class="text-subtitle1 text-red text-weight-bold q-mb-sm">Abmelden</div>
        <p class="text-grey-6 text-caption q-mb-md">
          Hier kannst du dich bei der Website abmelden.
        </p>

        <div class="row q-gutter-md">
          <q-btn
            outline
            color="red"
            label="Jetzt abmelden"
            no-caps
            icon="delete_sweep"
            @click="logout"
          />
        </div>
      </div>
    </div>

    <q-dialog
      v-model="changeUsernameModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="changeUsernameModel.text = ''"
      @before-show="changeUsernameModel.text = computedUser.email"
    >
      <div
        class="recommendation-popup positive"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Neuen Nutzernamen vergeben</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span> Mindestlänge: 4 Zeichen </span>
          <q-input
            color="white"
            dark
            filled
            type="text"
            label="Neuer Name"
            v-model="changeUsernameModel.text"
            style="width: 100%"
          />
          <q-btn
            label="Absenden
            "
            flat
            no-caps
            class="confirm-button"
            @click="renameUser(changeUsernameModel.text)"
            :disable="
              changeUsernameModel.text === computedUser.email || changeUsernameModel.text.length < 4
            "
          />
        </div>
      </div>
    </q-dialog>

    <q-dialog
      v-model="changePasswordModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="changePasswordModel.text = ''"
    >
      <div
        class="recommendation-popup positive"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Passwort zurücksetzen</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span> Mindestlänge: 8 Zeichen </span>
          <span
            class="text-negative"
            v-if="changePasswordModel.password !== changePasswordModel.repeat"
            >Passwörter stimmen nicht überein</span
          >
          <q-input
            color="white"
            dark
            filled
            type="password"
            label="Neues Passwort"
            v-model="changePasswordModel.password"
            style="width: 100%"
          />
          <q-input
            color="white"
            dark
            filled
            type="password"
            label="Passwort wiederholen"
            v-model="changePasswordModel.repeat"
            style="width: 100%"
          />
          <q-btn
            label="Absenden
            "
            flat
            no-caps
            class="confirm-button"
            @click="changePassword(changePasswordModel.password)"
            :disable="
              changePasswordModel.password.length < 8 ||
              changePasswordModel.password !== changePasswordModel.repeat
            "
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { reactive, onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

onMounted(async () => {
  const response = await api.get('/metrics/userStats')
  const data = response.data

  stats.totalCharges = data.totalCharges
  stats.totalSyncs = data.totalSyncs
  stats.longestDevice = data.longestWithoutCharge.deviceName
  stats.longestPeriod = data.longestWithoutCharge.formatted
  stats.communityRank = data.communityRank

  await deviceStore.loadDevices()

  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})

const userStore = useUserStore()
const deviceStore = useDeviceStore()
const router = useRouter()
const $q = useQuasar()

const stats = reactive({
  totalSyncs: 'Lade...',
  totalCharges: 'Lade...',
  longestDevice: 'lade...',
  longestPeriod: '...',
  communityRank: 'berechne...',
})

const computedDevices = computed(() => deviceStore.devices)

const computedUser = computed(() => userStore.user)

const changeUsernameModel = ref({ show: false, text: '', data: {} })
const changePasswordModel = ref({ show: false, password: '', repeat: '' })

// --- Helpers ---
const formatNumber = (num) => {
  if (isNaN(num)) return num
  return new Intl.NumberFormat('de-DE').format(num)
}
function logout() {
  userStore.logout()
  deviceStore.stopInterval()
  router.push({ name: 'login' })
}

async function renameUser(name) {
  if (name.length < 3) {
    $q.notify({
      type: 'negative',
      message: 'Nutzername muss mindestens 4 Zeichen lang sein.',
    })
    return
  }

  const result = await api.patch('/login/renameUser', { name })
  if (result.status === 200) {
    await userStore.auth()
    $q.notify({
      type: 'positive',
      message: 'Du hast dich erfolgreich umbenannt.',
    })
    changeUsernameModel.value.show = false
  }
}

async function changePassword(password) {
  if (password.length < 8) {
    $q.notify({
      type: 'negative',
      message: 'Nutzername muss mindestens 4 Zeichen lang sein.',
    })
    return
  }

  const result = await api.patch('/login/resetPassword', { password })
  if (result.status === 200) {
    $q.notify({
      type: 'positive',
      message: 'Du hast dich erfolgreich umbenannt.',
    })
    changeUsernameModel.value.show = false
    logout()
  }
}
</script>

<style scoped lang="scss">
.profile-picture {
  background: linear-gradient(10deg, #3e73b8cc 0%, #28b0a5cc 53%, #7cde89cc 100%);

  .badge {
    border-radius: 6px;
    padding: 3px 12px;
    background-color: #000;

    > span {
      background-image: linear-gradient(45deg, #3e73b8 0%, #28b0a5 53%, #7cde89 100%);
      color: transparent;
      background-clip: text;
      font-weight: 1000;
      display: inline-block;
    }
  }

  .badge.tester {
    > span {
      background-image: linear-gradient(90deg, #f46600, #ff3932);
    }
  }
}

/* Container limit for readability on large screens */
.page-container {
  padding: var(--std-pad);
  //
}
/* Gradient Text for Brand Identity (Matches your landing page) */
.brand-gradient-text {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* Stats Cards */
.stat-card {
  height: 100%;
  border-color: #333;
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #555;
}

.bg-gradient {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

/* Danger Zone Styling */
.danger-zone {
  border: 1px solid rgba(244, 67, 54, 0.3);
  background: rgba(244, 67, 54, 0.05);
  border-radius: 12px;
}

.text-xs {
  font-size: 0.75rem;
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.no-overflow {
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: initial;
  overflow: hidden;
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
