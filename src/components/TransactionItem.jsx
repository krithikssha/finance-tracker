import { useState } from 'react'

function TransactionItem({
  transaction,
  deleteTransaction,
  editTransaction,
  duplicateTransaction
}) {
  const [showMenu, setShowMenu] = useState(false)

  const sign = transaction.type === 'income' ? '+' : '-'

  const formattedDate = new Date(transaction.date).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  )

  return (
    <div className="transaction-item">
      <div>
        <h3>{transaction.name}</h3>

        <p>
          {transaction.category} · {formattedDate}
        </p>
      </div>

      <div className="transaction-right">
        <strong className={transaction.type}>
          {sign} ₹{transaction.amount}
        </strong>

        <div className="action-menu">
          <button
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>

          {showMenu && (
            <div className="menu-dropdown">
              <button
                onClick={() => {
                  editTransaction(transaction)
                  setShowMenu(false)
                }}
              >
                Edit
              </button>

              <button
                onClick={() => {
                  duplicateTransaction(transaction)
                  setShowMenu(false)
                }}
              >
                Duplicate
              </button>

              <button
                className="menu-delete"
                onClick={() => {
                  deleteTransaction(transaction.id)
                  setShowMenu(false)
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionItem