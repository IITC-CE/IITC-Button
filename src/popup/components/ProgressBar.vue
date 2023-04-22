<!-- @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3 -->
<template>
  <div
    id="progressbar"
    class="progressbar"
    v-bind:class="{ active: showProgressbar }"
  ></div>
</template>

<script>
export default {
  name: "ProgressBar",
  data() {
    return {
      showProgressbar: false
    };
  },
  mounted() {
    this.$root.$on("showProgressbar", status => {
      this.$data.showProgressbar = status;
    });
  }
};
</script>

<style scoped>
.progressbar {
  opacity: 0;
  transition: opacity 0.2s linear;
  animation-play-state: paused;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 50px;
  width: calc(100% - 147px);
  background-color: #222;
  animation: preloader-background ease-in-out 2s infinite;
}
.progressbar.active {
  opacity: 1;
  animation-play-state: running;
}
.progressbar::before,
.progressbar::after {
  animation-play-state: running;
  display: block;
  position: absolute;
  top: 0;
  z-index: 2;
  width: 0;
  height: 50px;
  animation: preloader-front ease-in-out 2s infinite;
  content: "";
}
.progressbar.active::before,
.progressbar.active::after {
  animation-play-state: running;
}
.progressbar::before {
  right: 100%;
}
.progressbar::after {
  left: 0;
}

@keyframes preloader-background {
  0%,
  44.9999% {
    background-color: #222;
  }
  50%,
  100% {
    background-color: #444;
  }
}
@keyframes preloader-front {
  0% {
    width: 0;
    background-color: #444;
  }
  49.9999% {
    width: 100%;
    background-color: #444;
  }
  50% {
    width: 0;
    background-color: #222;
  }
  100% {
    width: 100%;
    background-color: #222;
  }
}
</style>
