<template>
  <div>
    <div class="container">
      <!-- X teams -->
      <div class="grid grid-cols-4 gap-4 text-center">
        <div></div>
        <div class="flex justify-center items-center flex-col border p-10" v-for="team in xTeams" :key="team.id">
          <img class="w-28" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
          {{ team.name }}
        </div>
      </div>
      <!-- /end X Teams -->
      <div class="grid grid-cols-4 gap-4 text-center">
        <!-- Y teams -->
        <div class="grid col-span-1 gap-4">
          <div class="flex justify-center items-center flex-col border p-10" v-for="team in yTeams" :key="team.id">
            <img class="w-28" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
            {{ team.name }}
          </div>
        </div>
        <!-- /end Y Teams -->
        <div class="grid col-span-3 grid-cols-3 gap-4">
          <button id="search-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="showModal = true"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
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
        <div class="flex">
          <n-input v-model:value="searchQuery" placeholder="Search players"></n-input>
          <n-button @click="submitSearch">Search</n-button>
        </div>

        <ul id="results">
          <li v-for="player in searchPlayersResults" :key="player.id" class="flex justify-between">
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
  },
  methods: {
    submitSearch() {
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
    }
  }
}
</script>