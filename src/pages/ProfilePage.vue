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
            {{ $t('profile.member-since') }}
            {{
              new Date(computedUser.data.createdAt).toLocaleDateString(i18n.global.locale.value, {
                month: 'long',
                year: 'numeric',
              })
            }}
          </div>
          <div class="row items-center q-mt-sm">
            <q-icon name="devices" color="grey-5" class="q-mr-xs" />
            <span class="text-white"
              >{{ computedDevices.length }} {{ $t('profile.connected-devices') }}</span
            >
          </div>
        </div>
      </div>

      <div class="q-mb-xl">
        <div class="text-h6 text-white q-mb-md flex items-center">
          <q-icon name="insights" color="secondary" class="q-mr-sm" />
          {{ $t('profile.insights') }}
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">{{ $t('profile.syncs') }}</div>
                <div class="text-h4 text-weight-bold text-secondary counter-font">
                  {{ formatNumber(stats.totalSyncs) }}
                </div>
                <div class="text-xs text-grey-6 q-mt-sm">
                  {{ $t('profile.syncs-detail') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">{{ $t('profile.charges') }}</div>
                <div class="text-h4 text-weight-bold text-white counter-font">
                  {{ stats.totalCharges }}
                </div>
                <div class="text-xs text-grey-6 q-mt-sm">{{ $t('profile.charges-detail') }}</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-grey-10 text-white" flat bordered>
              <q-card-section>
                <div class="text-caption text-grey-5 uppercase">
                  {{ $t('profile.battery-winner') }}
                </div>
                <div class="text-h5 text-weight-bold text-white text-overflow no-overflow">
                  {{ stats.longestDevice }}
                </div>
                <div class="text-caption text-teal q-mt-sm">
                  {{ stats.longestPeriod }} {{ $t('profile.without-charging') }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card bg-gradient text-white" flat>
              <q-card-section>
                <div class="text-caption text-white-8 uppercase">Top User</div>
                <div class="text-h4 text-weight-bold">{{ stats.communityRank }}</div>
                <div class="text-xs text-white-8 q-mt-sm">
                  {{ $t('profile.based-on-activity') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="q-mb-xl">
        <div class="text-h6 text-white q-mb-md">{{ $t('profile.account-settings') }}</div>
        <q-list bordered class="rounded-borders bg-grey-10 text-white">
          <q-item clickable v-ripple class="q-py-md" @click="changePasswordModel.show = true">
            <q-item-section avatar>
              <q-icon name="lock_reset" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('profile.reset-password') }}</q-item-label>
              <q-item-label caption class="text-grey-6">{{
                $t('profile.reset-password-description')
              }}</q-item-label>
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
                >{{ $t('profile.change-username') }}
                <span
                  v-if="
                    new Date(computedUser.data.lastRename) > new Date() - 30 * 24 * 60 * 60 * 1000
                  "
                >
                  - {{ $t('profile.deactivated-until-1') }}
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
                  {{ $t('profile.deactivated-until-2') }}
                </span></q-item-label
              >
              <q-item-label caption class="text-grey-6">{{
                $t('profile.change-username-description')
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            class="q-py-md"
            @click="createNotificationModel.show = true"
            v-if="computedUser.data?.admin"
          >
            <q-item-section avatar>
              <q-icon name="notification_add" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Benachrichtigung versenden</q-item-label>
              <q-item-label caption class="text-grey-6">An beliebige Nutzer!</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            class="q-py-md"
            @click="$router.push('/update')"
            v-if="computedUser.data?.admin"
          >
            <q-item-section avatar>
              <q-icon name="notification_add" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Updates verwalten</q-item-label>
              <q-item-label caption class="text-grey-6"
                >Neues Update veröffentlichen, Versionen löschen, Historie ansehen</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div class="danger-zone q-pa-md rounded-borders border-red q-mb-xl">
        <div class="text-subtitle1 text-red text-weight-bold q-mb-sm">
          {{ $t('profile.critical') }}
        </div>
        <p class="text-grey-6 text-caption q-mb-md">
          {{ $t('profile.delete-account-description') }}
        </p>

        <div class="row q-gutter-md">
          <q-btn
            outline
            color="red"
            :label="$t('profile.delete-data')"
            no-caps
            icon="delete_sweep"
            disable
          />
          <q-btn
            disable
            unelevated
            color="red"
            :label="$t('profile.delete-account')"
            no-caps
            class="text-black"
          />
        </div>
      </div>

      <div class="danger-zone q-pa-md rounded-borders border-red">
        <div class="text-subtitle1 text-red text-weight-bold q-mb-sm">
          {{ $t('profile.logout') }}
        </div>
        <p class="text-grey-6 text-caption q-mb-md">
          {{ $t('profile.logout-description') }}
        </p>

        <div class="row q-gutter-md">
          <q-btn
            outline
            color="red"
            :label="$t('profile.logout-now')"
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
          <h1>{{ $t('profile.new-username') }}</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span> {{ $t('profile.min-4-char') }} </span>
          <q-input
            color="white"
            dark
            filled
            type="text"
            :label="$t('profile.new-name')"
            v-model="changeUsernameModel.text"
            style="width: 100%"
          />
          <q-btn
            :label="$t('profile.submit')"
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
          <h1>{{ $t('profile.reset-password') }}</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <span> {{ $t('profile.min-8-char') }} </span>
          <span
            class="text-negative"
            v-if="changePasswordModel.password !== changePasswordModel.repeat"
            >{{ $t('profile.passwords-do-not-match') }}</span
          >
          <q-input
            color="white"
            dark
            filled
            type="password"
            :label="$t('profile.new-password')"
            v-model="changePasswordModel.password"
            style="width: 100%"
          />
          <q-input
            color="white"
            dark
            filled
            type="password"
            :label="$t('profile.repeat-password')"
            v-model="changePasswordModel.repeat"
            style="width: 100%"
          />
          <q-btn
            :label="$t('profile.submit')"
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
            type="textarea"
            label="URL"
            v-model="createNotificationModel.data.url"
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
  </q-page>
</template>

<script setup>
import { useQuasar, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useDeviceStore } from 'src/stores/device-store'
import { useUserStore } from 'src/stores/user-store'
import { reactive, onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { i18n } from 'src/boot/i18n'
import { useI18n } from 'vue-i18n'

const createNotificationModel = ref({ show: false, data: {} })
const { t } = useI18n()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const router = useRouter()
const $q = useQuasar()

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

const stats = reactive({
  totalSyncs: t('profile.loading'),
  totalCharges: t('profile.loading'),
  longestDevice: t('profile.loading'),
  longestPeriod: t('profile.loading'),
  communityRank: t('profile.loading'),
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
      message: t('profile.successfully-renamed'),
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
      message: t('profile.successfully-changed-password'),
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

    > label {
      width: 100%;
    }

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
