<template>
  <div class="header-wrapper">
    <div id="header" class="col">
      <div class="tabs">
        <div id="add" class="btn">{{ _("addExternalPlugin") }}</div>
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
  data() {
    return {
      show_header: false,
      button_name: _("install"),
      domains: null,
      show_details: false
    };
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
  background: #fff;
  color: #222;
  border-radius: 3px;
  display: inline-block;
  margin: 20px auto 0 0;
  width: 100%;
  box-sizing: border-box;
  height: 42px;
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
