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
        <div class="grid col-span-3 grid-cols-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-950 overflow-hidden">
          <button 
            v-for="(answer, index) in answers" :key="index" 
            @click="openSearchModal(index)"
            class="border-b border-r bg-sky-300 hover:bg-sky-200 text-white font-bold py-2 px-4"
          >
            {{ index }}
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
            <NButton @click="getPlayersStats(player.id)">Select</NButton>
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
        0: '',
        1: '',
        2: '',
        3: '',
        4: '',
        5: '',
        6: '',
        7: '',
        8: ''
      }
    
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
    getPlayersStats (playerId) {
      const apiUrl = `https://statsapi.web.nhl.com/api/v1/people/${playerId}/stats?stats=yearByYear`

      fetch(apiUrl)
        .then(response => {
          console.log('🚀 ~ file: index.vue:126 ~ getPlayersStats ~ response:', response)
          this.currentPlayer = response.data
        })
        .catch(error => {
          console.log(error)
        })
    },
    openSearchModal(buttonPosition) {
      // Code to open search modal
      console.log(`Opening search modal for button at position ${buttonPosition}`)
      this.showModal = true
    },
    addPlayerToSquare(player, square) {
      // Code to add player to square
      console.log(`Adding player ${player} to square ${square}`)
    },
  }
}
</script>