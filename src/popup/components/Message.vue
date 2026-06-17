<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div id="message" class="message" v-bind:class="{ opened: message.opened }">
    {{ message.text }}
  </div>
</template>

<script lang="ts">
import { emitter } from "@/popup/eventBus";

let message_timeout_id: number | undefined;

export default defineComponent({
  name: "Message",
  data() {
    return {
      message: { opened: false, text: "" },
    };
  },
  mounted() {
    emitter.on("message", (msg) => {
      this.$data.message.text = msg;
      this.$data.message.opened = true;

      window.clearTimeout(message_timeout_id);
      message_timeout_id = window.setTimeout(() => {
        this.$data.message.opened = false;
      }, 3000);
    });
  },
});
</script>

<style scoped>
.message {
  box-sizing: border-box;
  background: #333;
  position: absolute;
  bottom: -35px;
  width: 100%;
  height: 0;
  line-height: 35px;
  padding: 0 10px 0 10px;
  color: var(--color-white);
  font-weight: 400;
  white-space: nowrap;
  transition:
    bottom 0.3s ease-in-out,
    height 0.3s ease-in-out;
  z-index: 10;
}
#message::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to right, #3333, #333 100%);
}
.message.opened {
  bottom: 0;
  height: 35px;
}

#app.is_safari .message {
  display: none;
}

#app.is_safari .message.opened {
  display: block;
}
</style>
