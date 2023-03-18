<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-select label="Number of Players" v-model="numPlayers" :items="playerChoices" />
          <v-select label="Packs per Player" v-model="packsPerPlayer" :items="packsChoices" />
          <v-checkbox v-model="uniqueColors" label="Do not allow a player to have multiple mono-colored packs with the same color" />
          <v-checkbox v-model="uniqueTypes" label="Do not allow a player to have multiple packs with the same type" />
          <v-btn color="primary" @click="randomize">Randomize Packs</v-btn>
        </v-col>
      </v-row>
      <v-row v-if="error" class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-alert color="error">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>
      <v-row v-if="distribution" class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-card class="player-packs" v-for="(packs, player) in distribution">
            <v-card-title>Player {{ player + 1 }}</v-card-title>
            <v-list lines="one">
              <v-list-item v-for="pack in packs" :key="pack.number" :title="pack.number+'. '+pack.title" />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
  import shuffle from '@/shuffle';
  import { isProxy, toRaw } from 'vue';

  export default {
    created() {
      fetch('packs.json')
      .then(resp => resp.json())
      .then(data => this.data = data);
    },
    data: () => ({
      numPlayers: 2,
      packsPerPlayer: 4,
      maxAttempts: 100,
      uniqueColors: true,
      uniqueTypes: true,
      playerChoices: [2,3,4,5,6,7,8],
      packsChoices: [2,3,4,5,6],
      data: [],
      distribution: null,
      error: null
    }),
    methods: {
      randomize() {
        for (let i=0; i < this.maxAttempts; i++) {
          this.shuffle();
          if (!this.error) {
            return;
          }
        }
      },
      shuffle() {
        this.error = null;
        this.distribution = null;
        if (this.data) {
          const rawData = isProxy(this.data) ? toRaw(this.data) : this.data;
          const shuffled = shuffle(rawData);
          const result = [];
          for (let player=0; player < this.numPlayers; player++) {
            const playerPacks = [];
            const colors = new Set();
            const types = new Set();
            for (let i=0; i < this.packsPerPlayer; i++) {
              let draftedPackIndex = null;
              for (let j=0; j < shuffled.length; j++) {
                const pack = shuffled[j];
                const colorOkay = !this.uniqueColors || pack.colors.length != 1 || !colors.has(pack.colors[0]);
                const typeOkay = !this.uniqueTypes || !types.has(pack.front);
                if (colorOkay && typeOkay) {
                  draftedPackIndex = j;
                  break;
                }
              }
              if (draftedPackIndex != null) {
                const draftedPack = shuffled[draftedPackIndex];
                shuffled.splice(draftedPackIndex, 1);
                if (draftedPack.colors.length == 1) {
                  colors.add(draftedPack.colors[0]);
                }
                types.add(draftedPack.front);
                playerPacks.push(draftedPack);
              }
              else {
                this.error = 'Draft failed. Changes the settings and/or try again.';
                return;
              }
              console.log(shuffled);
            }
            result.push(playerPacks);
          }
          this.distribution = result;
        }
      }
    },
    watch: {
      data() {
        console.log([...this.data]);
      }
    }
  }
</script>

<style scoped>
div.player-packs.v-card {
  margin-bottom: 2em;
}
.player-packs {
  text-align: left;
}

div.player-packs {
  padding: 0 2em 0 2em;
}
</style>