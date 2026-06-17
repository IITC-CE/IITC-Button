<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <div>
    <input
      id="toggleIITC"
      type="checkbox"
      class="toggle"
      v-model="iitc_is_enabled_toggle"
    />
    <div class="toggle_button">
      <div class="toggle">
        <label for="toggleIITC" class="toggle"></label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import browser from "webextension-polyfill";

export default defineComponent({
  name: "ToggleIITC",
  data() {
    return {
      iitc_is_enabled: true,
    };
  },
  computed: {
    iitc_is_enabled_toggle: {
      get: function () {
        return this.iitc_is_enabled;
      },
      set: async function (newValue: boolean) {
        await browser.runtime.sendMessage({
          type: "toggleIITC",
          value: newValue,
        });
      },
    },
  },
  async mounted() {
    const data = await browser.storage.local.get("IITC_is_enabled");
    if (data.IITC_is_enabled === false) {
      this.iitc_is_enabled = false;
    }
  },
});
</script>

<style scoped>
.toggle_button {
  color: var(--color-white);
  border-left: 1px solid #333;
}
.toggle_button:hover {
  background: #333;
}
.toggle {
  height: 50px;
  width: 48px;
  font-size: 36px;
  padding: 6px 3px;
  line-height: 38px;
  box-sizing: border-box;
}

input[type="checkbox"].toggle {
  display: none;
}
label.toggle {
  cursor: inherit;
}
input[type="checkbox"].toggle + div label.toggle:before {
  font-family: "Material Icons";
  display: inline-block;
  content: "\e9f5";
} /* unchecked icon */
input[type="checkbox"].toggle + .toggle_button {
  background: var(--state-off);
  transition: background 0.1s ease-in-out;
}

input[type="checkbox"].toggle:checked + div label.toggle:before {
  content: "\e9f6";
} /* checked icon */
input[type="checkbox"].toggle:checked + .toggle_button {
  background: var(--state-on);
}
</style>
