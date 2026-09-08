import TransactionItem from './TransactionItem'

function TransactionList({
  transactions,
  deleteTransaction,
  editTransaction,
  duplicateTransaction
}) {
  return (
    <div className="transaction-list">
      <h2>Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        transactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            deleteTransaction={deleteTransaction}
            editTransaction={editTransaction}
            duplicateTransaction={duplicateTransaction}
          />
        ))
      )}
    </div>
  )
}

export default TransactionList