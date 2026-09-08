function Summary({ income, expenses }) {
  return (
    <div className="summary">
      <div className="summary-card income">
        <p>Total Income</p>
        <h2>₹{income}</h2>
      </div>

      <div className="summary-card expense">
        <p>Total Expenses</p>
        <h2>₹{expenses}</h2>
      </div>
    </div>
  )
}

export default Summary