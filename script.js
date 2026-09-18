
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
const receiptBackdrop = document.getElementById("receiptBackdrop");
const restaurantView = document.getElementById("restaurantView");

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
  document.querySelectorAll("#ordersPickupTime, .shared-pickup-time").forEach((node) => {
    node.textContent = compactTime;
  });

  const due = new Date(appDateTime);
  due.setDate(due.getDate() + 3);
  returnDate.textContent = formatSlashDate(due);
}

function openOrders() {
  renderDateTime();
  const finishingGesture = ordersView.classList.contains("gesture-preview");
  if (finishingGesture) ordersView.classList.add("active", "shown");
  resetOrderPull();
  ordersView.classList.add("active");
  ordersView.setAttribute("aria-hidden", "false");
  ordersView.scrollTop = 0;
  if (!finishingGesture) requestAnimationFrame(() => requestAnimationFrame(() => ordersView.classList.add("shown")));
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

/* The tracked order behaves like a physical mobile sheet: the Orders page is
   revealed under the finger, and only a deliberate pull near the top commits. */
let returnGestureStartY = 0;
let returnGestureStartX = 0;
let returnGestureEligible = false;
let returnGestureDistance = 0;

function resetOrderPull() {
  returnGestureEligible = false;
  returnGestureDistance = 0;
  mainView.classList.remove("dragging-order", "settling-order");
  mainView.style.transform = "";
  ordersView.classList.remove("gesture-preview");
}

mainView.addEventListener("touchstart", (event) => {
  if (mainView.querySelector(".main-scroll-area").scrollTop > 3) return;
  const touch = event.touches[0];
  if (touch.clientY > window.innerHeight * .48) return;
  returnGestureStartY = touch.clientY;
  returnGestureStartX = touch.clientX;
  returnGestureEligible = true;
  returnGestureDistance = 0;
}, { passive:true });

mainView.addEventListener("touchmove", (event) => {
  if (!returnGestureEligible) return;
  const touch = event.touches[0];
  const dy = touch.clientY - returnGestureStartY;
  const dx = Math.abs(touch.clientX - returnGestureStartX);
  if (dx > 34 || dy < -14) {
    resetOrderPull();
    return;
  }
  if (dy > 0) event.preventDefault();
  if (dy > 12) {
    returnGestureDistance = Math.min(window.innerHeight * .42, (dy - 12) * .52);
    const ordersScroller = ordersView.querySelector(".orders-content");
    if (!ordersView.classList.contains("gesture-preview")) ordersScroller.scrollTop = 0;
    ordersView.classList.add("gesture-preview");
    ordersView.setAttribute("aria-hidden", "false");
    mainView.classList.add("dragging-order");
    mainView.style.transform = `translate3d(0, ${returnGestureDistance}px, 0)`;
  }
}, { passive:false });

["touchend", "touchcancel"].forEach((name) => mainView.addEventListener(name, () => {
  if (!returnGestureEligible) return;
  const threshold = 130 + returnGestureStartY * .34;
  const shouldOpen = name === "touchend" && returnGestureDistance >= threshold;
  returnGestureEligible = false;
  mainView.classList.remove("dragging-order");
  mainView.classList.add("settling-order");
  if (shouldOpen) {
    mainView.style.transform = "translate3d(0, 100dvh, 0)";
    window.setTimeout(openOrders, 220);
  } else {
    mainView.style.transform = "translate3d(0, 0, 0)";
    window.setTimeout(() => {
      resetOrderPull();
      if (!ordersView.classList.contains("active")) ordersView.setAttribute("aria-hidden", "true");
    }, 230);
  }
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

function openReceipt(event) {
  event.preventDefault();
  receiptBackdrop.classList.add("active");
  receiptBackdrop.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => requestAnimationFrame(() => receiptBackdrop.classList.add("shown")));
}

function closeReceipt() {
  receiptBackdrop.classList.remove("shown");
  window.setTimeout(() => {
    receiptBackdrop.classList.remove("active");
    receiptBackdrop.setAttribute("aria-hidden", "true");
  }, 340);
}

document.getElementById("receiptLink").addEventListener("click", openReceipt);
receiptBackdrop.addEventListener("click", (event) => {
  if (event.target === receiptBackdrop) closeReceipt();
});

/* Reuse the fixed order summary and bottom navigation on every primary tab. */
document.querySelectorAll(".shared-bottom").forEach((host) => {
  const summary = ordersView.querySelector(".orders-summary").cloneNode(true);
  const pickup = summary.querySelector("#ordersPickupTime");
  if (pickup) {
    pickup.removeAttribute("id");
    pickup.classList.add("shared-pickup-time");
  }
  host.append(summary, ordersView.querySelector(".orders-nav").cloneNode(true));
});

const tabPages = [...document.querySelectorAll(".tab-page")];
function openTab(name) {
  tabPages.forEach((page) => {
    const active = page.dataset.page === name;
    page.classList.toggle("active", active);
    page.setAttribute("aria-hidden", String(!active));
    if (active) page.querySelector(".tab-scroll").scrollTop = 0;
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.tab === name);
  });
  if (name === "orders") {
    ordersView.classList.add("active", "shown");
    ordersView.setAttribute("aria-hidden", "false");
  }
  renderDateTime();
}

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => openTab(button.dataset.tab));
});

function openRestaurant() {
  restaurantView.classList.add("active");
  restaurantView.setAttribute("aria-hidden", "false");
  restaurantView.querySelector(".restaurant-scroll").scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => restaurantView.classList.add("shown")));
}

function closeRestaurant() {
  restaurantView.classList.remove("shown");
  window.setTimeout(() => {
    restaurantView.classList.remove("active");
    restaurantView.setAttribute("aria-hidden", "true");
  }, 320);
}

const merchantButton = document.getElementById("merchantButton");
merchantButton.addEventListener("click", openRestaurant);
merchantButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openRestaurant();
  }
});
document.getElementById("closeRestaurantBtn").addEventListener("click", closeRestaurant);

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

// Prevent Safari's double-tap page zoom while preserving ordinary taps and scrolling.
let lastTouchEnd = 0;
document.addEventListener("touchend", (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) event.preventDefault();
  lastTouchEnd = now;
}, { passive:false });
