
const mainView = document.getElementById("mainView");
const detailsView = document.getElementById("detailsView");
const mainTime = document.getElementById("mainTime");
const qrTime = document.getElementById("qrTime");
const qrDate = document.getElementById("qrDate");
const detailsPickupDate = document.getElementById("detailsPickupDate");
const returnDate = document.getElementById("returnDate");
const mainOrderNumber = document.getElementById("mainOrderNumber");
const detailsOrderNumber = document.getElementById("detailsOrderNumber");

const settingsModal = document.getElementById("settingsModal");
const orderNumberInput = document.getElementById("orderNumberInput");

let appDateTime = new Date();
let orderNumber = 131;

function formatMainTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${minutes}${suffix}`;
}

function formatQrTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date).replace(" ", "").toLowerCase();
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDetailsPickup(date) {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date).replace(" ", "").toLowerCase();

  return `${datePart}, ${timePart}`;
}

function formatSlashDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function renderDateTime() {
  mainTime.textContent = formatMainTime(appDateTime);
  qrTime.textContent = formatQrTime(appDateTime);
  qrDate.textContent = formatLongDate(appDateTime);
  detailsPickupDate.textContent = formatDetailsPickup(appDateTime);

  const due = new Date(appDateTime);
  due.setDate(due.getDate() + 3);
  returnDate.textContent = formatSlashDate(due);
}

function renderOrderNumber() {
  mainOrderNumber.textContent = `ORDER #${orderNumber}`;
  detailsOrderNumber.textContent = orderNumber;
}

function setToCurrentTime() {
  appDateTime = new Date();
  renderDateTime();
}

function openSettings() {
  orderNumberInput.value = orderNumber;
  settingsModal.classList.add("open");
  settingsModal.setAttribute("aria-hidden", "false");
  setTimeout(() => orderNumberInput.focus(), 50);
}

function closeSettings() {
  settingsModal.classList.remove("open");
  settingsModal.setAttribute("aria-hidden", "true");
}

document.getElementById("refreshTimeBtn").addEventListener("click", openSettings);
document.getElementById("closeSettingsBtn").addEventListener("click", closeSettings);

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});

document.getElementById("saveOrderNumberBtn").addEventListener("click", () => {
  const value = Math.floor(Number(orderNumberInput.value));
  if (Number.isFinite(value) && value > 0) {
    orderNumber = value;
    renderOrderNumber();
    closeSettings();
  } else {
    orderNumberInput.focus();
  }
});

document.getElementById("refreshNowBtn").addEventListener("click", () => {
  setToCurrentTime();
  closeSettings();
});

orderNumberInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("saveOrderNumberBtn").click();
  }
});

document.getElementById("detailsBtn").addEventListener("click", () => {
  renderDateTime();
  renderOrderNumber();
  mainView.classList.remove("active");
  detailsView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
});

document.getElementById("backBtn").addEventListener("click", () => {
  detailsView.classList.remove("active");
  mainView.classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
});

document.getElementById("showQrBtn").addEventListener("click", () => {
  detailsView.classList.remove("active");
  mainView.classList.add("active");
  requestAnimationFrame(() => {
    document.querySelector(".qr-wrap").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

/* Purple links behave like buttons visually, but intentionally do not navigate anywhere. */
document.querySelectorAll('a[href="#"], .text-button').forEach((control) => {
  control.addEventListener("click", (event) => {
    if (control.id === "showQrBtn") return; // this one has a real in-app action
    event.preventDefault();
    control.classList.add("fake-pressed");
    setTimeout(() => control.classList.remove("fake-pressed"), 130);
  });
});

setToCurrentTime();
renderOrderNumber();


// Avoid image-specific long-press/context menus and accidental selection.
document.addEventListener("contextmenu", (event) => event.preventDefault(), { passive: false });
document.addEventListener("dragstart", (event) => event.preventDefault(), { passive: false });
document.querySelectorAll("img").forEach((img) => img.setAttribute("draggable", "false"));
