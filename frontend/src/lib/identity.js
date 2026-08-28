import { IdentityManager } from "../services/identity/index.js";

export function getUsername() {
  return IdentityManager.getUsername();
}

export function setUsername(name) {
  return IdentityManager.setUsername(name);
}

export function getClientId() {
  return IdentityManager.getClientId();
}
