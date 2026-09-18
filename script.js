
const mainView = document.getElementById("mainView");
const detailsView = document.getElementById("detailsView");
const mainTime = document.getElementById("mainTime");
const qrTime = document.getElementById("qrTime");
const qrDate = document.getElementById("qrDate");
const detailsPickupDate = document.getElementById("detailsPickupDate");
const returnDate = document.getElementById("returnDate");
const mainOrderNumber = document.getElementById("mainOrderNumber");
const detailsOrderNumber = document.getElementById("detailsOrderNumber");
const helpView = document.getElementById("helpView");
const manageView = document.getElementById("manageView");
const ordersView = document.getElementById("ordersView");
const mainTitle = document.getElementById("mainTitle");
const qrSheetBackdrop = document.getElementById("qrSheetBackdrop");

const settingsModal = document.getElementById("settingsModal");
const orderNumberInput = document.getElementById("orderNumberInput");

let appDateTime = new Date();

function calculateOrderNumber(date) {
  const openingMinutes = 8 * 60;
  const closingMinutes = 21 * 60;
  const currentMinutes = Math.min(closingMinutes, Math.max(openingMinutes,
    date.getHours() * 60 + date.getMinutes()));
  const fourPmMinutes = 16 * 60;
  const ordersPerMinute = 21 / 80; // #69 at 4:00 PM to #90 at 5:20 PM
  return Math.max(1, Math.round(69 + (currentMinutes - fourPmMinutes) * ordersPerMinute));
}

let orderNumber = calculateOrderNumber(appDateTime);

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
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDetailsPickup(date) {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
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
  const currentTime = new Date();
  mainTime.textContent = formatMainTime(currentTime);
  qrTime.textContent = formatQrTime(currentTime);
  qrDate.textContent = formatLongDate(currentTime);
  detailsPickupDate.textContent = formatDetailsPickup(appDateTime);
  document.getElementById("sheetQrTime").textContent = formatQrTime(appDateTime);
  document.getElementById("sheetQrDate").textContent = formatLongDate(appDateTime);
  const compactTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true
  }).format(currentTime).replace(" ", "").toLowerCase();
  document.getElementById("ordersReadyTime").textContent = compactTime;
  document.querySelector(".orders-ready-time-copy").textContent = compactTime;
  document.getElementById("ordersPickupTime").textContent = compactTime;

  const due = new Date(appDateTime);
  due.setDate(due.getDate() + 3);
  returnDate.textContent = formatSlashDate(due);
}

function openOrders() {
  renderDateTime();
  ordersView.classList.add("active");
  ordersView.setAttribute("aria-hidden", "false");
  ordersView.scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => ordersView.classList.add("shown")));
}

function closeOrdersToTrackedOrder() {
  mainView.classList.add("tracked-mode");
  mainTitle.textContent = "Your order";
  document.getElementById("mainScrollArea").scrollTop = 0;
  ordersView.classList.remove("shown");
  window.setTimeout(() => {
    ordersView.classList.remove("active");
    ordersView.setAttribute("aria-hidden", "true");
  }, 320);
}

document.getElementById("mainCloseBtn").addEventListener("click", openOrders);
document.getElementById("trackOrderBtn").addEventListener("click", closeOrdersToTrackedOrder);

/* The tracked order behaves like a dismissible mobile sheet. A deliberate
   hold near the top, or a downward pull, returns to the Orders screen. */
let returnGestureStartY = 0;
let returnGestureStartX = 0;
let returnGestureTimer = null;
let returnGestureEligible = false;

mainView.addEventListener("touchstart", (event) => {
  if (!mainView.classList.contains("tracked-mode") || mainView.querySelector(".main-scroll-area").scrollTop > 6) return;
  const touch = event.touches[0];
  returnGestureStartY = touch.clientY;
  returnGestureStartX = touch.clientX;
  returnGestureEligible = true;
  clearTimeout(returnGestureTimer);
  returnGestureTimer = setTimeout(() => {
    if (returnGestureEligible) openOrders();
  }, 550);
}, { passive:true });

mainView.addEventListener("touchmove", (event) => {
  if (!returnGestureEligible) return;
  const touch = event.touches[0];
  const dy = touch.clientY - returnGestureStartY;
  const dx = Math.abs(touch.clientX - returnGestureStartX);
  if (dx > 24 || dy < -12) {
    returnGestureEligible = false;
    clearTimeout(returnGestureTimer);
  } else if (dy > 58) {
    returnGestureEligible = false;
    clearTimeout(returnGestureTimer);
    openOrders();
  }
}, { passive:true });

["touchend", "touchcancel"].forEach((name) => mainView.addEventListener(name, () => {
  returnGestureEligible = false;
  clearTimeout(returnGestureTimer);
}, { passive:true }));

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

function openDetails() {
  renderDateTime();
  renderOrderNumber();
  detailsView.classList.add("active");
  detailsView.scrollTop = 0;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => detailsView.classList.add("shown"));
  });
}

function closeDetails(afterClose) {
  detailsView.classList.remove("shown");
  window.setTimeout(() => {
    detailsView.classList.remove("active");
    if (typeof afterClose === "function") afterClose();
  }, 330);
}

function openSheet(sheet) {
  sheet.classList.add("active");
  sheet.setAttribute("aria-hidden", "false");
  sheet.scrollTop = 0;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => sheet.classList.add("shown"));
  });
}

function closeSheet(sheet) {
  sheet.classList.remove("shown");
  window.setTimeout(() => {
    sheet.classList.remove("active");
    sheet.setAttribute("aria-hidden", "true");
  }, 350);
}

document.getElementById("detailsBtn").addEventListener("click", openDetails);
document.getElementById("backBtn").addEventListener("click", () => closeDetails());

document.querySelectorAll(".open-help").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.preventDefault();
    openSheet(helpView);
  });
});

document.querySelectorAll(".open-manage").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.preventDefault();
    openSheet(manageView);
  });
});

document.getElementById("closeHelpBtn").addEventListener("click", () => closeSheet(helpView));
document.getElementById("closeManageBtn").addEventListener("click", () => closeSheet(manageView));

function openQrSheet() {
  renderDateTime();
  qrSheetBackdrop.classList.add("active");
  qrSheetBackdrop.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => requestAnimationFrame(() => qrSheetBackdrop.classList.add("shown")));
}

function closeQrSheet() {
  qrSheetBackdrop.classList.remove("shown");
  window.setTimeout(() => {
    qrSheetBackdrop.classList.remove("active");
    qrSheetBackdrop.setAttribute("aria-hidden", "true");
  }, 340);
}

document.getElementById("showQrBtn").addEventListener("click", openQrSheet);
document.getElementById("closeQrSheetBtn").addEventListener("click", closeQrSheet);
qrSheetBackdrop.addEventListener("click", (event) => {
  if (event.target === qrSheetBackdrop) closeQrSheet();
});

/* Purple links behave like buttons visually, but intentionally do not navigate anywhere. */
document.querySelectorAll('a[href="#"], .text-button').forEach((control) => {
  control.addEventListener("click", (event) => {
    if (control.id === "showQrBtn" || control.classList.contains("open-help") || control.classList.contains("open-manage")) return;
    event.preventDefault();
    control.classList.add("fake-pressed");
    setTimeout(() => control.classList.remove("fake-pressed"), 130);
  });
});

setToCurrentTime();
renderOrderNumber();
window.setInterval(renderDateTime, 15000);


// Avoid image-specific long-press/context menus and accidental selection.
document.addEventListener("contextmenu", (event) => event.preventDefault(), { passive: false });
document.addEventListener("dragstart", (event) => event.preventDefault(), { passive: false });
document.querySelectorAll("img").forEach((img) => img.setAttribute("draggable", "false"));
