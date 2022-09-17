<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div class="search_bar">
    <i class="icon material-icons icon__search" v-on:click="back">search</i>
    <i
      class="icon material-icons icon__cancel"
      :class="{ show: value }"
      v-on:click="cancel"
      >cancel</i
    >
    <input
      class="search_input"
      type="text"
      v-bind:placeholder="_('searchBoxPlaceholder')"
      :value="value"
      @input="$emit('input', $event.target.value)"
      autofocus
    />
  </div>
</template>

<script>
import { mixin } from "./mixins.js";

export default {
  name: "SearchBar",
  props: {
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    cancel() {
      this.$emit("input", "");
    }
  },
  mixins: [mixin]
};
</script>

<style scoped>
.search_bar {
  display: block;
  padding: 0;
}
.search_bar .icon__search {
  font-size: 18px;
  padding: 7px;
  float: left;
  position: absolute;
}
.search_bar .icon__cancel {
  font-size: 16px;
  padding: 8px;
  float: right;
  position: absolute;
  right: 0;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.search_bar .icon__cancel.show {
  opacity: 0.5;
}
.search_bar .icon__cancel.show:hover {
  opacity: 0.8;
}
.search_bar .search_input {
  width: 100%;
  padding: 0 4px 0 32px;
  height: 32px;
  border: 0;
  border-bottom: 1px solid #e3e3e3;
  outline: none !important;
  background: #f4f4f4;
}
</style>
