const STORAGE_KEY = "pousheen-save-v1";

const statConfig = [
  { key: "hunger", label: "Hambre", color: "#f7a552" },
  { key: "hygiene", label: "Higiene", color: "#78c7c7" },
  { key: "energy", label: "Energia", color: "#7fa5ff" },
  { key: "happiness", label: "Felicidad", color: "#f28b82" },
  { key: "health", label: "Salud", color: "#8dc7a3" },
];

const rooms = [
  { id: "living", name: "Sala principal", icon: "🏠", description: "Observa a Pusheen y revisa su estado general." },
  { id: "kitchen", name: "Cocina", icon: "🍓", description: "Alimenta a Pusheen con snacks, frutas y antojos." },
  { id: "bathroom", name: "Baño", icon: "🛁", description: "Limpiala, dale jabon y devuelvela a su mejor version." },
  { id: "bedroom", name: "Dormitorio", icon: "🌙", description: "Apaga la luz para que descanse y recupere energia." },
  { id: "games", name: "Sala de juegos", icon: "🎮", description: "Juega minijuegos para ganar monedas y felicidad." },
  { id: "lab", name: "Laboratorio", icon: "🧪", description: "Usa pociones para recuperar stats o cambiar el color." },
  { id: "garage", name: "Garaje", icon: "🛴", description: "Haz actividades ligeras y paseos para romper la rutina." },
];

const foods = [
  { id: "biscuit", name: "Galleta", hunger: 14, happiness: 4, cost: 4, xp: 6 },
  { id: "strawberry", name: "Fresa", hunger: 11, happiness: 7, cost: 6, xp: 8 },
  { id: "sandwich", name: "Sandwich", hunger: 22, happiness: 5, cost: 12, xp: 12 },
  { id: "cake", name: "Pastelito", hunger: 16, happiness: 12, cost: 15, xp: 14 },
];

const potions = [
  { id: "energy", name: "Pocion de energia", effect: { energy: 28 }, cost: 20, xp: 12 },
  { id: "clean", name: "Burbuja higienica", effect: { hygiene: 26 }, cost: 18, xp: 10 },
  { id: "health", name: "Corazon brillante", effect: { health: 24, happiness: 8 }, cost: 26, xp: 14 },
];

const accessories = [
  { id: "none", name: "Sin accesorio", emoji: "", owned: true },
  { id: "bow", name: "Moño rosa", emoji: "🎀", cost: 30 },
  { id: "crown", name: "Corona", emoji: "👑", cost: 45 },
  { id: "glasses", name: "Lentes", emoji: "🕶️", cost: 35 },
  { id: "flower", name: "Flor", emoji: "🌼", cost: 24 },
];

const backgrounds = [
  { id: "sunny", name: "Dorado", className: "", cost: 0, owned: true },
  { id: "mint", name: "Menta", className: "bg-mint", cost: 28 },
  { id: "dream", name: "Dreamy", className: "bg-dream", cost: 32 },
  { id: "berry", name: "Berry", className: "bg-berry", cost: 38 },
];

const colors = ["#d8b28f", "#f2c29c", "#d9b8d5", "#f6d37b", "#b8d5c9", "#9ec7e8"];

const activityActions = {
  living: [
    { label: "Acariciar", meta: "+10 felicidad", handler: () => interact({ happiness: 10, health: 2 }, 8, "Pusheen ronronea de gusto.") },
    { label: "Dar abrazo", meta: "+7 felicidad, +4 salud", handler: () => interact({ happiness: 7, health: 4 }, 10, "Se siente segura y querida.") },
    { label: "Hablarle bonito", meta: "+5 felicidad", handler: () => interact({ happiness: 5 }, 6, "Pusheen mueve la colita feliz.") },
  ],
  kitchen: foods.map((food) => ({ label: food.name, meta: `-${food.cost} monedas`, handler: () => feedPet(food) })),
  bathroom: [
    { label: "Baño con jabon", meta: "+24 higiene", handler: () => interact({ hygiene: 24, happiness: 6 }, 10, "Quedo brillando y oliendo delicioso.") },
    { label: "Cepillar", meta: "+12 higiene, +5 felicidad", handler: () => interact({ hygiene: 12, happiness: 5 }, 8, "Su pelito quedo suave y ordenado.") },
    { label: "Spa relajante", meta: "-10 monedas", handler: () => spendAndApply(10, { hygiene: 18, energy: 10, happiness: 10 }, 16, "Sesion premium completada.") },
  ],
  bedroom: [
    { label: "Siesta corta", meta: "+18 energia", handler: () => interact({ energy: 18, happiness: 4 }, 8, "Una siestita siempre ayuda.") },
    { label: "Dormir profundamente", meta: "Activa modo sueño", handler: toggleSleep },
    { label: "Contar cuento", meta: "+7 felicidad, +6 energia", handler: () => interact({ happiness: 7, energy: 6 }, 9, "Se relaja escuchando tu voz.") },
  ],
  games: [
    { label: "Jugar Tap Snacks", meta: "Gana monedas y XP", handler: openMiniGame },
    { label: "Pelotita", meta: "+10 felicidad, -4 energia", handler: () => interact({ happiness: 10, energy: -4 }, 9, "La diversion le alegra el dia.") },
    { label: "Bailecito", meta: "+6 felicidad, +6 XP", handler: () => interact({ happiness: 6, energy: -3 }, 6, "Un baile improvisado lleno de encanto.") },
  ],
  lab: potions.map((potion) => ({ label: potion.name, meta: `-${potion.cost} monedas`, handler: () => usePotion(potion) })),
  garage: [
    { label: "Paseo en scooter", meta: "+9 felicidad, -5 energia", handler: () => interact({ happiness: 9, energy: -5, health: 3 }, 12, "Una vuelta divertida por el vecindario.") },
    { label: "Paseo panoramico", meta: "-8 monedas", handler: () => spendAndApply(8, { happiness: 12, energy: -2 }, 12, "Vio el atardecer contigo.") },
    { label: "Estiramientos", meta: "+8 salud, +4 energia", handler: () => interact({ health: 8, energy: 4 }, 8, "Movimiento suave para sentirse mejor.") },
  ],
};

let state = loadState();

const refs = {
  meters: document.getElementById("meters"),
  levelValue: document.getElementById("levelValue"),
  coinsValue: document.getElementById("coinsValue"),
  xpLabel: document.getElementById("xpLabel"),
  xpFill: document.getElementById("xpFill"),
  moodEmoji: document.getElementById("moodEmoji"),
  moodText: document.getElementById("moodText"),
  roomTabs: document.getElementById("roomTabs"),
  roomTitle: document.getElementById("roomTitle"),
  roomDescription: document.getElementById("roomDescription"),
  roomScene: document.getElementById("roomScene"),
  panelTitle: document.getElementById("panelTitle"),
  panelBadge: document.getElementById("panelBadge"),
  panelContent: document.getElementById("panelContent"),
  inventoryContent: document.getElementById("inventoryContent"),
  speechBubble: document.getElementById("speechBubble"),
  clockValue: document.getElementById("clockValue"),
  petAvatar: document.getElementById("petAvatar"),
  petAccessory: document.getElementById("petAccessory"),
  sleepToggle: document.getElementById("sleepToggle"),
  petNameLabel: document.getElementById("petNameLabel"),
};

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.action === "save") {
      persist();
      announce("Partida guardada con amor.");
      render();
      return;
    }

    if (window.confirm("Esto reiniciara todo tu progreso en Pousheen. Quieres continuar?")) {
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
      announce("Pousheen comenzo una nueva aventura.");
      render();
    }
  });
});

refs.sleepToggle.addEventListener("click", toggleSleep);

render();
startSimulation();

function createDefaultState() {
  return {
    petName: "Pusheen",
    level: 1,
    xp: 0,
    xpGoal: 120,
    coins: 45,
    room: "living",
    sleeping: false,
    clockMinutes: 8 * 60,
    stats: { hunger: 78, hygiene: 82, energy: 76, happiness: 84, health: 88 },
    ownedAccessories: ["none"],
    equippedAccessory: "none",
    ownedBackgrounds: ["sunny"],
    equippedBackground: "sunny",
    color: colors[0],
    miniGame: { active: false, score: 0, roundsLeft: 0, message: "" },
    message: "Miau... quiero mimos.",
    lastTick: Date.now(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultState(),
      ...parsed,
      stats: { ...createDefaultState().stats, ...parsed.stats },
      ownedAccessories: parsed.ownedAccessories || ["none"],
      ownedBackgrounds: parsed.ownedBackgrounds || ["sunny"],
      miniGame: { ...createDefaultState().miniGame, ...parsed.miniGame },
    };
  } catch {
    return createDefaultState();
  }
}

function persist() {
  state.lastTick = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderMeters();
  renderHeader();
  renderRoomTabs();
  renderRoom();
  renderInventory();
  applyPetVisuals();
  persist();
}

function renderMeters() {
  refs.meters.innerHTML = "";
  statConfig.forEach((stat) => {
    const value = clamp(state.stats[stat.key]);
    const row = document.createElement("div");
    row.className = "meter-row";
    row.innerHTML = `
      <div class="meter-header"><span>${stat.label}</span><span>${Math.round(value)}%</span></div>
      <div class="meter-track"><div class="meter-fill" style="width:${value}%; background:${stat.color};"></div></div>
    `;
    refs.meters.appendChild(row);
  });
}

function renderHeader() {
  refs.petNameLabel.textContent = state.petName;
  refs.levelValue.textContent = state.level;
  refs.coinsValue.textContent = state.coins;
  refs.xpLabel.textContent = `${state.xp} / ${state.xpGoal}`;
  refs.xpFill.style.width = `${(state.xp / state.xpGoal) * 100}%`;
  refs.clockValue.textContent = formatClock(state.clockMinutes);
  refs.moodEmoji.textContent = getMoodEmoji();
  refs.moodText.textContent = getMoodText();
  refs.speechBubble.textContent = state.message;
  refs.sleepToggle.textContent = state.sleeping ? "Encender luz" : "Apagar luz";
}

function renderRoomTabs() {
  refs.roomTabs.innerHTML = "";
  rooms.forEach((room) => {
    const btn = document.createElement("button");
    btn.className = `room-tab ${room.id === state.room ? "active" : ""}`;
    btn.textContent = `${room.icon} ${room.name}`;
    btn.addEventListener("click", () => {
      state.room = room.id;
      announce(room.description);
      render();
    });
    refs.roomTabs.appendChild(btn);
  });
}

function renderRoom() {
  const room = rooms.find((entry) => entry.id === state.room);
  refs.roomTitle.textContent = room.name;
  refs.roomDescription.textContent = room.description;
  refs.panelTitle.textContent = room.name;
  refs.panelBadge.textContent = getPanelBadge(state.room);
  refs.roomScene.dataset.room = state.room;
  refs.panelContent.innerHTML = "";

  if (state.miniGame.active && state.room === "games") {
    renderMiniGame();
    return;
  }

  const info = document.createElement("div");
  info.className = "info-card";
  info.innerHTML = `<strong>Tip del cuarto:</strong> ${getRoomTip(state.room)}`;
  refs.panelContent.appendChild(info);

  if (state.room === "living") {
    refs.panelContent.appendChild(renderSocialPanel());
  }

  activityActions[state.room].forEach((action) => {
    const button = document.getElementById("actionButtonTemplate").content.firstElementChild.cloneNode(true);
    button.querySelector(".action-title").textContent = action.label;
    button.querySelector(".action-meta").textContent = action.meta;
    button.addEventListener("click", action.handler);
    refs.panelContent.appendChild(button);
  });

  if (state.room === "lab") refs.panelContent.appendChild(renderColorPanel());
}

function renderSocialPanel() {
  const card = document.createElement("div");
  card.className = "shop-item";
  card.innerHTML = `
    <strong>Visitas adorables</strong>
    <p class="inventory-note">Una version ligera de la parte social: inspírate viendo otros estilos de Pusheen.</p>
  `;

  [
    { name: "Pusheen Pastel", style: "Moño rosa y fondo dreamy" },
    { name: "Pusheen Aventurera", style: "Corona y paseos en scooter" },
    { name: "Pusheen Relax", style: "Flor y spa constante" },
  ].forEach((guest) => {
    const row = document.createElement("div");
    row.className = "custom-row";
    row.innerHTML = `<div><strong>😺 ${guest.name}</strong><p class="inventory-note">${guest.style}</p></div>`;
    const btn = document.createElement("button");
    btn.className = "secondary";
    btn.textContent = "Visitar";
    btn.addEventListener("click", () => {
      interact({ happiness: 5 }, 5, `Visitaron a ${guest.name} y regresaste con ideas nuevas.`);
    });
    row.appendChild(btn);
    card.appendChild(row);
  });

  return card;
}

function renderMiniGame() {
  const wrapper = document.createElement("div");
  wrapper.className = "mini-game-card";
  wrapper.innerHTML = `
    <p class="eyebrow">Minijuego</p>
    <h3>Tap Snacks</h3>
    <p>Toca solo los snacks ricos. Evita el chile. Quedan ${state.miniGame.roundsLeft} rondas.</p>
    <strong>Puntuacion: ${state.miniGame.score}</strong>
    <div class="mini-game-targets"></div>
    <p>${state.miniGame.message || "Cada acierto da monedas y experiencia."}</p>
    <button class="mini-btn secondary">Salir del minijuego</button>
  `;

  const targets = wrapper.querySelector(".mini-game-targets");
  shuffle([
    { emoji: "🍪", good: true },
    { emoji: "🍓", good: true },
    { emoji: "🧁", good: true },
    { emoji: "🌶️", good: false },
    { emoji: "🌶️", good: false },
    { emoji: "🌶️", good: false },
  ]).slice(0, 3).forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = `tap-target ${choice.good ? "good" : "bad"}`;
    btn.textContent = choice.emoji;
    btn.addEventListener("click", () => handleMiniGameTap(choice.good));
    targets.appendChild(btn);
  });

  wrapper.querySelector(".mini-btn").addEventListener("click", () => {
    state.miniGame.active = false;
    state.miniGame.message = "";
    announce("Cerraste el minijuego y vuelves a la sala.");
    render();
  });

  refs.panelContent.appendChild(wrapper);
}

function renderColorPanel() {
  const row = document.createElement("div");
  row.className = "custom-row";
  row.innerHTML = `
    <strong>Cambiar color de Pusheen</strong>
    <p class="inventory-note">Cada color cuesta 14 monedas y refuerza la personalizacion.</p>
    <div class="swatch-row"></div>
  `;

  const swatches = row.querySelector(".swatch-row");
  colors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.title = color;
    swatch.addEventListener("click", () => {
      if (state.color === color) {
        announce("Ese color ya esta puesto.");
        render();
        return;
      }
      spend(14, () => {
        state.color = color;
        gainXp(10);
        announce("Nueva tonalidad desbloqueada para Pusheen.");
        render();
      });
    });
    swatches.appendChild(swatch);
  });

  return row;
}

function renderInventory() {
  refs.inventoryContent.innerHTML = "";

  const accessoryCard = document.createElement("div");
  accessoryCard.className = "shop-item";
  accessoryCard.innerHTML = `<strong>Accesorios</strong><p class="inventory-note">Compra o equipa accesorios para que Pusheen tenga su propio estilo.</p>`;
  accessories.forEach((item) => accessoryCard.appendChild(renderShopButton(item, "accessory")));
  refs.inventoryContent.appendChild(accessoryCard);

  const backgroundCard = document.createElement("div");
  backgroundCard.className = "shop-item";
  backgroundCard.innerHTML = `<strong>Fondos</strong><p class="inventory-note">Dale una atmosfera distinta a la aventura con nuevos tonos visuales.</p>`;
  backgrounds.forEach((item) => backgroundCard.appendChild(renderShopButton(item, "background")));
  refs.inventoryContent.appendChild(backgroundCard);

  const notes = document.createElement("div");
  notes.className = "info-card";
  notes.innerHTML = `<strong>Como progresar</strong><p class="inventory-note">Cuida sus necesidades, juega minijuegos y visita cada habitacion para subir de nivel y desbloquear mas estilo.</p>`;
  refs.inventoryContent.appendChild(notes);
}

function renderShopButton(item, type) {
  const owned = type === "accessory" ? state.ownedAccessories.includes(item.id) : state.ownedBackgrounds.includes(item.id);
  const equipped = type === "accessory" ? state.equippedAccessory === item.id : state.equippedBackground === item.id;
  const row = document.createElement("div");
  row.className = "custom-row";
  row.innerHTML = `<div><strong>${type === "accessory" ? `${item.emoji || "✨"} ${item.name}` : `🎨 ${item.name}`}</strong><p class="inventory-note">${owned ? "Disponible en tu inventario." : `Costo: ${item.cost} monedas.`}</p></div>`;
  const btn = document.createElement("button");
  btn.textContent = equipped ? "Equipado" : owned ? "Equipar" : "Comprar";

  if (equipped) {
    btn.disabled = true;
  } else if (owned) {
    btn.classList.add("secondary");
    btn.addEventListener("click", () => {
      if (type === "accessory") state.equippedAccessory = item.id;
      else state.equippedBackground = item.id;
      announce(`${item.name} ahora forma parte del look de Pusheen.`);
      render();
    });
  } else {
    btn.addEventListener("click", () => {
      spend(item.cost, () => {
        if (type === "accessory") {
          state.ownedAccessories.push(item.id);
          state.equippedAccessory = item.id;
        } else {
          state.ownedBackgrounds.push(item.id);
          state.equippedBackground = item.id;
        }
        gainXp(14);
        announce(`Compraste ${item.name}.`);
        render();
      });
    });
  }

  row.appendChild(btn);
  return row;
}

function applyPetVisuals() {
  refs.petAvatar.style.setProperty("--pet-color", state.color);
  refs.petAvatar.style.setProperty("--pet-scale", `${1 + Math.min(0.22, (state.level - 1) * 0.03)}`);
  refs.petAccessory.textContent = accessories.find((item) => item.id === state.equippedAccessory)?.emoji || "";
  refs.petAvatar.classList.toggle("sleeping", state.sleeping);
  refs.petAvatar.classList.toggle("dirty", state.stats.hygiene < 38);
  refs.roomScene.classList.remove("bg-mint", "bg-dream", "bg-berry");
  const bg = backgrounds.find((item) => item.id === state.equippedBackground);
  if (bg?.className) refs.roomScene.classList.add(bg.className);
}

function feedPet(food) {
  spend(food.cost, () => interact({ hunger: food.hunger, happiness: food.happiness, health: 3 }, food.xp, `${food.name} delicioso. Pancita feliz.`));
}

function usePotion(potion) {
  spend(potion.cost, () => interact(potion.effect, potion.xp, `${potion.name} aplicada con exito.`));
}

function interact(changes, xpGain, message) {
  Object.entries(changes).forEach(([key, value]) => {
    state.stats[key] = clamp(state.stats[key] + value);
  });
  if (state.sleeping && (changes.happiness || changes.hunger || changes.hygiene)) state.sleeping = false;
  gainXp(xpGain);
  announce(message);
  render();
}

function spendAndApply(amount, changes, xpGain, message) {
  spend(amount, () => interact(changes, xpGain, message));
}

function spend(amount, onSuccess) {
  if (state.coins < amount) {
    announce("No hay suficientes monedas para eso.");
    render();
    return;
  }
  state.coins -= amount;
  onSuccess();
}

function gainXp(amount) {
  state.xp += amount;
  while (state.xp >= state.xpGoal) {
    state.xp -= state.xpGoal;
    state.level += 1;
    state.xpGoal = Math.round(state.xpGoal * 1.18);
    state.coins += 18;
    Object.keys(state.stats).forEach((key) => {
      state.stats[key] = clamp(state.stats[key] + 8);
    });
    state.message = `Subiste a nivel ${state.level}. Pusheen se ve orgullosa.`;
  }
}

function announce(message) {
  state.message = message;
}

function toggleSleep() {
  state.sleeping = !state.sleeping;
  announce(state.sleeping ? "Las luces se apagan. Hora de descansar." : "Buenos dias, Pusheen ya desperto.");
  render();
}

function openMiniGame() {
  state.room = "games";
  state.miniGame = { active: true, score: 0, roundsLeft: 8, message: "Toca la comida rica y evita el chile." };
  render();
}

function handleMiniGameTap(good) {
  if (!state.miniGame.active) return;
  if (good) {
    state.miniGame.score += 1;
    state.coins += 6;
    gainXp(8);
    state.stats.happiness = clamp(state.stats.happiness + 4);
    state.miniGame.message = "Acierto. Monedas y sonrisas para Pusheen.";
  } else {
    state.miniGame.score = Math.max(0, state.miniGame.score - 1);
    state.stats.happiness = clamp(state.stats.happiness - 3);
    state.miniGame.message = "Ups, ese snack no era buena idea.";
  }

  state.miniGame.roundsLeft -= 1;
  if (state.miniGame.roundsLeft <= 0) {
    state.miniGame.active = false;
    state.coins += state.miniGame.score * 4;
    gainXp(10 + state.miniGame.score * 3);
    announce(`Minijuego terminado. Resultado final: ${state.miniGame.score} puntos.`);
  }
  render();
}

function startSimulation() {
  const elapsed = Math.floor((Date.now() - state.lastTick) / 1000);
  if (elapsed > 0) applySimulation(elapsed);
  window.setInterval(() => applySimulation(5), 5000);
}

function applySimulation(seconds) {
  const factor = seconds / 5;
  state.clockMinutes = (state.clockMinutes + Math.round(4 * factor)) % (24 * 60);
  state.stats.hunger = clamp(state.stats.hunger - 0.8 * factor);
  state.stats.hygiene = clamp(state.stats.hygiene - 0.55 * factor);
  state.stats.happiness = clamp(state.stats.happiness - 0.35 * factor);
  state.stats.energy = clamp(state.stats.energy + (state.sleeping ? 1.8 : -0.65) * factor);
  if (state.sleeping) state.stats.health = clamp(state.stats.health + 0.45 * factor);

  const neglected = ["hunger", "hygiene", "energy"].filter((key) => state.stats[key] < 30).length;
  if (neglected > 0) {
    state.stats.happiness = clamp(state.stats.happiness - neglected * 0.8 * factor);
    state.stats.health = clamp(state.stats.health - neglected * 0.7 * factor);
  }

  if (state.stats.health <= 20) state.message = "Pusheen necesita mas cuidados ahora mismo.";
  else if (state.stats.happiness <= 25) state.message = "Se siente un poco sola.";
  else if (state.sleeping) state.message = "Shhh... esta descansando.";

  render();
}

function getMoodText() {
  const average = Object.values(state.stats).reduce((sum, value) => sum + value, 0) / statConfig.length;
  if (state.sleeping) return "Durmiendo tranquila";
  if (average > 80) return "Feliz y comoda";
  if (average > 60) return "Contenta y juguetona";
  if (average > 40) return "Necesita un poco de atencion";
  return "Quiere muchos cuidados";
}

function getMoodEmoji() {
  if (state.sleeping) return "😴";
  if (state.stats.health < 35) return "🥺";
  if (state.stats.happiness > 75) return "😸";
  if (state.stats.happiness > 45) return "😺";
  return "😿";
}

function getPanelBadge(roomId) {
  return { living: "Interactua", kitchen: "Comida", bathroom: "Limpieza", bedroom: "Descanso", games: "Diversion", lab: "Pociones", garage: "Paseos" }[roomId];
}

function getRoomTip(roomId) {
  return {
    living: "Acercarte, hablarle y abrazarla mantiene alta su felicidad general.",
    kitchen: "La comida sube el hambre y puede darte bonus de felicidad o salud.",
    bathroom: "Si la higiene baja mucho, su humor y salud se resienten con el tiempo.",
    bedroom: "Dormir regenera energia automaticamente y suaviza el desgaste.",
    games: "Los minijuegos son la mejor fuente de monedas y progreso constante.",
    lab: "Las pociones ayudan a remontar necesidades urgentes o cambiar la estetica.",
    garage: "Las actividades del garaje equilibran salud y felicidad con costo moderado.",
  }[roomId];
}

function formatClock(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}
