function DashboardStats({ transactions }) {
  const expenses = transactions.filter(
    transaction => transaction.type === 'expense'
  )

  const largestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map(transaction => transaction.amount))
      : 0

  const averageExpense =
    expenses.length > 0
      ? expenses.reduce(
          (total, transaction) => total + transaction.amount,
          0
        ) / expenses.length
      : 0

  const categoryTotals = {}

  expenses.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = 0
    }

    categoryTotals[transaction.category] += transaction.amount
  })

  let topCategory = 'None'

  Object.keys(categoryTotals).forEach(category => {
    if (
      topCategory === 'None' ||
      categoryTotals[category] > categoryTotals[topCategory]
    ) {
      topCategory = category
    }
  })

  return (
    <div className="dashboard-stats">
      <h2>Quick Insights</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Transactions</p>
          <h3>{transactions.length}</h3>
        </div>

        <div className="stat-card">
          <p>Largest Expense</p>
          <h3>₹{largestExpense}</h3>
        </div>

        <div className="stat-card">
          <p>Top Category</p>
          <h3>{topCategory}</h3>
        </div>

        <div className="stat-card">
          <p>Average Expense</p>
          <h3>₹{Math.round(averageExpense)}</h3>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats