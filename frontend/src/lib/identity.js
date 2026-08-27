// Stubbed identity for the game-loop-first slice: a nickname + a stable clientId,
// both in localStorage. When real auth lands, clientId becomes the userId and this
// file is the only place that changes.
const USERNAME_KEY = "skribl:username";
const CLIENT_ID_KEY = "skribl:clientId";

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function setUsername(name) {
  localStorage.setItem(USERNAME_KEY, String(name).trim().slice(0, 20));
}

export function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
