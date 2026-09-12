async function parseJson(res, errMsg) {
  let data = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `${errMsg} (Status ${res.status})`);
  }
  return data;
}

export async function createRoom(options = {}) {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  return parseJson(res, "Failed to create room");
}

export async function getRoom(code) {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
  return parseJson(res, "Room not found");
}
