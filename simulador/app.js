const scene = document.querySelector(".scene");
const heightSlider = document.querySelector("#tank-height");
const resistanceSlider = document.querySelector("#pipe-thickness");
const waterDrops = document.querySelector(".water-stream");
const waterWheel = document.querySelector(".water-wheel");

function updateFlow() {
  const height = Number(heightSlider.value);
  const resistance = Number(resistanceSlider.value);
  const flow = height / resistance;
  const maximumFlow = Number(heightSlider.max) / Number(resistanceSlider.min);
  const strength = Math.min(1, Math.log1p(flow) / Math.log1p(maximumFlow));
  const dropCount = Math.max(1, Math.round(1 + strength * 41));

  waterDrops.replaceChildren();
  for (let index = 0; index < dropCount; index += 1) {
    const drop = document.createElement("i");
    drop.style.setProperty("--drop-delay", `${-(index / dropCount) * 1.1}s`);
    drop.style.setProperty("--drop-x", `${((index % 3) - 1) * 7}px`);
    drop.style.setProperty("--spread-x", `${((index % 5) - 2) * 22}px`);
    waterDrops.append(drop);
  }

  waterWheel.style.setProperty("--wheel-duration", `${Math.max(.28, 4.2 - strength * 3.92)}s`);
}

function updateTankHeight() {
  const height = Number(heightSlider.value);
  const progress = ((height - Number(heightSlider.min)) / (Number(heightSlider.max) - Number(heightSlider.min))) * 100;
  const visualOffset = ((height - Number(heightSlider.min)) / (Number(heightSlider.max) - Number(heightSlider.min))) * 330;

  scene.style.setProperty("--tank-offset", visualOffset);
  heightSlider.style.setProperty("--slider-progress", `${progress}%`);
  updateFlow();
}

function updateResistance() {
  const resistance = Number(resistanceSlider.value);
  const progress = ((resistance - Number(resistanceSlider.min)) / (Number(resistanceSlider.max) - Number(resistanceSlider.min))) * 100;
  const thickness = 52 - (progress / 100) * 49;

  scene.style.setProperty("--choke-width", `${thickness}px`);
  resistanceSlider.style.setProperty("--thickness-progress", `${progress}%`);
  updateFlow();
}

heightSlider.addEventListener("input", updateTankHeight);
resistanceSlider.addEventListener("input", updateResistance);
updateTankHeight();
updateResistance();
