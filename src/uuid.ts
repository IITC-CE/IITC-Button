// Copyright (C) IITC-CE - GPL-3.0 with Store Exception - see LICENSE and COPYING.STORE

export function uuidv4(): string {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (c: string) => {
      const n = parseInt(c, 10);
      return (
        n ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))
      ).toString(16);
    },
  );
}
