// ---------- Data ----------
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let monthlyBudget = parseInt(localStorage.getItem("monthlyBudget")) || 0;
let savingsGoal = JSON.parse(localStorage.getItem("savingsGoal")) || { name: "", amount: 0 };

// ---------- Elements ----------
const amountEl = document.getElementById("amount");
const setBudgetInput = document.getElementById("setBudget");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const addMoneyBtn = document.getElementById("addMoneyBtn");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amountInput");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");
const goalNameInput = document.getElementById("goalName");
const goalAmountInput = document.getElementById("goalAmount");
const setGoalBtn = document.getElementById("setGoalBtn");
const goalLabel = document.getElementById("goalLabel");
const goalProgress = document.getElementById("goalProgress");

// ---------- Event Listeners ----------
// Set Monthly Budget
setBudgetBtn.addEventListener("click", () => {
  monthlyBudget = parseInt(setBudgetInput.value) || 0;
  localStorage.setItem("monthlyBudget", monthlyBudget);
  updateUI();
  alert(`Budget set: ₹${monthlyBudget}`);
});

// Add Extra Money to Budget
addMoneyBtn.addEventListener("click", () => {
  const extra = parseInt(setBudgetInput.value) || 0;
  if (extra > 0) {
    monthlyBudget += extra;
    localStorage.setItem("monthlyBudget", monthlyBudget);
    updateUI();
    alert(`Added ₹${extra} to budget. New budget: ₹${monthlyBudget}`);
  } else {
    alert("Enter a valid amount to add.");
  }
});

// Add Transaction
addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amt = parseInt(amountInput.value);
  if (desc && amt > 0) {
    const date = new Date().toLocaleDateString();
    transactions.push({ desc, amount: amt, date });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    console.log("Transaction Added:", transactions);
    updateUI();
  } else {
    alert("Please enter valid details.");
  }
  descInput.value = "";
  amountInput.value = "";
});

// Set Savings Goal
setGoalBtn.addEventListener("click", () => {
  const name = goalNameInput.value.trim();
  const amount = parseInt(goalAmountInput.value);

  if (name && amount > 0) {
    savingsGoal = { name, amount };
    localStorage.setItem("savingsGoal", JSON.stringify(savingsGoal));
    updateUI();
    alert(`Savings goal set: ${name} (₹${amount})`);
  } else {
    alert("Please enter a valid goal name and amount.");
  }
});

// ---------- Delete Transaction ----------
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// ---------- Update UI ----------
function updateUI() {
  // Calculate spent and remaining
  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyBudget - spent;
  amountEl.textContent = `₹${remaining >= 0 ? remaining : 0}`;

  // Show transactions
  transactionList.innerHTML = "";
  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.textContent = `${t.date}: ${t.desc} - ₹${t.amount} `;

    // delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.style.cursor = "pointer";
    delBtn.addEventListener("click", () => deleteTransaction(index));

    li.appendChild(delBtn);
    transactionList.appendChild(li);
  });

  // Update savings goal progress
  updateGoalProgress(remaining);
}

// ---------- Update Goal Progress ----------
function updateGoalProgress(remaining) {
  if (savingsGoal.amount > 0) {
    const percent = Math.min((remaining / savingsGoal.amount) * 100, 100);
    goalLabel.textContent = `${savingsGoal.name} - ₹${remaining} / ₹${savingsGoal.amount}`;
    goalProgress.style.width = `${percent}%`;

    if (remaining >= savingsGoal.amount) {
      alert(`🎉 Goal Achieved: ${savingsGoal.name}!`);
    }
  } else {
    goalLabel.textContent = "No goal set yet.";
    goalProgress.style.width = "0%";
  }
}

// ---------- INIT ----------
updateUI();
