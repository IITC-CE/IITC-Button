<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="header-wrapper">
    <div id="header" class="col">
      <div class="tabs">
        <div
          id="add"
          class="btn"
          :class="{ active: tab === 'add' }"
          @click="$emit('setTab', 'add')"
        >
          {{ _("addExternalPlugin") }}
        </div>
        <div
          id="backup"
          class="btn"
          :class="{ active: tab === 'backup' }"
          @click="$emit('setTab', 'backup')"
        >
          {{ _("backup") }}
        </div>
        <div
          id="debug"
          class="btn"
          :class="{ active: tab === 'debug' }"
          @click="$emit('setTab', 'debug')"
        >
          {{ _("debug") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { _ } from "@/i18n";

export default {
  name: "Header",
  props: {
    tab: String
  },
  methods: {
    _: _
  }
};
</script>

<style src="../../public/assets/roboto/roboto-font.css"></style>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0;
}

.header-wrapper {
  display: flex;
  background: #0e3d4e;
  color: #fff;
  border-right: 3px solid #316577;
  width: 500px;
}

#header {
  padding: 1.6em;
  width: 100%;
  font-size: 18px;
  transition: opacity 0.1s linear;
}

.btn {
  cursor: pointer;
  padding: 10px 22px;
  background: #aaa;
  color: #222;
  border-radius: 3px;
  display: inline-block;
  margin: 20px auto 0 0;
  width: 100%;
  box-sizing: border-box;
  height: 42px;
}

.btn.active {
  background: #fff;
}

.btn:hover {
  background: #efefef;
}

@media (max-width: 1600px) {
  .header-wrapper {
    width: 100%;
    border-bottom: 3px solid #316577;
    border-right: none;
  }
  #header {
    margin: auto;
    width: 80%;
    max-width: 800px;
    padding: 1.8em;
  }
}

@media (max-width: 600px) {
  #header {
    width: 100%;
    padding: 1em;
  }
}
</style>
