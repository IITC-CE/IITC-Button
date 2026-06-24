<!-- @license Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE -->
<template>
  <aside class="sidebar">
    <div class="brand">
      <img
        class="brand__logo"
        src="/assets/images/IITC-black-horizontally.svg"
        alt="IITC"
      />
    </div>

    <nav class="nav">
      <div class="nav__group" v-for="group in groups" :key="group.label">
        <div class="nav__group-label">{{ group.label }}</div>
        <div
          v-for="item in group.items"
          :id="item.id"
          :key="item.id"
          class="nav__item"
          :class="{ active: tab === item.id }"
          @click="$emit('setTab', item.id)"
        >
          <i class="material-icons nav__icon">{{ item.icon }}</i>
          <span class="nav__label">{{ item.label }}</span>
        </div>
      </div>
    </nav>

    <div class="sidebar__spacer"></div>

    <div class="sidebar__version" v-if="version">
      <span class="sidebar__version-name">IITC-Button</span>
      <span class="sidebar__version-num">v{{ version }}</span>
    </div>

    <div class="sidebar__links">
      <a
        v-for="link in links"
        :key="link.label"
        class="sidebar__link"
        :href="link.href"
        :title="link.title"
        target="_blank"
        rel="noopener"
      >
        <i class="material-icons sidebar__link-icon">{{ link.icon }}</i>
        <span>{{ link.label }}</span>
      </a>
    </div>
  </aside>
</template>

<script lang="ts">
import browser from "webextension-polyfill";
import { t } from "@/i18n";

export default defineComponent({
  name: "Sidebar",
  props: {
    tab: String,
  },
  emits: ["setTab"],
  data() {
    return {
      version: "",
    };
  },
  computed: {
    groups() {
      return [
        {
          label: t("sidebarPlugins"),
          items: [{ id: "add", label: t("addExternalPlugin"), icon: "add" }],
        },
        {
          label: t("sidebarExtension"),
          items: [
            { id: "options", label: t("settings"), icon: "settings" },
            { id: "backup", label: t("backup"), icon: "save" },
            { id: "debug", label: t("debug"), icon: "bug_report" },
          ],
        },
      ];
    },
    links() {
      return [
        {
          label: "iitc.app",
          title: "iitc.app",
          href: "https://iitc.app",
          icon: "public",
        },
        {
          label: "IITC-CE",
          title: "github.com/IITC-CE/ingress-intel-total-conversion",
          href: "https://github.com/IITC-CE/ingress-intel-total-conversion",
          icon: "code",
        },
        {
          label: t("donate"),
          title: t("donate"),
          href: "https://iitc.app/donate",
          icon: "favorite",
        },
        {
          label: "IITC-Button",
          title: "github.com/IITC-CE/IITC-Button",
          href: "https://github.com/IITC-CE/IITC-Button",
          icon: "code",
        },
      ];
    },
  },
  methods: {
    t: t,
  },
  mounted() {
    this.version = browser.runtime.getManifest().version;
  },
});
</script>

<style scoped>
.sidebar {
  width: 248px;
  flex-shrink: 0;
  background: var(--sidebar-surface);
  color: var(--sidebar-on-surface-variant);
  border-right: 1px solid var(--sidebar-outline);
  padding: 0 12px 16px;
  display: flex;
  flex-direction: column;
}

.brand {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand__logo {
  height: 64px;
  width: auto;
  display: block;
}

.nav__group + .nav__group {
  margin-top: 16px;
}

.nav__group-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--sidebar-on-surface-variant);
  padding: 0 14px 8px;
}

.nav__item {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--sidebar-on-surface-variant);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 2px;
}

.nav__item:hover {
  background: var(--sidebar-hover);
}

.nav__item.active {
  background: var(--sidebar-surface-container);
  color: var(--sidebar-on-surface);
}

.nav__icon {
  font-size: 19px;
  color: var(--sidebar-on-surface-variant);
  flex-shrink: 0;
}

.nav__item.active .nav__icon {
  color: var(--sidebar-accent);
}

.sidebar__spacer {
  flex: 1;
  min-height: 24px;
}

.sidebar__version {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: var(--sidebar-hover);
}

.sidebar__version-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--sidebar-on-surface);
}

.sidebar__version-num {
  font-size: 11.5px;
  font-family: var(--font-mono);
  color: var(--sidebar-on-surface-variant);
}

.sidebar__links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.sidebar__link {
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: var(--sidebar-on-surface-variant);
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid var(--sidebar-outline);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  min-width: 0;
}

.sidebar__link span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__link:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-on-surface);
}

.sidebar__link-icon {
  font-size: 15px;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
    box-sizing: border-box;
    border-right: 0;
    border-bottom: 1px solid var(--sidebar-outline);
  }

  .sidebar__spacer {
    display: none;
  }

  .sidebar__version {
    margin-top: 16px;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .nav__group {
    flex: 1;
  }

  .nav__group + .nav__group {
    margin-top: 0;
  }

  .sidebar__links {
    margin-top: 16px;
  }
}
</style>
