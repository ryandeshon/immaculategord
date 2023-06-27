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
          <button id="search-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="openSearchModal"></button>
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
    <dialog id="modal">
      <form>
        <label for="search-input">Search:</label>
        <input type="text" id="search-input">
        <button type="submit">Submit</button>
      </form>
      <ul id="results">
        <li v-for="player in searchPlayersResults" :key="player.id">
          {{ player.firstName }} {{ player.lastName }}
        </li>
      </ul>
    </dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      teams: [],
      xTeams: [],
      yTeams: [],
      searchPlayersResults: [],
      currentPlayer: null,
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
    // get player id
    getPlayers (playerQuery) {
      // reset searchPlayersResults
      this.searchPlayersResults = [];

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
          this.players = response.data.roster
        })
        .catch(error => {
          console.log(error)
        })
    },
    // open modal
    openSearchModal () {
      // JavaScript
      const searchButton = document.getElementById('search-button')
      const modal = document.getElementById('modal')
      const searchInput = document.getElementById('search-input')

      searchButton.addEventListener('click', () => {
        modal.showModal()
      })

      modal.addEventListener('submit', async (event) => {
        event.preventDefault()
        const query = searchInput.value
        this.getPlayers(query)
      })

      // Hide modal when user clicks outside of it
      window.addEventListener('click', (event) => {
        if (event.target === modal) {
          modal.close()
        }
      })
    }
  }
}
</script>