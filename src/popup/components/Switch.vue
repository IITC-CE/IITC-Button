<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <span class="switch" :class="{ on: checked, disabled: disabled }">
    <span class="switch__knob"></span>
  </span>
</template>

<script lang="ts">
export default defineComponent({
  name: "Switch",
  props: {
    checked: Boolean,
    disabled: Boolean,
  },
});
</script>

<style scoped>
.switch {
  display: inline-block;
  position: relative;
  width: 32px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--switch-off, var(--state-disabled));
  transition: background 0.15s ease;
}
.switch.on {
  background: var(--switch-on, var(--accent));
}
.switch.disabled {
  opacity: 0.55;
}
.switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}
.switch.on .switch__knob {
  transform: translateX(14px);
}
</style>
