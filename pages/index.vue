<template>
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
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"></button>
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
      xTeams: [],
      yTeams: []
    }
  },
  mounted () {
    axios.get('https://statsapi.web.nhl.com/api/v1/teams')
      .then(response => {
        this.teams = response.data.teams
        // get 6 random teams from the list
        this.randomTeams = response.data.teams.sort(() => 0.5 - Math.random()).slice(0, 6)
        this.xTeams = this.randomTeams.slice(0, 3);
        this.yTeams = this.randomTeams.slice(3, 6);
      })
      .catch(error => {
        console.log(error)
      })
  }
}
</script>
