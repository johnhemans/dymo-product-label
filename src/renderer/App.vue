<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'printer-app',
    mounted () {
      this.createDymoScript()
    },
    methods: {
      createDymoScript () {
        const dymoScript = document.createElement('script')
        dymoScript.setAttribute('src', 'http://labelwriter.com/software/dls/sdk/js/DYMO.Label.Framework.latest.js')
        document.head.appendChild(dymoScript)
      }
    }
  }
</script>

<style lang="scss">
  @import './assets/styles/main.scss';
</style>