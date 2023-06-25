<template>
  <div class="container">
    <div class="grid grid-cols-4 gap-4 text-center">
      <div class="flex justify-center items-center flex-col border p-10"></div>
      <div class="flex justify-center items-center flex-col border p-10" v-for="team in randomTeams" :key="team.id">
        <img class="w-28" :src="`https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${team.id}.svg`" :alt="team.name" />
        {{ team.name }}
      </div>
    </div>

    
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      teams: [],
      randomTeams: []
    }
  },
  mounted () {
    axios.get('https://statsapi.web.nhl.com/api/v1/teams')
      .then(response => {
        this.teams = response.data.teams
        // get 6 random teams from the list
        this.randomTeams = response.data.teams.sort(() => 0.5 - Math.random()).slice(0, 6)
      })
      .catch(error => {
        console.log(error)
      })
  }
}
</script>
