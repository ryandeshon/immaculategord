<template>
  <div v-if="loaded">
    <div class="">
      <!-- X teams -->
      <div class="grid grid-cols-4 md:grid-cols-5 auto-rows-fr text-center">
        <div class="col-span-1"></div>
        <div class="flex justify-center items-center flex-col p-5" v-for="team in xTeams" :key="team.id">
          <img class="w-full" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
        </div>
      </div>
      <!-- /end X Teams -->
      <div class="grid grid-cols-4 md:grid-cols-5 auto-rows-fr text-center">
        <!-- Y teams -->
        <div class="grid col-span-1 auto-rows-fr">
          <div class="flex justify-center items-center flex-col p-5" v-for="team in yTeams" :key="team.id">
            <img class="w-full" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
          </div>
        </div>
        <!-- /end Y Teams -->
        <div class="grid col-span-3 grid-cols-3 auto-rows-fr rounded-xl border-2 border-white overflow-hidden">
          <button
            v-for="(answer, index) in answers" :key="index"
            :id="`square-${index}`"
            @click="openSearchModal(index)"
            class="border bg-sky-300 hover:bg-sky-200 md:px-4 md:py-2"
          >
            <div v-if="answer.id">
              <img class="md:rounded-lg" :src="`https://cms.nhl.bamgrid.com/images/headshots/current/168x168/${answer.id}.jpg`" :alt="answer.name" />
              <span class="text-white font-bold text-xs md:text-sm">{{ answer.firstName }} {{ answer.lastName }}</span>
            </div>
          </button>
        </div>
        <div class="col-span-5 md:col-span-1 flex justify-center">
          <div class="flex flex-col justify-center items-center">
            <span class="text-6xl font-bold">{{ guesses }}</span>
            <span class="text-sm">Guesses</span>
          </div>
        </div>
      </div>
    </div>

    <NModal v-model:show="showModal">
      <NCard
        style="width: 600px;"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        on-after-leave="resetModal"
      >
        <div class="flex items-center justify-between mb-3">
          <NInputGroup>
            <NInput v-model:value="searchQuery" placeholder="Search players" @keyup.enter="submitSearch"></NInput>
            <NButton ref="searchButton" @click="submitSearch">Search</NButton>
          </NInputGroup>
        </div>

        <ul
          v-if="searchPlayersResults.length > 0"
          id="results"
        >
          <li
            v-for="player in searchPlayersResults"
            :key="player.id"
            class="flex items-center justify-between pb-1"
          >
            <div class="">
              <span>{{ player.firstName }} {{ player.lastName }}</span>
            </div>
            <NButton
              :key="index"
              v-if="checkIfPlayerIsAlreadySelected(player)"
              @click="getPlayer(player)"
            >
              Select
            </NButton>
          </li>
        </ul>
        <h3 v-else-if="noResults">No results found</h3>

      </NCard>
    </NModal>
  </div>
</template>

<script>
import { NButton, NModal, NCard, NInput, NInputGroup } from 'naive-ui'

export default {
  components: {
    NButton,
    NModal,
    NCard,
    NInput,
    NInputGroup
  },
  data () {
    return {
      loaded: false,
      showModal: false,
      noResults: false,
      searchQuery: '',
      teams: [],
      xTeams: [],
      yTeams: [],
      gridLocations: {
        0: '0,0',
        1: '1,0',
        2: '2,0',
        3: '0,1',
        4: '1,1',
        5: '2,1',
        6: '0,2',
        7: '1,2',
        8: '2,2'
      },
      searchPlayersResults: [],
      currentPlayer: {},
      buttonLocation: null,
      answers: {
        0: {},
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        6: {},
        7: {},
        8: {}
      },
      guesses: null
    }
  },
  mounted () {
    // get teams from local storage if they exist
    if (localStorage.getItem('xTeams') && localStorage.getItem('yTeams')) {
      this.xTeams = JSON.parse(localStorage.getItem('xTeams'))
      this.yTeams = JSON.parse(localStorage.getItem('yTeams'))
    } else {
      this.getRandomTeams()
    }
    // get guesses from local storage if they exist
    if (localStorage.getItem('guesses')) {
      this.guesses = JSON.parse(localStorage.getItem('guesses'))
    } else {
      this.guesses = 9
      localStorage.setItem('guesses', 9)
    }
    // get answers from local storage if they exist
    if (localStorage.getItem('answers')) {
      this.answers = JSON.parse(localStorage.getItem('answers'))
    }
    this.loaded = true
  },
  computed: {
  },
  methods: {
    getRandomTeams () {
      $fetch('https://statsapi.web.nhl.com/api/v1/teams')
        .then(response => {
          this.teams = response.data.teams
          // get 6 random teams from the list
          this.randomTeams = response.data.teams.sort(() => 0.5 - Math.random()).slice(0, 6)
          this.xTeams = this.randomTeams.slice(0, 3)
          this.yTeams = this.randomTeams.slice(3, 6)
          localStorage.setItem('xTeams', JSON.stringify(this.xTeams))
          localStorage.setItem('yTeams', JSON.stringify(this.yTeams))
        })
        .catch(error => {
          console.log(error)
        })
    },
    submitSearch () {
      // Call the getPlayers function with the search query
      this.getPlayers(this.searchQuery)
    },
    // get player id
    getPlayers (playerQuery) {
      console.log('🚀 ~ file: index.vue:177 ~ getPlayers ~ playerQuery:', playerQuery)
      // reset searchPlayersResults
      this.searchPlayersResults = []

      $fetch(`https://suggest.svc.nhl.com/svc/suggest/v1/minplayers/${playerQuery}`)
        .then(response => {
          console.log('🚀 ~ file: index.vue:185 ~ getPlayers ~ response:', response)
          return response
        })
        .then(data => {
          const playerSuggestions = data.suggestions
          if (playerSuggestions.length === 0) {
            this.noResults = true
          } else {
            this.noResults = false
          }
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
    getPlayer (player) {
      // get player stats
      this.getPlayersStats(player)
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
        .then(() => {
          this.checkSquareAnswer()
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
      const uniqueTeams = [...new Set(playerTeams)]
      return uniqueTeams
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
    checkIfPlayerIsAlreadySelected (player) {
      console.log('🚀 ~ file: index.vue:261 ~ checkIfPlayerIsAlreadySelected')
      // check to see if player is already one of the answers
      const playerIsAnswer = Object.values(this.answers).some((answer) => {
        return answer.id === player.id
      })
      return !playerIsAnswer
    },
    checkSquareAnswer () {
      const getSquare = this.gridLocations[this.buttonLocation]
      const getXTeam = this.xTeams[getSquare.split(',')[0]].name
      const getYTeam = this.yTeams[getSquare.split(',')[1]].name
      if (this.isPlayerOnTeam([getXTeam, getYTeam])) {
        // add answers to local storage
        this.addPlayerToSquare(this.currentPlayer, this.buttonLocation)
        localStorage.setItem('answers', JSON.stringify(this.answers))
      } else {
        this.resetPlayer()
        alert('Player is not on the selected teams')
      }
      this.guesses--
      localStorage.setItem('guesses', this.guesses)
    },
    isPlayerOnTeam (teams) {
      console.log('🚀 ~ file: index.vue:274 ~ isPlayerOnTeam ~ teams:', teams)
      const playerTeams = this.currentPlayer.nhlTeams
      console.log('🚀 ~ file: index.vue:239 ~ isPlayerOnTeam ~ playerTeams:', playerTeams)
      const isPlayerOnTeam = teams.every(team => playerTeams.includes(team))
      console.log('🚀 ~ file: index.vue:240 ~ isPlayerOnTeam ~ isPlayerOnTeam:', isPlayerOnTeam)
      return isPlayerOnTeam
    },
    addPlayerToSquare (player, square) {
      this.answers[square] = player
      this.resetModal()
    },
    openSearchModal (buttonPosition) {
      this.buttonLocation = buttonPosition
      this.showModal = true
    },
    resetPlayer () {
      this.currentPlayer = {}
    },
    resetModal () {
      console.log('close modal')
      this.currentPlayer = {}
      this.showModal = false
      this.searchPlayersResults = []
      this.searchQuery = ''
      this.noResults = false
    }
  }
}
</script>