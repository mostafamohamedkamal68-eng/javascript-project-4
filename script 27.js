const remote = document.querySelector(".remote");
const temperatureDisplay = document.getElementById("temperature");
const statusDisplay = document.getElementById("status");
const modeDisplay = document.getElementById("modeDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const featureDisplay = document.getElementById("featureDisplay");

const onButton = document.getElementById("onBtn");
const offButton = document.getElementById("offBtn");
const increaseButton = document.getElementById("increaseBtn");
const decreaseButton = document.getElementById("decreaseBtn");
const fanButton = document.getElementById("fanBtn");
const modeButton = document.getElementById("modeBtn");
const swingButton = document.getElementById("swingBtn");
const timerButton = document.getElementById("timerBtn");
const sleepButton = document.getElementById("sleepBtn");
const turboButton = document.getElementById("turboBtn");

const modes = [
    { name: "COOL", icon: "❄️" },
    { name: "HEAT", icon: "☀️" },
    { name: "DRY", icon: "💧" },
    { name: "FAN", icon: "🌀" },
    { name: "AUTO", icon: "↻" }
];
const fanSpeeds = ["AUTO", "LOW", "MED", "HIGH"];

let temperature = 24;
let isOn = false;
let modeIndex = 0;
let fanIndex = 0;
let swingOn = false;
let sleepOn = false;
let turboOn = false;
let fanSpeedBeforeTurbo = null;
let timerId = null;
let timerTime = null;
let timerMessage = "TIMER OFF";

function updateScreen() {
    temperatureDisplay.textContent = temperature + "°C";
    statusDisplay.textContent = isOn ? "ON" : "OFF";
    modeDisplay.textContent = modes[modeIndex].name + " " + modes[modeIndex].icon;
    timerDisplay.textContent = timerMessage;
    featureDisplay.textContent =
        "FAN " + fanSpeeds[fanIndex] + " · SWING " + (swingOn ? "ON" : "OFF") +
        "\nSLEEP " + (sleepOn ? "ON" : "OFF") + " · TURBO " + (turboOn ? "ON" : "OFF");

    remote.classList.toggle("off-mode", !isOn);
    increaseButton.disabled = !isOn || temperature >= 30;
    decreaseButton.disabled = !isOn || temperature <= 16;

    fanButton.setAttribute("aria-label", "Cycle fan speed. Current speed: " + fanSpeeds[fanIndex]);
    modeButton.setAttribute("aria-label", "Change mode. Current mode: " + modes[modeIndex].name);
    swingButton.setAttribute("aria-pressed", String(swingOn));
    sleepButton.setAttribute("aria-pressed", String(sleepOn));
    turboButton.setAttribute("aria-pressed", String(turboOn));
}

function turnOn() {
    isOn = true;
    updateScreen();
}

function cancelTimer() {
    if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
    }

    timerTime = null;
    timerMessage = "TIMER OFF";
}

function turnOff() {
    isOn = false;
    cancelTimer();
    updateScreen();
}

function increaseTemperature() {
    if (isOn && temperature < 30) {
        temperature++;
        updateScreen();
    }
}

function decreaseTemperature() {
    if (isOn && temperature > 16) {
        temperature--;
        updateScreen();
    }
}

function cycleFanSpeed() {
    if (turboOn) {
        turboOn = false;
        fanIndex = fanSpeedBeforeTurbo === null ? 0 : fanSpeedBeforeTurbo;
        fanSpeedBeforeTurbo = null;
    }

    fanIndex = (fanIndex + 1) % fanSpeeds.length;
    updateScreen();
}

function cycleMode() {
    modeIndex = (modeIndex + 1) % modes.length;
    updateScreen();
}

function toggleSwing() {
    swingOn = !swingOn;
    updateScreen();
}

function toggleSleep() {
    sleepOn = !sleepOn;
    updateScreen();
}

function toggleTurbo() {
    if (turboOn) {
        turboOn = false;
        fanIndex = fanSpeedBeforeTurbo === null ? 0 : fanSpeedBeforeTurbo;
        fanSpeedBeforeTurbo = null;
    } else {
        fanSpeedBeforeTurbo = fanIndex;
        fanIndex = fanSpeeds.length - 1;
        turboOn = true;
    }

    updateScreen();
}

function setTimer() {
    const enteredTime = window.prompt(
        "Enter the turn-off time (HH:MM, 24-hour format). Leave blank to cancel the timer.",
        timerTime || "23:00"
    );

    if (enteredTime === null) {
        return;
    }

    const value = enteredTime.trim();
    if (value === "") {
        cancelTimer();
        updateScreen();
        return;
    }

    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (!match) {
        window.alert("Enter a valid time from 00:00 to 23:59.");
        return;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    if (timerId !== null) {
        window.clearTimeout(timerId);
    }

    timerTime = match[1] + ":" + match[2];
    timerMessage = "OFF AT " + timerTime;
    timerId = window.setTimeout(function () {
        timerId = null;
        timerTime = null;
        timerMessage = "TIMER OFF";
        isOn = false;
        updateScreen();
        window.alert("The air conditioner has turned off.");
    }, target.getTime() - now.getTime());

    updateScreen();
}

onButton.addEventListener("click", turnOn);
offButton.addEventListener("click", turnOff);
increaseButton.addEventListener("click", increaseTemperature);
decreaseButton.addEventListener("click", decreaseTemperature);
fanButton.addEventListener("click", cycleFanSpeed);
modeButton.addEventListener("click", cycleMode);
swingButton.addEventListener("click", toggleSwing);
timerButton.addEventListener("click", setTimer);
sleepButton.addEventListener("click", toggleSleep);
turboButton.addEventListener("click", toggleTurbo);

updateScreen();
