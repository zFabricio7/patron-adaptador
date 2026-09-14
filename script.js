let balance = 100.00;

// =========================================================
// SISTEMA DE EFECTOS DE SONIDO (Web Audio API)
// Genera sonidos sintéticos sin depender de mp3 externos
// =========================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'popup') {
    // Alerta aguda rápida (Pop-up)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'tick') {
    // Click mecánico/ruleta girando
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'transfer') {
    // Sonido de éxito/monedas en transferencia
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'win') {
    // Fanfarria corta al ganar en la ruleta
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

// =========================================================
// SISTEMA DE POP-UPS MOLESTOS
// =========================================================
const popupsData = [
  { title: "⚠️ VIRUS DETECTADO ⚠️", body: "¡Tu PC tiene 34 virus! Haz clic aquí para limpiar con Antivirus Pro." },
  { title: "🔥 SOLTERAS CERCA 🔥", body: "Hay 3 programadoras a menos de 1 km buscando hablar contigo." },
  { title: "🎉 ¡FELICIDADES! 🎉", body: "Has ganado un iPhone 17 Pro Max. Introduce tu tarjeta para el envío." },
  { title: "📢 OFERTA IMPERDIBLE", body: "Compra 1 NFT de un chango triste por solo $5,000 USD." }
];

function spawnAnnoyingPopup() {
  playSound('popup');
  const container = document.getElementById('popup-container');
  const randomData = popupsData[Math.floor(Math.random() * popupsData.length)];
  
  const popup = document.createElement('div');
  popup.className = 'popup';
  
  const top = Math.floor(Math.random() * (window.innerHeight - 200));
  const left = Math.floor(Math.random() * (window.innerWidth - 320));
  popup.style.top = `${Math.max(10, top)}px`;
  popup.style.left = `${Math.max(10, left)}px`;

  popup.innerHTML = `
    <div class="popup-header">
      <span>${randomData.title}</span>
      <button class="popup-close">X</button>
    </div>
    <p>${randomData.body}</p>
    <button class="popup-action-btn">¡RECLAMAR AHORA!</button>
  `;

  popup.querySelector('.popup-close').addEventListener('click', () => popup.remove());
  popup.querySelector('.popup-action-btn').addEventListener('click', () => {
    popup.remove();
    spawnAnnoyingPopup();
  });

  container.appendChild(popup);
}

setInterval(spawnAnnoyingPopup, 7000);

// =========================================================
// LÓGICA DE LA RULETA
// =========================================================
const options = [
  { label: "+$50 USD", val: 50 },
  { label: "-$30 USD", val: -30 },
  { label: "+$100 USD", val: 100 },
  { label: "QUEBRADO", val: -9999 },
  { label: "+$200 USD", val: 200 }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

function drawWheel() {
  const sliceAngle = (2 * Math.PI) / options.length;
  const colors = ["#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#009688"];
  options.forEach((opt, i) => {
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(90, 90);
    ctx.arc(90, 90, 85, i * sliceAngle, (i + 1) * sliceAngle);
    ctx.fill();
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = "bold 10px sans-serif";
    ctx.translate(90, 90);
    ctx.rotate(i * sliceAngle + sliceAngle / 2);
    ctx.fillText(opt.label, 30, 4);
    ctx.restore();
  });
}
drawWheel();

function spinWheel() {
  spawnAnnoyingPopup();
  const resultDiv = document.getElementById("roulette-result");
  resultDiv.textContent = "Girando...";
  let totalRounds = 15 + Math.floor(Math.random() * 10);
  let currentRound = 0;

  const interval = setInterval(() => {
    playSound('tick');
    canvas.style.transform = `rotate(${currentRound * 72}deg)`;
    currentRound++;

    if (currentRound >= totalRounds) {
      clearInterval(interval);
      playSound('win');
      const win = options[(currentRound - 1) % options.length];
      
      if (win.val === -9999) balance = 0;
      else balance = Math.max(0, balance + win.val);

      document.getElementById("balance").textContent = balance.toFixed(2);
      resultDiv.textContent = `¡Resultado: ${win.label}!`;
    }
  }, 70);
}

// =========================================================
// PATRÓN ADAPTADOR (SDKs DE RETIRO / PAYOUTS)
// =========================================================
class StripeSDK {
  createPayout(cents, acc) {
    return { payout_id: "po_" + Math.random().toString(36).substr(2, 6), destination: acc };
  }
}

class PayPalSDK {
  sendPayoutBatch(data) {
    return { batch_header: { payout_batch_id: "PAYPAL-BATCH-" + Math.floor(Math.random()*9000), status: "SUCCESS" } };
  }
}

class MercadoPagoSDK {
  transferSPEI(params) {
    return { spei_tracking: "SPEI-" + Math.floor(Math.random()*899999+100000), bank: params.target };
  }
}

class OxxoPaySDK {
  generateCashOutVoucher(amount) {
    return { pin_retiro: Math.floor(1000000088 + Math.random()*9000000000) };
  }
}

class StripeAdapter {
  constructor() { this.sdk = new StripeSDK(); }
  transferir(monto, destino) {
    const centavos = Math.round(monto * 100);
    const res = this.sdk.createPayout(centavos, destino);
    return `[StripeAdapter]: Retiro de $${monto.toFixed(2)} USD -> ${centavos} centavos.\nSDK Status: Payout ID ${res.payout_id} enviado a la cuenta ${res.destination}.`;
  }
}

class PayPalAdapter {
  constructor() { this.sdk = new PayPalSDK(); }
  transferir(monto, destino) {
    const payload = { items: [{ receiver: destino, amount: { value: monto.toFixed(2), currency: "USD" } }] };
    const res = this.sdk.sendPayoutBatch(payload);
    return `[PayPalAdapter]: Retiro de $${monto.toFixed(2)} USD -> Formateado a PayoutBatch Payload.\nSDK Status: Batch ID ${res.batch_header.payout_batch_id} (${res.batch_header.status}).`;
  }
}

class MercadoPagoAdapter {
  constructor() { this.sdk = new MercadoPagoSDK(); }
  transferir(monto, destino) {
    const params = { amount: monto, target: destino, currency: "MXN" };
    const res = this.sdk.transferSPEI(params);
    return `[MercadoPagoAdapter]: Transferencia SPEI de $${monto.toFixed(2)} MXN a CLABE/Cuenta ${destino}.\nSDK Status: Clave Rastreo ${res.spei_tracking}.`;
  }
}

class OxxoAdapter {
  constructor() { this.sdk = new OxxoPaySDK(); }
  transferir(monto, destino) {
    const res = this.sdk.generateCashOutVoucher(monto);
    return `[OxxoAdapter]: Retiro en efectivo por $${monto.toFixed(2)} MXN.\nSDK Status: Presenta este PIN en ventanilla Oxxo junto con tu INE.\nPIN de Retiro: ${res.pin_retiro}`;
  }
}

// =========================================================
// EVENT LISTENERS Y EJECUCIÓN
// =========================================================
function ejecutarTransferencia() {
  const monto = parseFloat(document.getElementById('monto-retiro').value);
  const destino = document.getElementById('cuenta-destino').value;
  const proveedor = document.getElementById('proveedor').value;
  const logDiv = document.getElementById('log');

  if (!monto || monto <= 0) return alert("Ingresa un monto válido.");
  if (monto > balance) return alert("¡No tienes suficiente saldo en el casino!");
  if (!destino) return alert("Ingresa una cuenta o correo de destino.");

  // Efecto de sonido de transferencia realizada
  playSound('transfer');

  // Descontar saldo
  balance -= monto;
  document.getElementById("balance").textContent = balance.toFixed(2);

  let adaptador;
  switch (proveedor) {
    case 'stripe': adaptador = new StripeAdapter(); break;
    case 'paypal': adaptador = new PayPalAdapter(); break;
    case 'mercadopago': adaptador = new MercadoPagoAdapter(); break;
    case 'oxxo': adaptador = new OxxoAdapter(); break;
  }

  logDiv.textContent = `[Sistema App]: Procesando retiro de $${monto.toFixed(2)} a ${destino}...\n` +
                       `[Sistema App]: Invocando adaptador.transferir(monto, destino)...\n\n` + 
                       adaptador.transferir(monto, destino);
}

document.getElementById('btn-top-banner').addEventListener('click', spawnAnnoyingPopup);
document.getElementById('btn-spin').addEventListener('click', spinWheel);
document.getElementById('btn-transfer').addEventListener('click', ejecutarTransferencia);
