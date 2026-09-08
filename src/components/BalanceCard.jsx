function BalanceCard({ balance }) {
  return (
    <div className="balance">
      <p>Current Balance</p>
      <h2>₹{balance}</h2>
    </div>
  )
}

export default BalanceCard