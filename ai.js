async function askAI(message, attempt = 1) {
  const url =
    "https://mg-ai-backend-kksjbyhykfxrrq8dgx2tvn.streamlit.app/?message=" +
    encodeURIComponent(message);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await res.text();
    const data = JSON.parse(text);

    if (!data.reply) throw new Error("No reply");

    return data.reply;

  } catch (err) {
    // 🔁 Auto-retry once (Streamlit waking up)
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 2500));
      return askAI(message, attempt + 1);
    }
    throw err;
  }
}
