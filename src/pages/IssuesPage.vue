<template>
  <q-page class="main">
    <div class="main-element">
      <h1>Feedback & Issues</h1>
      <p v-if="!userId">Anmelden, um Details zu sehen</p>
    </div>

    <div class="button-group">
      <q-btn flat no-caps @click="setSort(0)" :class="{ active: filterStatus === 0 }">
        <div class="button-group-label">Offen:</div>
        <q-icon name="block" class="button-group-btn-icon" />
        {{ computedIssuesWithoutFilter.filter((val) => val.status === 0).length }}
      </q-btn>
      <q-btn flat no-caps @click="setSort(1)" :class="{ active: filterStatus === 1 }">
        <div class="button-group-label">In Bearbeitung:</div>
        <q-icon name="edit" class="button-group-btn-icon" />
        {{ computedIssuesWithoutFilter.filter((val) => val.status === 1).length }}
      </q-btn>
      <q-btn flat no-caps @click="setSort(2)" :class="{ active: filterStatus === 2 }">
        <div class="button-group-label">Erledigt:</div>
        <q-icon name="done_all" class="button-group-btn-icon" />
        {{ computedIssuesWithoutFilter.filter((val) => val.status === 2).length }}
      </q-btn>
      <q-space />
      <q-btn flat no-caps class="create-new" @click="createIssueModel.show = true" v-if="userId">
        <div class="button-group-label">Issue erstellen</div>
        <q-icon name="add" />
      </q-btn>
    </div>

    <div class="element" v-for="issue in computedIssues" :key="issue.id" :id="'issue-' + issue.id">
      <div
        class="status-indicator"
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
        <q-btn
          flat
          icon="arrow_drop_up"
          dense
          size="lg"
          @click="addUpvote(issue)"
          class="positive"
          :class="{ active: issue.hasUpvoted }"
        />
        <span class="text-bold">{{ (issue.upvoteCount || 0) - (issue.downvoteCount || 0) }}</span>
        <q-btn
          flat
          icon="arrow_drop_down"
          dense
          size="lg"
          @click="addDownvote(issue)"
          class="negative"
          :class="{ active: issue.hasDownvoted }"
        />
      </div>
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
        <span class="time" v-if="userId">
          <q-icon name="add_comment" />
          {{
            new Date(issue.createdAt).toLocaleDateString('de-De', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          }}</span
        >
        <span class="time" v-if="userId">
          <q-icon name="update" />
          {{
            new Date(issue.updatedAt).toLocaleDateString('de-De', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          }}</span
        >
        <span class="user"> @{{ issue.user?.email || issue['user.email'] || 'unknown' }} </span>
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
      <p class="description">
        Beschreibung <br />
        <span
          v-for="p in issue.description
            .trim()
            .replace(/\n{2,}/g, '\n')
            .replace(/ {2,}/g, ' ')
            .split('\n')"
          :key="p"
          >{{ p }} <br
        /></span>
      </p>

      <div class="comments">
        <q-btn
          icon="add_circle"
          @click="
            () => {
              createCommentModel.show = true
              createCommentModel.issue = issue
            }
          "
          label="Kommentar hinzufügen"
          no-caps
          rounded
          style="background-color: #fff2"
        />
        <div class="comment" v-for="comment in issue.comments" :key="comment.id">
          <div class="header">
            <span class="profile-icon">{{ comment.username.at(0) }}</span>
            <span class="username">@{{ comment.username || 'unknown' }}</span>

            <span class="dev-indicator" v-if="comment.byAdmin === true"><span>DEV</span></span>
            <span class="dev-indicator tester" v-if="comment.byTester === true"
              ><span>TESTER</span></span
            >
            <span class="date">
              {{
                new Date(comment.createdAt).toLocaleDateString('de-De', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }}
            </span>

            <q-space />

            <q-btn
              @click="deleteComment(comment)"
              icon="delete"
              flat
              dense
              size="sm"
              class="delete"
              v-if="comment.userId === userId || isAdmin"
            />
          </div>
          <p>
            <span
              v-for="p in comment.text
                .trim()
                .replace(/\n{2,}/g, '\n')
                .replace(/ {2,}/g, ' ')
                .split('\n')"
              :key="p"
              >{{ p }} <br
            /></span>
          </p>
        </div>
      </div>

      <div class="admin-btns" v-if="userId">
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
        <q-btn no-caps flat v-if="isAdmin" @click="changeStatus(issue.id, 0, issue)">
          <div class="button-group-label">Offen</div>
          <q-icon name="block" class="button-group-btn-icon" />
        </q-btn>
        <q-btn no-caps flat v-if="isAdmin" @click="changeStatus(issue.id, 1, issue)">
          <div class="button-group-label">Bearbeiten</div>
          <q-icon name="edit" class="button-group-btn-icon" />
        </q-btn>
        <q-btn no-caps flat v-if="isAdmin" @click="changeStatus(issue.id, 2, issue)">
          <div class="button-group-label">Erledigt</div>
          <q-icon name="done_all" class="button-group-btn-icon" />
        </q-btn>
      </div>
    </div>

    <q-dialog
      v-model="createIssueModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="createIssueModel.data = { notify: false }"
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
            emit-value
            map-options
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
            emit-value
            map-options
          />

          <q-checkbox
            label="Entwickler alarmieren"
            v-model="createIssueModel.data.notify"
            v-if="createIssueModel.data.priority === '2'"
            color="green"
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
      v-model="createCommentModel.show"
      backdrop-filter="blur(10px)"
      @before-hide="createCommentModel.data = {}"
      full-width
    >
      <div
        class="recommendation-popup"
        :style="'--gradient-start: ' + '#3e73b8' + ';--gradient-end:' + '#7cde89'"
      >
        <div class="title">
          <h1>Issue kommentieren</h1>
          <q-btn v-close-popup icon="close" dense flat class="close-button" size="sm" />
        </div>
        <div class="content">
          <q-input
            color="white"
            dark
            filled
            type="textarea"
            label="Text"
            v-model="createCommentModel.data.text"
          />

          <q-btn
            label="Hochladen
            "
            flat
            class="confirm-button"
            @click="comment()"
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

const computedIssues = computed(() =>
  issueStore.issues.filter((val) => val.status === filterStatus.value),
)

const computedIssuesWithoutFilter = computed(() => issueStore.issues)

const createIssueModel = ref({ show: false, data: { notify: false } })
const editIssueModel = ref({ show: false, data: {} })
const createCommentModel = ref({ show: false, issue: {}, data: {} })

const isAdmin = computed(() => userStore.isAdmin)
const userId = computed(() => userStore.userId)

const filterStatus = ref(0)

onMounted(async () => {
  await issueStore.loadIssues()

  if (document.getElementById('loading-progress').style.height === '60%') {
    document.getElementById('loading-progress').style.height = '75%'
    setTimeout(() => (document.getElementById('loading-screen').style.opacity = '0'), 300)
  } else {
    document.getElementById('loading-progress').style.height = '60%'
  }
})

async function createIssue() {
  let data
  try {
    data = createIssueModel.value.data

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

function setSort(status) {
  filterStatus.value = status
}

async function addUpvote(issue) {
  await issueStore.upvote(issue.id)
  setTimeout(() => {
    var element = document.getElementById('issue-' + issue.id)
    var headerOffset = 100
    var elementPosition = element.getBoundingClientRect().top
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }, 300)
}
async function addDownvote(issue) {
  await issueStore.downvote(issue.id)
  setTimeout(() => {
    var element = document.getElementById('issue-' + issue.id)
    var headerOffset = 100
    var elementPosition = element.getBoundingClientRect().top
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }, 300)
}

async function comment() {
  await issueStore.addComment(createCommentModel.value.data.text, createCommentModel.value.issue.id)
  createCommentModel.value.show = false
}

async function deleteComment(comment) {
  await issueStore.deleteComment(comment.id)
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

.button-group {
  width: 100%;
  display: flex;
  gap: var(--std-pad);
  > button {
    width: fit-content;
    background-color: #ffffff20;
    border-radius: var(--std-pad);

    &.active {
      background: linear-gradient(10deg, #3e73b8aa 0%, #28b0a5aa 53%, #7cde89aa 100%);
    }
  }
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
    margin-left: calc(var(--std-pad) * 2);
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
    width: calc(var(--std-pad) * 2);
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: red;
    margin: 0;
    border-top-left-radius: var(--std-pad);
    border-bottom-left-radius: var(--std-pad);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--std-pad);

    font-size: 20px;

    button {
      color: #000;
    }

    button.active.positive {
      color: #84ff8e;
    }
    button.active.negative {
      color: #ff8484;
    }
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
    margin-left: calc(var(--std-pad) * 2);
    font-weight: 300;
    font-size: 30px;
    flex-direction: row;
    display: flex;
    gap: var(--std-pad);
    max-width: 100%;
    flex-wrap: wrap;

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

  .description {
    word-wrap: break-word;
  }

  .comments {
    display: flex;
    flex-direction: column;
    gap: var(--std-pad);

    > button {
      width: fit-content;
    }

    .delete {
      color: red;
      background-color: #f002;
    }

    .comment {
      display: flex;
      flex-direction: column;
      background-color: #fff1;
      border-radius: calc(var(--std-pad) / 2);
      padding: calc(var(--std-pad) / 2);
      gap: calc(var(--std-pad) / 2);

      > .header {
        display: flex;
        gap: 12px;
        align-items: center;

        .username {
          border-radius: 6px;
          padding: 3px 12px;
          font-weight: 400;
          background-color: #0003;
        }

        .date {
          color: #fffb;
        }

        .dev-indicator {
          border-radius: 6px;
          padding: 3px 12px;
          font-weight: 500;
          background-color: #0006;

          > span {
            background-image: linear-gradient(45deg, #3e73b8 0%, #28b0a5 53%, #7cde89 100%);
            color: transparent;
            background-clip: text;
            font-weight: 500;
            display: inline-block;
          }
        }

        .dev-indicator.tester {
          > span {
            background-image: linear-gradient(90deg, #f46600, #ff3932);
          }
        }
      }

      p {
        margin: 0;
      }
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

.button-group-btn-icon {
  display: none;
}

.profile-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1em;
  border-radius: 15px;
  font-size: 15px;
  font-weight: bold;
  color: white;
  background: linear-gradient(10deg, #3e73b8cc 0%, #28b0a5cc 53%, #7cde89cc 100%);
}

@media only screen and (max-width: 500px) {
  .button-group-label {
    display: none;
  }
  .button-group-btn-icon {
    display: block;
  }
}
</style>
