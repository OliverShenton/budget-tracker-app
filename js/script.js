// Array to store transactions
let transactions = [];

// DOM elements for budget summary
const totalIncomeElement = document.getElementById("total-income");
const totalExpenseElement = document.getElementById("total-expense");
const balanceElement = document.getElementById("balance");

// DOM elements for form and transaction list
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");

// Validate form inputs
function validateForm(description, amount, category, type) {
  if (!description || !amount || !category || !type || amount <= 0) {
    alert("Please fill in all fields with valid data.");
    return false;
  }
  return true;
}

// Transaction form
transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!validateForm(description, amount, category, type)) return;

  if (
    transactions.some(
      (t) =>
        t.description === description &&
        t.amount === amount &&
        t.category === category &&
        t.type === type
    )
  ) {
    alert("Transaction already exists.");
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    category,
    type,
  };

  transactions.push(transaction);

  updateUI();

  saveToLocalStorage();

  showToast("Transaction added successfully!");

  transactionForm.reset();
});

// Update budget summary
function updateBudgetSummary() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  totalIncomeElement.textContent = totalIncome.toFixed(2);
  totalExpenseElement.textContent = totalExpense.toFixed(2);
  balanceElement.textContent = balance.toFixed(2);
}

// Render transaction list
function renderTransactionList() {
  transactionList.innerHTML = "";
  if (transactions.length === 0) {
    transactionList.innerHTML = `<p>No transactions</p>`;
    return;
  }

  transactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.textContent = `${transaction.description}: ${transaction.amount.toFixed(2)} (${
      transaction.type
    })`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      const index = transactions.findIndex((t) => t.id === transaction.id);
      transactions.splice(index, 1);
      updateUI();
      saveToLocalStorage();
    });

    li.appendChild(deleteBtn);
    transactionList.appendChild(li);
  });
}

// Save to local storage
function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Load from local storage
function loadFromLocalStorage() {
  const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.push(...savedTransactions);
  updateUI();
}

// Get chart data
function getCategoryTotals() {
  const categoryTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === "expense") {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {});
  return categoryTotals;
}

// Render chart
let categoryChart;

function renderCategoryChart() {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  if (expenseTransactions.length === 0) {
    if (categoryChart) categoryChart.destroy();
    return;
  }

  const categoryTotals = getCategoryTotals();
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (categoryChart) categoryChart.destroy();

  const ctx = document.getElementById("category-chart").getContext("2d");
  categoryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }],
    },
    options: { responsive: true, plugins: { legend: { position: "top" } } },
  });
}

// Debounce user input
let debounceTimer;
transactionForm.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("Debounced Input Processing");
  }, 300);
});

// Feedback toast
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "1rem";
  toast.style.right = "1rem";
  toast.style.padding = "0.5rem 1rem";
  toast.style.backgroundColor = "#4caf50";
  toast.style.color = "white";
  toast.style.borderRadius = "5px";
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Dark mode toggle
const toggleButton = document.createElement("button");
toggleButton.textContent = "Toggle Dark Mode";
document.body.prepend(toggleButton);

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Update UI
function updateUI() {
  updateBudgetSummary();
  renderTransactionList();
  renderCategoryChart();
}

loadFromLocalStorage();
