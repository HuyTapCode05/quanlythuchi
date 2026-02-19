import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Transactions from '../Transactions/Transactions'

export default function SearchPage({ transactions, categories, addTransaction, updateTransaction, deleteTransaction }) {
    const [params] = useSearchParams()
    const q = (params.get('q') || '').trim()

    // Memo to avoid needless rerenders when only other params change later
    const initialSearch = useMemo(() => q, [q])

    return (
        <Transactions
            transactions={transactions}
            categories={categories}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            initialSearch={initialSearch}
            mode="search"
        />
    )
}


