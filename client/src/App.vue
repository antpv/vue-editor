<template>
  <div id="app">
    <div class="controls">
      <button @click="hideEditors = !hideEditors">
        {{ hideEditors ? 'Show editors' : 'Hide editors' }}
      </button>
      <span>
        {{ fetching ? 'Fetching data' : updating ? 'Updating data' : 'Synchronized' }}
      </span>
    </div>
    <div class="editors" v-if="!hideEditors">
      <textarea v-model="templateTextarea" />
      <textarea v-model="componentTextarea" />
      <textarea v-model="cssTextarea" />
    </div>
    <div id="playground">
      <div id="playground-app" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

let debounceCbId = null
const debounce = cb => {
  clearTimeout(debounceCbId)
  debounceCbId = setTimeout(cb, 250)
}

export default {
  name: 'App',
  data() {
    return {
      hideEditors: false,
      templateTextarea: '',
      componentTextarea: '',
      cssTextarea: '',
      fetching: true,
      updating: false
    }
  },
  created() {
    window.Vue = Vue
    window.playgroundApp = null
  },
  watch: {
    templateTextarea: 'handleChange',
    componentTextarea: 'handleChange',
    cssTextarea: 'handleChange',
  },
  mounted() {
    this.fetching = true

    fetch('http://localhost:8081')
      .then(response => response.json())
      .then(json => {
        const { templateTextarea, componentTextarea, cssTextarea } = json

        this.templateTextarea = templateTextarea
        this.componentTextarea = componentTextarea
        this.cssTextarea = cssTextarea

        this.fetching = false
        this.renderPlayground()
      })
  },
  methods: {
    handleChange() {
      debounce(() => {
        this.renderPlayground()

        this.updating = true

        fetch('http://localhost:8081', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateTextarea: this.templateTextarea,
            componentTextarea: this.componentTextarea,
            cssTextarea: this.cssTextarea
          }) })
          .then(() => {
            this.updating = false
          })
      })
    },
    renderPlayground() {
      if (window.playgroundApp) {
        window.playgroundApp.$destroy()

        const oldScript = document.getElementById('playground-script')
        const oldCss = document.getElementById('playground-css')
        const oldWrapper = document.getElementById('playground').firstChild

        oldScript.remove()
        oldCss.remove()
        oldWrapper.remove()

        const newPlaygroundWrapper = document.createElement('div')
        newPlaygroundWrapper.id = 'playground-app'

        document.getElementById('playground').appendChild(newPlaygroundWrapper)
      }

      const playgroundVueScript = `window.playgroundApp = new Vue(
        Object.assign(
          {
            template: '${this.templateTextarea.replace(/(\r\n|\n|\r)/gm, '')}',
            el: '#playground-app'
          },
          ${this.componentTextarea}
          )
        )`

        const playgroundScriptElement = document.createElement('script')

        playgroundScriptElement.type = 'text/javascript'
        playgroundScriptElement.id = 'playground-script'
        playgroundScriptElement.innerHTML = playgroundVueScript

        const playgroundCssElement = document.createElement('style')

        playgroundCssElement.type = 'text/css'
        playgroundCssElement.id = 'playground-css'
        playgroundCssElement.innerHTML = `@scope (#playground) {${this.cssTextarea}}`

        document.body.appendChild(playgroundScriptElement);
        document.head.appendChild(playgroundCssElement);
    }
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital@0;1&display=swap');

body {
  margin: 0;
}
#app {
  color: #2c3e50;
  padding: 10px;
}

.controls {
  display: flex;
  justify-content: space-between;
}

.editors {
  margin-top: 10px;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr;
}

#playground {
  margin-top: 10px;
}

textarea {
  height: 220px;
  border: 1px solid #d0d0d0;
  padding: 5px;
  border-radius: 5px;
  resize: none;
  font-family: "Roboto Mono", monospace;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
</style>
