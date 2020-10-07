<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div
    class="element item-wrapper list__item"
    v-bind:class="item_class"
    v-bind:title="description"
    v-on:click="item_onclick"
  >
    <i
      class="element__action material-icons"
      v-bind:class="{ icon_right: this.icon_position_is_right }"
      v-html="icon_name"
    ></i>
    <span class="element__text">{{ text }}</span>
    <span class="element__counter" v-html="counter"></span>
  </div>
</template>

<script>
export default {
  name: "Element",
  props: {
    item_class: String,
    text: String,
    description: String,
    counter: String,
    icon_name: String,
    icon_position_is_right: Boolean
  },
  methods: {
    item_onclick() {
      this.$emit("item_onclick");
    }
  }
};
</script>

<style scoped>
.element {
  display: flex;
  cursor: pointer;
  padding: 4px 10px 4px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--color-white);
}
.element:hover,
.element:active,
.element:focus {
  background: var(--color-silver);
}
.element__text {
  flex: auto;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.element__counter {
  line-height: 24px;
  font-weight: 300;
}
.element__action {
  padding: 2px;
  margin-right: 8px;
}
.icon_right {
  order: 1;
  margin-right: 0;
  margin-left: 8px;
}
</style>
