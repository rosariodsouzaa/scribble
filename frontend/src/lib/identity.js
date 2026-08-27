// Authoritative identity resolver for Scribble Royale.
const USERNAME_KEY = "skribl:username";
const WARRIOR_KEY = "sr_warrior";
const CLIENT_ID_KEY = "skribl:clientId";

export function getUsername() {
  const direct = localStorage.getItem(USERNAME_KEY);
  if (direct && direct.trim()) return direct.trim();
  try {
    const warrior = JSON.parse(localStorage.getItem(WARRIOR_KEY) || "{}");
    if (warrior.name && warrior.name.trim()) {
      localStorage.setItem(USERNAME_KEY, warrior.name.trim());
      return warrior.name.trim();
    }
  } catch {}
  const fallback = "Warrior_" + Math.floor(100 + Math.random() * 900);
  localStorage.setItem(USERNAME_KEY, fallback);
  return fallback;
}

export function setUsername(name) {
  const clean = String(name || "").trim().slice(0, 20) || "Warrior";
  localStorage.setItem(USERNAME_KEY, clean);
  try {
    const warrior = JSON.parse(localStorage.getItem(WARRIOR_KEY) || "{}");
    warrior.name = clean;
    localStorage.setItem(WARRIOR_KEY, JSON.stringify(warrior));
  } catch {}
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
