<template>
  <q-page class="main">
    <div class="main-element">
      <h1>Feedback & Issues</h1>
    </div>

    <q-btn flat no-caps class="create-new" @click="createIssueModel.show = true">
      <span>Neues Element erstellen</span>
      <q-space />
      <q-icon name="add" />
    </q-btn>

    <div class="element" v-for="issue in computedIssues" :key="issue.id">
      <div
        class="status-indicator"
        :style="
          'background-color:' +
          (issue.status === 0
            ? 'red'
            : issue.status === 1
              ? 'orange'
              : issue.status === 2
                ? 'green'
                : 'grey') +
          ';'
        "
      ></div>
      <h2>
        <div
          class="prio-indicator"
          :style="
            'background-color:' +
            (issue.priority === 0
              ? '#777777'
              : issue.priority === 1
                ? 'orange'
                : issue.priority === 2
                  ? 'RED'
                  : 'black')
          "
        >
          {{
            issue.priority === 0
              ? 'Low'
              : issue.priority === 1
                ? 'High'
                : issue.priority === 2
                  ? 'CRITICAL'
                  : '?'
          }}
        </div>
        <div class="category">
          {{
            issue.category === 0
              ? 'Idee'
              : issue.category === 1
                ? 'Bug'
                : issue.category === 2
                  ? 'Verbesserung'
                  : ''
          }}
        </div>
        <span class="time">
          <q-icon name="add_comment" />
          {{ new Date(issue.createdAt).toLocaleDateString('de-De') }}</span
        >
        <span class="time">
          <q-icon name="update" />
          {{ new Date(issue.updatedAt).toLocaleDateString('de-De') }}</span
        >
        <span class="user"> @{{ issue.user?.email || 'unknown' }} </span>
      </h2>
      <h2>
        <span class="text"
          >{{ issue.title }}

          <q-tooltip>
            {{ issue.title }}
          </q-tooltip>
        </span>
      </h2>
      <q-separator dark />
      <p>
        Beschreibung <br />
        <span
          v-show="issue.description.length < 400"
          v-for="p in issue.description
            .replace(/\n{2,}/g, '\n')
            .replace(/ {2,}/g, ' ')
            .split('\n')"
          :key="p"
          >{{ p }} <br
        /></span>
      </p>

      <div class="admin-btns">
        <q-btn
          no-caps
          flat
          icon="delete"
          color="red"
          @click="deleteIssue(issue.id)"
          v-if="isAdmin || issue.userId === userId"
        />
        <q-btn
          no-caps
          flat
          icon="edit"
          color="blue"
          @click="startEditIssue(issue)"
          v-if="isAdmin || issue.userId === userId"
        />
        <q-btn
          label="Nicht bearbeitet"
          no-caps
          flat
          icon="block"
          v-if="isAdmin"
          @click="changeStatus(issue.id, 0, issue)"
        />
        <q-btn
          label="In Bearbeitung"
          no-caps
          flat
          icon="edit"
          v-if="isAdmin"
          @click="changeStatus(issue.id, 1, issue)"
        />
        <q-btn
          label="Erledigt"
          no-caps
          flat
          icon="done_all"
          v-if="isAdmin"
          @click="changeStatus(issue.id, 2, issue)"
        />
      </div>
    </div>

    <q-dialog
      v-model="createIssueModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="createIssueModel.data = {}"
      full-width
    >
      <div
        class="recommendation-popup"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Neuen Issue erstellen</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <q-input color="white" dark filled label="Titel" v-model="createIssueModel.data.title" />
          <q-input
            color="white"
            dark
            filled
            type="textarea"
            label="Beschreibung"
            v-model="createIssueModel.data.description"
          />

          <q-select
            label="Kategorie"
            dark
            color="white"
            :options="[
              { label: 'Idee', value: '0' },
              { label: 'Bug', value: '1' },
              { label: 'Verbesserung', value: '2' },
            ]"
            v-model="createIssueModel.data.category"
          />

          <q-select
            label="Priorität"
            dark
            color="white"
            :options="[
              { label: 'Low', value: '0' },
              { label: 'High', value: '1' },
              { label: 'Critical', value: '2' },
            ]"
            v-model="createIssueModel.data.priority"
          />

          <q-btn
            label="Hochladen
            "
            flat
            class="confirm-button"
            @click="createIssue()"
          />
        </div>
      </div>
    </q-dialog>

    <q-dialog
      v-model="editIssueModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="editIssueModel.data = {}"
      full-width
    >
      <div
        class="recommendation-popup"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Issue Bearbeiten</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <q-input color="white" dark filled label="Titel" v-model="editIssueModel.data.title" />
          <q-input
            color="white"
            dark
            filled
            type="textarea"
            label="Beschreibung"
            v-model="editIssueModel.data.description"
          />

          <q-select
            label="Kategorie"
            dark
            color="white"
            :options="[
              { label: 'Idee', value: 0 },
              { label: 'Bug', value: 1 },
              { label: 'Verbesserung', value: 2 },
            ]"
            v-model="editIssueModel.data.category"
            map-options
            emit-value
          />

          <q-select
            label="Priorität"
            dark
            color="white"
            :options="[
              { label: 'Low', value: 0 },
              { label: 'High', value: 1 },
              { label: 'Critical', value: 2 },
            ]"
            v-model="editIssueModel.data.priority"
            map-options
            emit-value
          />

          <q-btn
            label="Hochladen
            "
            flat
            class="confirm-button"
            @click="sendEdit()"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useIssueStore } from 'src/stores/issue-store'
import { useUserStore } from 'src/stores/user-store'
import { computed, onMounted, ref } from 'vue'

const $q = useQuasar()

const issueStore = useIssueStore()
const userStore = useUserStore()

const computedIssues = computed(() => issueStore.issues)

const createIssueModel = ref({ show: false, data: {} })
const editIssueModel = ref({ show: false, data: {} })

const isAdmin = computed(() => userStore.isAdmin)
const userId = computed(() => userStore.userId)

onMounted(async () => {
  await issueStore.loadIssues()
})

async function createIssue() {
  let data
  try {
    data = createIssueModel.value.data

    data.category = data.category.value
    data.priority = data.priority.value

    if (!data.title || !data.description) {
      $q.notify({ type: 'negative', message: 'Bitte alle Felder ausfüllen!' })
      return
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Bitte alle Felder ausfüllen!' })
    return
  }

  const result = await issueStore.create(data)

  if (result.status !== 200) {
    $q.notify({ type: 'negative', message: 'Something went wrong' })
  } else {
    createIssueModel.value.show = false
  }
}

async function deleteIssue(id) {
  await issueStore.delete(id)
}

async function changeStatus(id, status, issue) {
  await issueStore.changeStatus(id, status)
  issue.status = status
}

function startEditIssue(issue) {
  editIssueModel.value.data = issue
  editIssueModel.value.show = true
}

async function sendEdit() {
  const data = editIssueModel.value.data

  data.category = data.category.value || data.category
  data.priority = data.priority.value || data.priority

  if (!data.title || !data.description) return

  const result = await issueStore.update(data)

  if (result.status !== 200) {
    $q.notify({ type: 'negative', message: 'Something went wrong' })
  } else {
    editIssueModel.value.show = false
  }
}
</script>

<style lang="scss" scoped>
.main {
  color: white;
  padding: var(--std-pad);
  display: flex;
  flex-direction: column;
  gap: var(--std-pad);
  align-items: center;

  h1 {
    font-size: 36px;
    font-weight: 400;
    line-height: 1.2em;
    margin: 0;
  }
}

.main-element {
  background: #3e73b8;
  background: linear-gradient(220deg, #3e73b8 0%, rgba(40, 176, 165, 1) 53%, #7cde89 100%);
  padding: var(--std-pad);
  border-radius: var(--std-pad);
  width: 100%;
  box-shadow:
    0 2px 4px inset #ffffff50,
    0 12px 12px #00000020;
  //min-height: 300px;

  h1 {
    font-weight: 500;
    font-size: 48px;
    line-height: 1em;
    margin: 0;
  }
  > span {
    position: relative;
    left: 3px;
    font-size: 20px;
  }
}

.create-new {
  width: fit-content;
  background-color: #ffffff20;
  border-radius: var(--std-pad);
}

.element {
  background-color: #00000030;
  border-radius: var(--std-pad);
  box-shadow:
    0 0 10px inset #00000030,
    0 12px 12px #00000020;
  padding: var(--std-pad);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--std-pad);
  width: 100%;

  > * {
    margin-left: var(--std-pad);
  }

  .prio-indicator {
    background-color: black;
    padding: 6px;
    border-radius: 12px;
    min-width: fit-content;
    text-align: center;
    height: fit-content;
  }

  .status-indicator {
    width: var(--std-pad);
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: red;
    margin: 0;
    border-top-left-radius: var(--std-pad);
    border-bottom-left-radius: var(--std-pad);
  }
  .category {
    margin: 0;
    background-color: #2e2e2e;
    height: fit-content;
    padding: 6px;
    border-radius: 12px;
    font-weight: 500;
  }
  h2 {
    line-height: 1.2em;
    margin: 0;
    margin-left: var(--std-pad);
    font-weight: 300;
    font-size: 30px;
    flex-direction: row;
    display: flex;
    gap: var(--std-pad);

    .text {
      max-width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      height: 1.2em;
      white-space: nowrap;
    }

    > div,
    .time,
    .user {
      margin: 0;
      display: flex;
      flex-direction: row;
      font-size: 15px;
      line-height: 1.2em;
      gap: 6px;
      align-items: center;
      justify-content: center;
    }

    .user {
      font-weight: 500;
    }
  }

  .admin-btns {
    display: flex;
    justify-content: space-between;
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
</style>
