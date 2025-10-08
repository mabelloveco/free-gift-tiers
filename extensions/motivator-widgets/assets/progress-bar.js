(async () => {
  const root = document.getElementById("fgp-progress");
  if (!root) return;
  const thr = Number(root.dataset.thresholdCents || 0);
  const fill = document.getElementById("fgp-fill");
  const text = document.getElementById("fgp-text");

  async function subtotalCents() {
    try {
      const r = await fetch("/cart.js", {
        headers: { Accept: "application/json" },
      });
      const cart = await r.json();
      return Math.round(cart.items_subtotal_price); // already in cents
    } catch {
      return 0;
    }
  }

  function render(current) {
    const pct = Math.max(0, Math.min(100, thr ? (current / thr) * 100 : 0));
    if (fill) fill.style.width = pct + "%";
    if (!text) return;
    if (!thr) {
      text.textContent = "";
      return;
    }
    if (current >= thr) text.textContent = "Free gift unlocked";
    else {
      const left = ((thr - current) / 100).toFixed(2);
      text.textContent = `You're $${left} away from your free gift`;
    }
  }

  render(await subtotalCents());
  document.addEventListener("cart:refresh", async () =>
    render(await subtotalCents()),
  );
})();
