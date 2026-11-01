/* Ações compartilhadas da página de exportação do gerador Wi‑Fi. */
const baseUpdateAddress = updateAddress;
function refreshConnectionPanel() {
  const ssid = $("#ssid").value.trim() || "(sem nome)";
  const password = $("#password").value;
  const device = $("#deviceName").value.trim().toLowerCase() || "nome-do-carrinho";
  const site = `http://${device}.local`;
  const ap = $("#wifiMode").value === "ap";
  const summary = $("#summary");
  if (!summary) return;
  summary.querySelector("[data-wifi-name]").textContent = ssid;
  summary.querySelector("[data-wifi-password]").textContent = password || "Sem senha";
  summary.querySelector("[data-site-name]").textContent = site;
  const ipCard = summary.querySelector("[data-ap-only]");
  ipCard.hidden = !ap;
  const wifiPayload = password
    ? `WIFI:T:WPA;S:${wifiQrEscape(ssid)};P:${wifiQrEscape(password)};;`
    : `WIFI:T:nopass;S:${wifiQrEscape(ssid)};;`;
  drawAccessQr(summary.querySelector("[data-wifi-qr]"), wifiPayload);
  drawAccessQr(summary.querySelector("[data-site-qr]"), site);
  if (ap) drawAccessQr(summary.querySelector("[data-ip-qr]"), "http://192.168.4.1");
}
updateAddress = function () {
  baseUpdateAddress();
  refreshConnectionPanel();
};
updateAddress();

function wrappedText(ctx, value, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(value).split(/\s+/);
  let line = "", count = 0;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) { line = next; continue; }
    if (line) { ctx.fillText(line, x, y + count++ * lineHeight); line = ""; }
    for (const char of word) {
      if (line && ctx.measureText(line + char).width > maxWidth) {
        ctx.fillText(line, x, y + count++ * lineHeight); line = "";
        if (count >= maxLines) break;
      }
      line += char;
    }
    if (count >= maxLines) break;
  }
  if (count < maxLines && line) ctx.fillText(line, x, y + count * lineHeight);
}

function connectionCardCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  const ssid = $("#ssid").value.trim() || "(sem nome)";
  const password = $("#password").value || "Sem senha";
  const device = $("#deviceName").value.trim() || "Carrinho";
  const site = `http://${device.toLowerCase()}.local`;
  const qr = value => {
    const image = document.createElement("canvas");
    QRCodeLocal.draw(image, value, 680);
    return image;
  };
  const wifiQr = qr($("#password").value
    ? `WIFI:T:WPA;S:${wifiQrEscape(ssid)};P:${wifiQrEscape($("#password").value)};;`
    : `WIFI:T:nopass;S:${wifiQrEscape(ssid)};;`);
  const urls = [{value:site, image:qr(site)}];
  if ($("#wifiMode").value === "ap") urls.push({value:"http://192.168.4.1", image:qr("http://192.168.4.1")});

  ctx.fillStyle = "#f1f2f4"; ctx.fillRect(0, 0, 2400, 1200);
  ctx.fillStyle = "#e50914"; ctx.fillRect(0, 0, 2400, 18);
  ctx.fillStyle = "#111318"; ctx.font = "900 82px Arial";
  wrappedText(ctx, device, 70, 150, 900, 90, 2);
  ctx.fillStyle = "#e50914"; ctx.fillRect(70, 235, 150, 12);

  ctx.fillStyle = "#fff"; ctx.fillRect(55, 290, 900, 850);
  ctx.strokeStyle = "#d7d9de"; ctx.lineWidth = 4; ctx.strokeRect(55, 290, 900, 850);
  ctx.fillStyle = "#e50914"; ctx.font = "900 32px Arial"; ctx.fillText("PASSO 1", 95, 370);
  ctx.fillStyle = "#717580"; ctx.font = "800 28px Arial"; ctx.fillText("NOME DO WI-FI", 95, 500);
  ctx.fillStyle = "#17191f"; ctx.font = "800 46px Arial"; wrappedText(ctx, ssid, 95, 565, 390, 58, 2);
  ctx.fillStyle = "#e50914"; ctx.fillRect(95, 710, 390, 6);
  ctx.fillStyle = "#717580"; ctx.font = "800 28px Arial"; ctx.fillText("SENHA", 95, 795);
  ctx.fillStyle = "#17191f"; ctx.font = "700 40px Arial"; wrappedText(ctx, password, 95, 850, 390, 52, 2);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(wifiQr, 510, 475, 390, 390);

  ctx.fillStyle = "#fff"; ctx.fillRect(985, 290, 1360, 850);
  ctx.strokeStyle = "#d7d9de"; ctx.lineWidth = 4; ctx.strokeRect(985, 290, 1360, 850);
  ctx.fillStyle = "#e50914"; ctx.font = "900 32px Arial"; ctx.fillText("PASSO 2 • ENTRE NO SITE DO CARRINHO", 1035, 370);
  const count = urls.length, column = count === 1 ? 1200 : 640, gap = count === 1 ? 0 : 20;
  const size = count === 1 ? 600 : 500, total = column * count + gap * (count - 1);
  const start = 985 + (1360 - total) / 2;
  urls.forEach((item, i) => {
    const x = start + i * (column + gap), qx = x + (column - size) / 2;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(item.image, qx, 415, size, size);
    ctx.fillStyle = "#17191f"; ctx.font = "800 26px Arial"; ctx.textAlign = "center";
    wrappedText(ctx, item.value, x + column / 2, 415 + size + 65, column - 24, 36, 2);
  });
  ctx.textAlign = "left";
  return canvas;
}

function downloadUiFile(name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById("copyCode").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(firmware()); notify("Código copiado."); }
  catch (error) { notify(error.message || "Não foi possível copiar o código.", true); }
});
document.getElementById("downloadCard").addEventListener("click", () => {
  try {
    connectionCardCanvas().toBlob(blob => {
      if (!blob) { notify("Não foi possível preparar o cartão.", true); return; }
      downloadUiFile(`cartao_${safe($("#deviceName").value)}.png`, blob, "image/png");
      notify("Cartão de conexão baixado.");
    }, "image/png");
  } catch (error) { notify(error.message || "Não foi possível gerar o cartão.", true); }
});

function configurationData() {
  return {
    format: "ctrl-forge-blocks-wifi-config", version: 1,
    wifi: {mode:$("#wifiMode").value, ssid:$("#ssid").value, password:$("#password").value},
    deviceName:$("#deviceName").value, projectName:$("#projectName").value,
    hardware:clone(state.hardware)
  };
}
function validateConfiguration(data) {
  if (!data || data.format !== "ctrl-forge-blocks-wifi-config" || data.version !== 1) throw Error("Arquivo de configuração incompatível.");
  if (!data.wifi || !["ap", "sta"].includes(data.wifi.mode) || typeof data.wifi.ssid !== "string" || new TextEncoder().encode(data.wifi.ssid).length > 31 || typeof data.wifi.password !== "string" || data.wifi.password.length > 63) throw Error("Configuração de Wi‑Fi inválida.");
  if (typeof data.deviceName !== "string" || !/^[a-z0-9-]{1,32}$/i.test(data.deviceName)) throw Error("Nome do carrinho inválido.");
  const hardware = data.hardware;
  if (!Array.isArray(hardware) || hardware.length !== 4 || hardware.some(pin => !Number.isInteger(pin.pin) || pin.pin < 0 || pin.pin > 48 || !Number.isInteger(pin.role) || pin.role < 0 || pin.role > 3) || new Set(hardware.map(pin => pin.pin)).size !== 4 || new Set(hardware.map(pin => pin.role)).size !== 4) throw Error("Configuração dos motores inválida.");
  return data;
}
document.getElementById("downloadConfig").addEventListener("click", () => {
  const data = configurationData(), name = safe(data.deviceName);
  downloadUiFile(`configuracao_${name}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  $("#configMessage").textContent = "Configuração baixada.";
  $("#configMessage").classList.remove("error");
});
const configInput = document.getElementById("configFile");
document.getElementById("loadConfig").addEventListener("click", () => configInput.click());
configInput.addEventListener("change", async () => {
  const file = configInput.files?.[0]; if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw Error("Arquivo de configuração grande demais.");
    const data = validateConfiguration(JSON.parse(await file.text()));
    $("#wifiMode").value = data.wifi.mode;
    $("#ssid").value = data.wifi.ssid;
    $("#password").value = data.wifi.password;
    $("#deviceName").value = data.deviceName;
    $("#projectName").value = data.projectName || "carrinho_blocos_wifi";
    state.hardware = clone(data.hardware);
    document.querySelectorAll("[data-network-mode]").forEach(button => button.classList.toggle("active", button.dataset.networkMode === data.wifi.mode));
    $("#ssidLabel").textContent = data.wifi.mode === "ap" ? "Nome do Wi‑Fi que será criado (SSID)" : "Nome do Wi‑Fi existente ao qual o ESP32 vai se conectar (SSID)";
    $("#passwordLabel").textContent = data.wifi.mode === "ap" ? "Senha do Wi‑Fi que será criado" : "Senha do Wi‑Fi ao qual o ESP32 vai se conectar";
    hardware(); validNetwork(); updateAddress();
    $("#configMessage").textContent = `Configuração carregada: ${file.name}`;
    $("#configMessage").classList.remove("error");
  } catch (error) {
    $("#configMessage").textContent = error.message || "Não foi possível carregar a configuração.";
    $("#configMessage").classList.add("error");
  } finally { configInput.value = ""; }
});

function seedFloatingHearts() {
  const container = document.querySelector(".floating-hearts");
  if (!container) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 30; i++) {
    const heart = document.createElement("span"); heart.className = "floating-heart"; heart.textContent = "♥";
    heart.setAttribute("aria-hidden", "true");
    const duration = 5 + Math.random() * 5.5;
    heart.style.setProperty("--heart-left", `${33 + Math.random() * 43}%`);
    heart.style.setProperty("--heart-size", `${12 + Math.random() * 27}px`);
    heart.style.setProperty("--heart-duration", `${duration}s`);
    heart.style.setProperty("--heart-delay", `${-Math.random() * duration}s`);
    heart.style.setProperty("--heart-drift", `${-70 + Math.random() * 140}px`);
    heart.style.setProperty("--heart-glow", `${.38 + Math.random() * .55}`);
    fragment.appendChild(heart);
  }
  container.appendChild(fragment);
}
seedFloatingHearts();
