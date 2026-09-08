import { useEffect, useState } from 'react'

function TransactionForm({
  setTransactions,
  editingTransaction,
  updateTransaction,
  cancelEdit
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('food')

  useEffect(() => {
    if (editingTransaction) {
      setName(editingTransaction.name)
      setAmount(editingTransaction.amount)
      setType(editingTransaction.type)
      setCategory(editingTransaction.category)
    }
  }, [editingTransaction])

  function handleSubmit(event) {
    event.preventDefault()

    if (!name || !amount) {
      return
    }

    if (editingTransaction) {
      const updatedTransaction = {
        id: editingTransaction.id,
        name: name,
        amount: Number(amount),
        type: type,
        category: category,
        date: editingTransaction.date
      }

      updateTransaction(updatedTransaction)
    } else {
      const newTransaction = {
        id: Date.now(),
        name: name,
        amount: Number(amount),
        type: type,
        category: category,
        date: new Date().toISOString()
      }

      setTransactions(prevTransactions => [
        ...prevTransactions,
        newTransaction
      ])
    }

    setName('')
    setAmount('')
    setType('expense')
    setCategory('food')
  }

  return (
    <div className="transaction-form">
      <h2>
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Transaction name"
          value={name}
          onChange={event => setName(event.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />

        <div className="form-row">
          <select
            value={type}
            onChange={event => setType(event.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit">
          {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
        </button>

        {editingTransaction && (
          <button
            type="button"
            className="cancel-button"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}

export default TransactionForm