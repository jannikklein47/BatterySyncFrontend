<template>
  <q-page padding class="column">
    <div class="main-element q-mb-lg">
      <q-card flat class="text-black bg-transparent">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-overline text-weight-medium">Newest Version</div>
            <div class="text-h4 text-weight-bold">Build {{ latestVersion?.build }}</div>
          </div>

          <q-space />

          <q-btn
            flat
            rounded
            style="background-color: #ffffff50"
            no-caps
            label="Download"
            icon="download"
            size="lg"
            @click="downloadVersion(latestVersion?.build)"
          />
        </q-card-section>
      </q-card>
    </div>

    <div
      class="q-pa-md q-mb-lg"
      style="
        background-color: #ffffff20;
        border-radius: var(--std-pad);
        display: flex;
        flex-direction: column;
        gap: 12px;
      "
    >
      <div class="text-overline text-weight-bold text-white">Release History</div>

      <div
        v-for="(release, index) in updates"
        :key="release.id"
        class="bg-grey-4"
        style="border-radius: calc(var(--std-pad) / 2); padding: var(--std-pad)"
      >
        <div class="text-h5 text-weight-bold q-mb-md">
          Release vom {{ new Date(release.createdAt).toLocaleString() }}
        </div>
        <div class="row q-gutter-sm q-mb-sm">
          <q-chip outline color="brown" class="bg-grey-3" icon="numbers">
            Build: {{ release.build }}
          </q-chip>
          <q-chip outline color="green" class="bg-grey-3" icon="android"> Android </q-chip>
          <q-chip outline color="blue" class="bg-grey-3" icon="add" v-if="index === 0">
            Latest
          </q-chip>
          <q-chip outline color="red" class="bg-grey-3" icon="remove" v-else> Deprecated </q-chip>

          <q-chip
            outline
            clickable
            color="grey-8"
            icon="download"
            class="bg-grey-3"
            :disable="!computedUser.data?.admin"
            @click="downloadVersion(release.build)"
          >
            Download
            <q-tooltip v-if="!computedUser.data?.admin" class="text-body2" style="width: 300px">
              {{ $t('download.only-newest') }}
            </q-tooltip>
          </q-chip>

          <q-chip
            clickable
            outline
            color="black"
            icon="edit"
            v-if="computedUser.data?.admin"
            @click="editDialog = { show: true, release: JSON.parse(JSON.stringify(release)) }"
          >
            Edit
          </q-chip>
        </div>

        <q-separator class="q-mb-sm" />

        <div class="release-notes text-body1 text-grey-10">
          <span v-for="line in release.notes?.split('\n')" :key="line + Math.random()">
            {{ line }} <br />
          </span>
        </div>
      </div>
    </div>

    <q-card flat bordered v-if="computedUser.data?.admin">
      <q-card-section>
        <div class="text-h6">Upload New APK Update</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm">
        <q-input v-model="form.version" label="Version (e.g. 1.2.0)" dense outlined />
        <q-input v-model="form.notes" label="Release Notes" type="textarea" dense outlined />
        <q-file v-model="form.file" label="Select APK File" accept=".apk" outlined dense counter>
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Upload Update" color="primary" :loading="uploading" @click="uploadUpdate" />

        <q-btn label="Delete entries" @click="deleteEntries" />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="editDialog.show">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Release</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="editDialog.release.notes"
            label="Release Notes"
            type="textarea"
            dense
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Save" color="primary" @click="saveRelease" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios' // Standard Quasar axios setup
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const computedUser = computed(() => userStore.user)

const $q = useQuasar()

const form = ref({ version: '', notes: '', file: null })
const uploading = ref(false)
const updates = ref([])
const latestVersion = ref(null)

const editDialog = ref({ show: false, release: null })

// --- API Calls ---

const fetchUpdates = async () => {
  try {
    const response = await api.get('/appInfo/updates/android/all') // You'll need an endpoint that lists all
    updates.value = response.data

    // Logic to find the newest (assuming sorted by DB or using semver logic)

    latestVersion.value = updates.value[0]
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Failed to load updates' })
  }
}

const deleteEntries = async () => {
  try {
    const response = await api.delete('/appInfo/updates/all')
    console.log(response.data)
  } catch (error) {
    console.error('Error deleting entries:', error)
  }
}

const saveRelease = async () => {
  try {
    await api.patch(`/appInfo/updates/android/${editDialog.value.release.build}`, {
      notes: editDialog.value.release.notes,
    })
    $q.notify({ color: 'positive', message: 'Release updated!' })
    editDialog.value.show = false
    await fetchUpdates()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Failed to update release' })
  }
}

const uploadUpdate = async () => {
  if (!form.value.file || !form.value.version) {
    return $q.notify('Please provide version and file')
  }

  const formData = new FormData()

  formData.append('version', form.value.version)
  formData.append('notes', form.value.notes)
  formData.append('file', form.value.file)

  uploading.value = true
  try {
    await api.post('/appInfo/updates/android', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    $q.notify({ color: 'positive', message: 'Upload successful!' })
    form.value = { version: '', notes: '', file: null } // Reset
    await fetchUpdates()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Upload failed' })
  } finally {
    uploading.value = false
  }
}

const downloadVersion = (version) => {
  // We point the browser directly to the download URL
  // Replace with your actual base URL
  const url = `https://batterysync.de:3000/appInfo/updates/download/${version}`
  window.open(url, '_blank')
}

onMounted(fetchUpdates)
onMounted(() => {
  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})
</script>

<style lang="scss">
.main-element {
  color: black;
  background: #3e73b8;
  background: linear-gradient(220deg, #3e73b8 0%, rgba(40, 176, 165, 1) 53%, #7cde89 100%);
  padding: var(--std-pad);
  border-radius: var(--std-pad);
  width: 100%;
  box-shadow:
    0 2px 4px inset #ffffff50,
    0 12px 12px #00000020;
  //min-height: 300px;
}
</style>
