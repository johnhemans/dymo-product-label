<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'printer-app',
    mounted () {
      this.injectDymoScript()
    },
    methods: {
      injectDymoScript () {
        const dymoScript = document.createElement('script')
        dymoScript.setAttribute('src', 'http://labelwriter.com/software/dls/sdk/js/dymo.connect.framework.js')
        document.head.appendChild(dymoScript)
      }
    }
  }
</script>

<style lang="scss">
  @import './assets/styles/main.scss';
</style>