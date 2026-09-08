import { useEffect, useState } from 'react'
import Header from './components/Header'
import BalanceCard from './components/BalanceCard'
import Summary from './components/Summary'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import SpendingBreakdown from './components/SpendingBreakdown'
import DashboardStats from './components/DashboardStats'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('currentUser') || ''
  )

  const [isSignup, setIsSignup] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [transactions, setTransactions] = useState([])

  const [page, setPage] = useState('dashboard')

  const [editingTransaction, setEditingTransaction] =
    useState(null)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const [dateFilter, setDateFilter] = useState('all')

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  )

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem(
      `budget_${localStorage.getItem('currentUser')}`
    )

    return savedBudget ? Number(savedBudget) : 10000
  })

  const [budgetInput, setBudgetInput] = useState('')

  useEffect(() => {
    if (!currentUser) {
      setTransactions([])
      return
    }

    const savedTransactions = localStorage.getItem(
      `transactions_${currentUser}`
    )

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    } else {
      setTransactions([])
    }

    const savedBudget = localStorage.getItem(
      `budget_${currentUser}`
    )

    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget))
    } else {
      setMonthlyBudget(10000)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    localStorage.setItem(
      `transactions_${currentUser}`,
      JSON.stringify(transactions)
    )
  }, [transactions, currentUser])

  useEffect(() => {
    document.body.classList.toggle(
      'dark-mode',
      darkMode
    )

    localStorage.setItem(
      'darkMode',
      darkMode
    )
  }, [darkMode])

  function handleAuth(event) {
    event.preventDefault()

    if (!username || !password) {
      alert('Please enter username and password.')
      return
    }

    const users = JSON.parse(
      localStorage.getItem('finance_users') || '{}'
    )

    if (isSignup) {
      if (users[username]) {
        alert('Username already exists.')
        return
      }

      users[username] = {
        password: password
      }

      localStorage.setItem(
        'finance_users',
        JSON.stringify(users)
      )

      localStorage.setItem(
        `transactions_${username}`,
        JSON.stringify([])
      )

      localStorage.setItem(
        `budget_${username}`,
        '10000'
      )

      setCurrentUser(username)

      localStorage.setItem(
        'currentUser',
        username
      )

      setUsername('')
      setPassword('')
    } else {
      if (!users[username]) {
        alert('User not found. Please sign up first.')
        return
      }

      if (users[username].password !== password) {
        alert('Incorrect password.')
        return
      }

      setCurrentUser(username)

      localStorage.setItem(
        'currentUser',
        username
      )

      setUsername('')
      setPassword('')
    }
  }

  function handleLogout() {
    setCurrentUser('')

    localStorage.removeItem('currentUser')

    setPage('dashboard')
    setEditingTransaction(null)
  }

  function deleteTransaction(id) {
    setTransactions(prevTransactions =>
      prevTransactions.filter(
        transaction => transaction.id !== id
      )
    )
  }

  function editTransaction(transaction) {
    setEditingTransaction(transaction)
    setPage('transactions')
  }

  function updateTransaction(updatedTransaction) {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    )

    setEditingTransaction(null)
  }

  function cancelEdit() {
    setEditingTransaction(null)
  }

  function duplicateTransaction(transaction) {
    const duplicatedTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString()
    }

    setTransactions(prevTransactions => [
      ...prevTransactions,
      duplicatedTransaction
    ])
  }

  function saveBudget(event) {
    event.preventDefault()

    const amount = Number(budgetInput)

    if (!amount || amount <= 0) {
      alert('Please enter a valid budget.')
      return
    }

    setMonthlyBudget(amount)

    localStorage.setItem(
      `budget_${currentUser}`,
      String(amount)
    )

    setBudgetInput('')
  }

  function getDateWithoutTime(date) {
    const newDate = new Date(date)

    return new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate()
    )
  }

  function getFilteredTransactions() {
    const now = new Date()

    return transactions.filter(transaction => {
      const transactionDate = transaction.date
        ? getDateWithoutTime(transaction.date)
        : new Date()

      let matchesDate = true

      if (dateFilter === 'this-month') {
        matchesDate =
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() ===
            now.getFullYear()
      }

      if (dateFilter === 'last-month') {
        const lastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        )

        matchesDate =
          transactionDate.getMonth() ===
            lastMonth.getMonth() &&
          transactionDate.getFullYear() ===
            lastMonth.getFullYear()
      }

      const matchesSearch =
        transaction.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.category
          ?.toLowerCase()
          .includes(search.toLowerCase())

      const matchesType =
        filterType === 'all' ||
        transaction.type === filterType

      const matchesCategory =
        filterCategory === 'all' ||
        transaction.category === filterCategory

      return (
        matchesDate &&
        matchesSearch &&
        matchesType &&
        matchesCategory
      )
    })
  }

  const filteredTransactions =
    getFilteredTransactions()

  const income = filteredTransactions
    .filter(
      transaction => transaction.type === 'income'
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    )

  const expenses = filteredTransactions
    .filter(
      transaction => transaction.type === 'expense'
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    )

  const balance = income - expenses

  const budgetUsed =
    monthlyBudget > 0
      ? (expenses / monthlyBudget) * 100
      : 0

  const budgetRemaining =
    monthlyBudget - expenses

  let financialHealth = 'Excellent'
  let healthClass = 'excellent'

  if (budgetUsed >= 90) {
    financialHealth = 'Critical'
    healthClass = 'critical'
  } else if (budgetUsed >= 70) {
    financialHealth = 'Needs Attention'
    healthClass = 'warning'
  } else if (budgetUsed >= 50) {
    financialHealth = 'Good'
    healthClass = 'good'
  }

  function exportCSV() {
    if (filteredTransactions.length === 0) {
      alert('There are no transactions to export.')
      return
    }

    const headers = [
      'Name',
      'Amount',
      'Type',
      'Category',
      'Date'
    ]

    const rows = filteredTransactions.map(
      transaction => [
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.date
          ? new Date(
              transaction.date
            ).toLocaleDateString('en-IN')
          : ''
      ]
    )

    const csvContent = [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(value =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv'
      }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download =
      'finance-transactions.csv'

    link.click()

    URL.revokeObjectURL(url)
  }

  if (!currentUser) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">
            ₹
          </div>

          <h1>
            Finance Tracker
          </h1>

          <p className="login-subtitle">
            Manage your money smarter.
          </p>

          <form onSubmit={handleAuth}>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={event =>
                setUsername(
                  event.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={event =>
                setPassword(
                  event.target.value
                )
              }
            />

            <button type="submit">
              {isSignup
                ? 'Create Account'
                : 'Login'}
            </button>

          </form>

          <button
            className="auth-switch"
            onClick={() =>
              setIsSignup(!isSignup)
            }
          >
            {isSignup
              ? 'Already have an account? Login'
              : "Don't have an account? Sign Up"}
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            ₹
          </div>

          <div>
            <h1>Finance</h1>
            <span>Tracker</span>
          </div>

        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">

          <button
            className={
              page === 'dashboard'
                ? 'sidebar-item active'
                : 'sidebar-item'
            }
            onClick={() => {
              setPage('dashboard')
              setEditingTransaction(null)
            }}
          >
            <span className="sidebar-icon">
              ▦
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            className={
              page === 'transactions'
                ? 'sidebar-item active'
                : 'sidebar-item'
            }
            onClick={() =>
              setPage('transactions')
            }
          >
            <span className="sidebar-icon">
              ≡
            </span>

            <span>
              Transactions
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            <span>
              {darkMode ? '☀' : '☾'}
            </span>

            <span>
              {darkMode
                ? 'Light Mode'
                : 'Dark Mode'}
            </span>
          </button>

          <div className="sidebar-user">

            <div className="user-avatar">
              {currentUser
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="sidebar-user-info">

              <span>
                Signed in as
              </span>

              <strong>
                {currentUser}
              </strong>

            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        {page === 'dashboard' && (

          <>

            <div className="page-heading">

              <div>
                <span className="eyebrow">
                  OVERVIEW
                </span>

                <h1>
                  Welcome back, {currentUser}
                </h1>

                <p>
                  Here's your financial overview.
                </p>
              </div>

              <div className="date-filter-wrapper">

                <span className="filter-icon">
                  ◷
                </span>

                <select
                  className="date-filter"
                  value={dateFilter}
                  onChange={event =>
                    setDateFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Time
                  </option>

                  <option value="this-month">
                    This Month
                  </option>

                  <option value="last-month">
                    Last Month
                  </option>
                </select>

              </div>

            </div>

            <Header />

            <BalanceCard
              balance={balance}
            />

            <Summary
              income={income}
              expenses={expenses}
            />

            <div className="budget-card">

              <div className="budget-top">

                <div>
                  <span className="card-label">
                    MONTHLY BUDGET
                  </span>

                  <h2>
                    ₹{monthlyBudget}
                  </h2>
                </div>

                <div
                  className={
                    budgetUsed >= 90
                      ? 'budget-status danger'
                      : budgetUsed >= 70
                        ? 'budget-status warning'
                        : 'budget-status'
                  }
                >
                  {Math.round(
                    budgetUsed
                  )}
                  % used
                </div>

              </div>

              <div className="budget-progress">

                <div
                  className={
                    budgetUsed >= 90
                      ? 'budget-progress-fill danger'
                      : budgetUsed >= 70
                        ? 'budget-progress-fill warning'
                        : 'budget-progress-fill'
                  }
                  style={{
                    width: `${Math.min(
                      budgetUsed,
                      100
                    )}%`
                  }}
                />

              </div>

              <div className="budget-bottom">

                <span>
                  {budgetRemaining >= 0
                    ? `₹${budgetRemaining} remaining`
                    : `₹${Math.abs(
                        budgetRemaining
                      )} over budget`}
                </span>

                <form
                  onSubmit={saveBudget}
                  className="budget-form"
                >

                  <input
                    type="number"
                    placeholder="New budget"
                    value={budgetInput}
                    onChange={event =>
                      setBudgetInput(
                        event.target.value
                      )
                    }
                  />

                  <button type="submit">
                    Set Budget
                  </button>

                </form>

              </div>

              {budgetUsed >= 90 && (
                <div className="budget-warning danger">
                  ⚠ You are very close to your
                  monthly spending limit.
                </div>
              )}

              {budgetUsed >= 70 &&
                budgetUsed < 90 && (
                  <div className="budget-warning">
                    ⚠ Your spending has crossed
                    70% of your monthly budget.
                  </div>
                )}

            </div>

            <div className="health-card">

              <div>

                <span className="card-label">
                  FINANCIAL HEALTH
                </span>

                <h2>
                  {financialHealth}
                </h2>

                <p>
                  Based on your current
                  spending compared with
                  your budget.
                </p>

              </div>

              <div
                className={`health-indicator ${healthClass}`}
              >
                {Math.round(
                  Math.min(
                    budgetUsed,
                    100
                  )
                )}
                %
              </div>

            </div>

            <SpendingBreakdown
              transactions={
                filteredTransactions
              }
            />

            <div className="income-expense-card">

              <div className="chart-header">

                <div>
                  <h2>
                    Income vs Expenses
                  </h2>

                  <p>
                    Financial activity by
                    category
                  </p>
                </div>

                <div className="chart-legend">

                  <span>
                    <i className="legend-income" />
                    Income
                  </span>

                  <span>
                    <i className="legend-expense" />
                    Expenses
                  </span>

                </div>

              </div>

              <IncomeExpenseChart
                transactions={
                  filteredTransactions
                }
              />

            </div>

            <DashboardStats
              transactions={
                filteredTransactions
              }
            />

          </>

        )}

        {page === 'transactions' && (

          <>

            <div className="page-heading">

              <div>
                <span className="eyebrow">
                  MONEY MANAGEMENT
                </span>

                <h1>
                  Transactions
                </h1>

                <p>
                  Add, manage and track your
                  transactions.
                </p>
              </div>

              <button
                className="export-button"
                onClick={exportCSV}
              >
                ↓ Export CSV
              </button>

            </div>

            <TransactionForm
              setTransactions={
                setTransactions
              }
              editingTransaction={
                editingTransaction
              }
              updateTransaction={
                updateTransaction
              }
              cancelEdit={
                cancelEdit
              }
            />

            <div className="transaction-controls">

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              <select
                value={filterType}
                onChange={event =>
                  setFilterType(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Types
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expense
                </option>
              </select>

              <select
                value={filterCategory}
                onChange={event =>
                  setFilterCategory(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Categories
                </option>

                <option value="food">
                  Food
                </option>

                <option value="travel">
                  Travel
                </option>

                <option value="shopping">
                  Shopping
                </option>

                <option value="education">
                  Education
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              <select
                value={dateFilter}
                onChange={event =>
                  setDateFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Time
                </option>

                <option value="this-month">
                  This Month
                </option>

                <option value="last-month">
                  Last Month
                </option>
              </select>

            </div>

            <TransactionList
              transactions={
                filteredTransactions
              }
              deleteTransaction={
                deleteTransaction
              }
              editTransaction={
                editTransaction
              }
              duplicateTransaction={
                duplicateTransaction
              }
            />

          </>

        )}

      </main>

    </div>
  )
}


function IncomeExpenseChart({
  transactions
}) {
  const categories = [
    'food',
    'travel',
    'shopping',
    'education',
    'other'
  ]

  const values = categories.map(
    category => {

      const income = transactions
        .filter(
          transaction =>
            transaction.category ===
              category &&
            transaction.type ===
              'income'
        )
        .reduce(
          (sum, transaction) =>
            sum + transaction.amount,
          0
        )

      const expense = transactions
        .filter(
          transaction =>
            transaction.category ===
              category &&
            transaction.type ===
              'expense'
        )
        .reduce(
          (sum, transaction) =>
            sum + transaction.amount,
          0
        )

      return {
        category,
        income,
        expense
      }
    }
  )

  const maxValue = Math.max(
    ...values.flatMap(item => [
      item.income,
      item.expense
    ]),
    100
  )

  const width = 800
  const height = 300

  const paddingLeft = 55
  const paddingRight = 25
  const paddingTop = 25
  const paddingBottom = 55

  const graphWidth =
    width -
    paddingLeft -
    paddingRight

  const graphHeight =
    height -
    paddingTop -
    paddingBottom

  const incomePoints =
    values.map(
      (item, index) => {

        const x =
          paddingLeft +
          (index /
            (categories.length - 1)) *
            graphWidth

        const y =
          paddingTop +
          graphHeight -
          (item.income /
            maxValue) *
            graphHeight

        return `${x},${y}`
      }
    )

  const expensePoints =
    values.map(
      (item, index) => {

        const x =
          paddingLeft +
          (index /
            (categories.length - 1)) *
            graphWidth

        const y =
          paddingTop +
          graphHeight -
          (item.expense /
            maxValue) *
            graphHeight

        return `${x},${y}`
      }
    )

  return (
    <div className="line-chart">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >

        {[0, 25, 50, 75, 100].map(
          value => {

            const y =
              paddingTop +
              graphHeight -
              (value / 100) *
                graphHeight

            return (
              <line
                key={value}
                x1={paddingLeft}
                y1={y}
                x2={
                  width -
                  paddingRight
                }
                y2={y}
                className="chart-grid-line"
              />
            )
          }
        )}

        <polyline
          points={incomePoints.join(
            ' '
          )}
          className="income-line"
          fill="none"
        />

        <polyline
          points={expensePoints.join(
            ' '
          )}
          className="expense-line"
          fill="none"
        />

        {values.map(
          (item, index) => {

            const x =
              paddingLeft +
              (index /
                (categories.length - 1)) *
                graphWidth

            const incomeY =
              paddingTop +
              graphHeight -
              (item.income /
                maxValue) *
                graphHeight

            const expenseY =
              paddingTop +
              graphHeight -
              (item.expense /
                maxValue) *
                graphHeight

            return (
              <g
                key={item.category}
              >

                <circle
                  cx={x}
                  cy={incomeY}
                  r="5"
                  className="income-point"
                />

                <circle
                  cx={x}
                  cy={expenseY}
                  r="5"
                  className="expense-point"
                />

                <text
                  x={x}
                  y={height - 18}
                  textAnchor="middle"
                  className="chart-x-label"
                >
                  {item.category}
                </text>

              </g>
            )
          }
        )}

      </svg>

    </div>
  )
}

export default App