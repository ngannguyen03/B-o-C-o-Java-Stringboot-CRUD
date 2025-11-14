export async function aiChatAPI(text) {
  const res = await fetch("http://localhost:3001/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();
  return data.reply;
}
