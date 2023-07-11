<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div id="message" class="message" v-bind:class="{ opened: message.opened }">
    {{ message.text }}
  </div>
</template>

<script>
let message_timeout_id = null;

export default {
  name: "Message",
  data() {
    return {
      message: { opened: false, text: "" }
    };
  },
  mounted() {
    this.$root.$on("message", msg => {
      const self = this;
      self.$data.message.text = msg;
      self.$data.message.opened = true;

      clearTimeout(message_timeout_id);
      message_timeout_id = setTimeout(function() {
        self.$data.message.opened = false;
      }, 3000);
    });
  }
};
</script>

<style scoped>
.message {
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
  transition: bottom 0.3s ease-in-out, height 0.3s ease-in-out;
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
  left: 0;
  bottom: 0;
  right: 0;
}

#app.is_safari .message.opened {
  display: block;
}
</style>
