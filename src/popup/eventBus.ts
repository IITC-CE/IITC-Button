// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE
import mitt from "mitt";
import type { PopupEvents } from "@/types/events";

export const emitter = mitt<PopupEvents>();
