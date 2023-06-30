<template>
  <div>
    <div class="pt-12 sm:pt-24">
      <!-- X teams -->
      <div class="grid grid-cols-4 text-center">
        <div></div>
        <div class="flex justify-center items-center flex-col p-5" v-for="team in xTeams" :key="team.id">
          <img class="w-28" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
        </div>
      </div>
      <!-- /end X Teams -->
      <div class="grid grid-cols-4 text-center">
        <!-- Y teams -->
        <div class="grid col-span-1">
          <div class="flex justify-center items-center flex-col p-5" v-for="team in yTeams" :key="team.id">
            <img class="w-28" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
          </div>
        </div>
        <!-- /end Y Teams -->
        <div class="grid col-span-3 grid-cols-3 rounded-xl border-2 border-white overflow-hidden">
          <button
            v-for="(answer, index) in answers" :key="index"
            @click="openSearchModal(index)"
            class="border bg-sky-300 hover:bg-sky-200 text-white font-bold py-2 px-4"
          >
            <span v-if="answer">{{ answer.firstName }} {{ answer.lastName }}</span>
          </button>
        </div>
      </div>
    </div>

    <NModal v-model:show="showModal">
      <NCard
        style="width: 600px"
        title="Search for Players"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between mb-3">
          <n-input v-model:value="searchQuery" placeholder="Search players" class="mr-3"></n-input>
          <n-button @click="submitSearch">Search</n-button>
        </div>

        <ul id="results">
          <li v-for="player in searchPlayersResults" :key="player.id" class="flex items-center justify-between pb-1">
            <div class="">
              <span>{{ player.firstName }} {{ player.lastName }}</span>
            </div>
            <NButton @click="getPlayersStats(player)">Select</NButton>
          </li>
        </ul>

      </NCard>
    </NModal>
  </div>
</template>

<script>
import axios from 'axios'
import { NButton, NModal, NCard, NInput } from 'naive-ui'

export default {
  components: {
    NButton,
    NModal,
    NCard,
    NInput
  },
  data () {
    return {
      showModal: false,
      searchQuery: '',
      teams: [],
      xTeams: [],
      yTeams: [],
      searchPlayersResults: [],
      currentPlayer: {},
      buttonLocation: null,
      answers: {}
    }
  },
  mounted () {
    axios.get('https://statsapi.web.nhl.com/api/v1/teams')
      .then(response => {
        this.teams = response.data.teams
        // get 6 random teams from the list
        this.randomTeams = response.data.teams.sort(() => 0.5 - Math.random()).slice(0, 6)
        this.xTeams = this.randomTeams.slice(0, 3)
        this.yTeams = this.randomTeams.slice(3, 6)
      })
      .catch(error => {
        console.log(error)
      })

    this.answers = {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
      7: {},
      8: {}
    }
  },
  computed: {
  },
  methods: {
    submitSearch () {
      // Call the getPlayers function with the search query
      this.getPlayers(this.searchQuery)
    },
    // get player id
    getPlayers (playerQuery) {
      // reset searchPlayersResults
      this.searchPlayersResults = []

      const apiUrl = `https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/${playerQuery}`

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const playerSuggestions = data.suggestions
          playerSuggestions.forEach((player) => {
            const playerArray = player.split('|')
            const playerObject = {
              id: playerArray[0],
              lastName: playerArray[1],
              firstName: playerArray[2],
              active: playerArray[3],
              rookie: playerArray[4],
              height: playerArray[5],
              weight: playerArray[6],
              birthCity: playerArray[7],
              birthState: playerArray[8],
              birthCountry: playerArray[9],
              birthDate: playerArray[10],
              team: playerArray[11],
              position: playerArray[12],
              jerseyNumber: playerArray[13],
              link: playerArray[14]
            }
            console.log('🚀 ~ file: index.vue:109 ~ playerSuggestions.forEach ~ playerObject:', playerObject)
            this.searchPlayersResults.push(playerObject)
          })
        })
        .catch(error => console.error(error))
    },
    // get players stats
    getPlayersStats (player) {
      const apiUrl = `https://statsapi.web.nhl.com/api/v1/people/${player.id}/stats?stats=yearByYear`
      this.currentPlayer = player
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const statsData = data.stats[0]
          console.log('🚀 ~ file: index.vue:160 ~ getPlayersStats ~ statsData:', statsData)
          const statsObject = {}
          statsObject.nhlTeams = this.getPlayersTeams(statsData)
          statsObject.careerStats = this.getPlayersCareerStats(statsData)
          return statsObject
        })
        .then((statsObject) => {
          Object.assign(this.currentPlayer, statsObject)
        })
        .catch(error => {
          console.log(error)
        })
    },
    getPlayersTeams (stats) {
      const playerTeams = []
      stats.splits.forEach((season) => {
        if (season.league.name === 'National Hockey League') {
          playerTeams.push(season.team.name)
        }
      })
      return playerTeams
    },
    getPlayersCareerStats (stats) {
      const careerStats = {
        games: 0,
        goals: 0,
        assists: 0,
        points: 0,
        powerPlayPoints: 0,
        shots: 0
      }
      stats.splits.forEach((season) => {
        if (season.league.name === 'National Hockey League') {
          careerStats.games += season.stat.games
          careerStats.goals += season.stat.goals
          careerStats.assists += season.stat.assists
          careerStats.points += season.stat.points
          careerStats.powerPlayPoints += season.stat.powerPlayPoints
          careerStats.shots += season.stat.shots
        }
      })
      console.log('🚀 ~ file: index.vue:196 ~ getPlayersCareerStats ~ careerStats:', careerStats)
      return careerStats
    },
    openSearchModal (buttonPosition) {
      this.buttonLocation = buttonPosition
      this.showModal = true
    },
    addPlayerToSquare (player, square) {
      this.answers[square] = player
      this.resetModal()
    },
    resetModal () {
      // this.currentPlayer = {}
      this.showModal = false
      this.searchPlayersResults = []
      this.searchQuery = ''
    }
  }
}
</script>