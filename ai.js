async function askAI(message) {
  const url =
    "https://mg-ai-backend-kksjbyhykfxrrq8dgx2tvn.streamlit.app/?message=" +
    encodeURIComponent(message);

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Network error");
  }

  const data = await res.json();
  return data.reply;
}
