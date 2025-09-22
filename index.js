let data = JSON.parse(localStorage.getItem("expenseData") || "{}");
let monthlyBudget = JSON.parse(localStorage.getItem("monthlyBudget") || "{}");

const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const amountEl = document.getElementById("amount");
const progressEl = document.getElementById("progress");
const setBudgetInput = document.getElementById("setBudget");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const addMoneyBtn = document.getElementById("addMoneyBtn");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amountInput");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");

let currentYear = new Date().getFullYear().toString();
let currentMonth = monthSelect.value;
let currentDay = new Date().getDate().toString();

// ---------- Populate Years ----------
function populateYears() {
  const thisYear = new Date().getFullYear();
  let options = "";
  for (let y = thisYear - 5; y <= thisYear + 5; y++) {
    options += `<option value="${y}">${y}</option>`;
  }
  yearSelect.innerHTML = options;
  yearSelect.value = currentYear;
}

// ---------- Populate Days ----------
function populateDays() {
  daySelect.innerHTML = "";
  const daysInMonth = new Date(
    parseInt(currentYear),
    monthSelect.selectedIndex + 1,
    0
  ).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    daySelect.innerHTML += `<option value="${d}">${d}</option>`;
  }
  daySelect.value = currentDay;
}

// ---------- Ensure daily structure ----------
function ensureDayData() {
  if (!data[currentYear]) data[currentYear] = {};
  if (!data[currentYear][currentMonth]) data[currentYear][currentMonth] = {};
  const daysInMonth = new Date(
    parseInt(currentYear),
    monthSelect.selectedIndex + 1,
    0
  ).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d.toString();
    if (!data[currentYear][currentMonth][dayStr]) {
      data[currentYear][currentMonth][dayStr] = { transactions: [] };
    }
  }
}

// ---------- Get Monthly Budget ----------
function getMonthlyBudget() {
  const key = `${currentYear}-${currentMonth}`;
  return monthlyBudget[key] || 0;
}

// ---------- Update UI ----------
function updateUI() {
  ensureDayData();
  const budget = getMonthlyBudget();
  const monthlySpent = getMonthlySpent(currentYear, currentMonth);
  const remaining = budget - monthlySpent;

  amountEl.textContent = `₹${remaining}`;
  const percent = budget > 0 ? (monthlySpent / budget) * 100 : 0;
  progressEl.style.width = `${Math.min(percent, 100)}%`;

  if (percent < 50) progressEl.style.background = "#00FF7F";
  else if (percent < 80) progressEl.style.background = "#FFD700";
  else progressEl.style.background = "#FF4444";

  // ---------- Budget Alerts ----------
  if (percent >= 50 && percent < 75 && !localStorage.getItem("alert50")) {
    showNotification("⚠️ Budget Alert", "You’ve spent 50% of your budget.");
    localStorage.setItem("alert50", "true");
  }
  if (percent >= 75 && percent < 100 && !localStorage.getItem("alert75")) {
    showNotification("⚠️ Budget Alert", "You’ve spent 75% of your budget.");
    localStorage.setItem("alert75", "true");
  }
  if (percent >= 100 && !localStorage.getItem("alert100")) {
    showNotification("🚨 Budget Exceeded", "You’ve crossed your budget limit!");
    localStorage.setItem("alert100", "true");
  }

  // Show all transactions of the month
  transactionList.innerHTML = "";
  if (data[currentYear] && data[currentYear][currentMonth]) {
    for (let d in data[currentYear][currentMonth]) {
      data[currentYear][currentMonth][d].transactions.forEach((t, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${t.day}/${t.month}/${t.year} - ${t.desc} - ₹${t.amount} 
          <button onclick="deleteTransaction('${d}', ${i})">X</button>`;
        transactionList.appendChild(li);
      });
    }
  }

  // Save after UI refresh
  localStorage.setItem("expenseData", JSON.stringify(data));
}

// ---------- Event Listeners ----------
yearSelect.addEventListener("change", () => {
  currentYear = yearSelect.value;
  ensureDayData();
  updateUI();
});

monthSelect.addEventListener("change", () => {
  currentMonth = monthSelect.value;
  populateDays();
  ensureDayData();
  updateUI();
});

daySelect.addEventListener("change", () => {
  currentDay = daySelect.value;
  ensureDayData();
  updateUI();
});

setBudgetBtn.addEventListener("click", () => {
  const key = `${currentYear}-${currentMonth}`;
  monthlyBudget[key] = parseInt(setBudgetInput.value) || 0;
  localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget));
  updateUI();
  alert(
    `Budget for ${currentMonth} ${currentYear} set as ₹${monthlyBudget[key]}`
  );
});

addMoneyBtn.addEventListener("click", () => {
  const key = `${currentYear}-${currentMonth}`;
  const extra = parseInt(setBudgetInput.value) || 0;
  if (extra > 0) {
    monthlyBudget[key] = getMonthlyBudget() + extra;
    localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget));
    updateUI();
    alert(`Added ₹${extra} to ${currentMonth} ${currentYear}`);
  } else {
    alert("Enter an amount in the box to add money.");
  }
});

addBtn.addEventListener("click", () => {
  const desc = descInput.value;
  const amt = parseInt(amountInput.value);
  if (desc && amt) {
    data[currentYear][currentMonth][currentDay].transactions.push({
      desc,
      amount: amt,
      day: parseInt(currentDay),
      month: currentMonth,
      year: parseInt(currentYear),
    });
    localStorage.setItem("expenseData", JSON.stringify(data)); // ✅ Save immediately
    updateUI();
  }
  descInput.value = "";
  amountInput.value = "";

  if (data[currentYear][currentMonth][currentDay].transactions.length === 5) {
    unlockAchievement("Logged 5 Expenses in a Day!");
  }
  if (getMonthlySpent(currentYear, currentMonth) >= 1000) {
    unlockAchievement("Spent ₹1000 this month!");
  }
});

function deleteTransaction(day, index) {
  data[currentYear][currentMonth][day].transactions.splice(index, 1);
  localStorage.setItem("expenseData", JSON.stringify(data));
  updateUI();
}

// ---------- INIT ----------
populateYears();
populateDays();
ensureDayData();
updateUI();

// ---------- Helpers ----------
function getMonthlySpent(year, month) {
  let total = 0;
  if (data[year] && data[year][month]) {
    for (let d in data[year][month]) {
      total += data[year][month][d].transactions.reduce(
        (acc, t) => acc + t.amount,
        0
      );
    }
  }
  return total;
}

setInterval(() => {
  let now = new Date();
  if (now.getHours() === 21 && now.getMinutes() === 0) {
    showNotification("💡 Reminder", "Don’t forget to log your expenses today!");
  }
}, 60000); // check every minute

let achievements = JSON.parse(localStorage.getItem("achievements")) || [];

function unlockAchievement(name) {
  if (!achievements.includes(name)) {
    achievements.push(name);
    localStorage.setItem("achievements", JSON.stringify(achievements));
    showNotification("🎉 Achievement Unlocked!", name);
  }
}

function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body: message });
      }
    });
  }
}
