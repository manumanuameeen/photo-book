import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { walletApi, WalletDetails } from '../../../services/api/walletApi'
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/main/__layout/wallet')({
  component: WalletPage,
})

function WalletPage() {
  const { data: wallet, isLoading, isError } = useQuery<WalletDetails>({
    queryKey: ['wallet'],
    queryFn: walletApi.getWalletDetails,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-700" size={32} />
      </div>
    )
  }

  if (isError || !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
          <Wallet className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Wallet Unavailable</h2>
          <p className="text-gray-500">We couldn't load your wallet details at this time. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="bg-[#1E5631] h-16 w-full shadow-sm"></div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
          <p className="text-gray-500">Manage your balance and view transaction history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#1E5631] to-[#2a7a44] p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Wallet size={20} />
                <span className="text-sm font-medium tracking-wide uppercase">Total Balance</span>
              </div>
              <div className="text-4xl font-bold mb-6 tracking-tight">
                ${wallet.balance.toFixed(2)}
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-full"><ArrowDownLeft size={14} /></div>
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-bold">Income</p>
                    <p className="text-sm font-bold">
                      ${wallet.transactions
                        .filter(t => t.type === 'CREDIT' && t.status === 'COMPLETED')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-full"><ArrowUpRight size={14} /></div>
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-bold">Spent</p>
                    <p className="text-sm font-bold">
                      ${wallet.transactions
                        .filter(t => t.type === 'DEBIT' && t.status === 'COMPLETED')
                        .reduce((acc, curr) => acc + curr.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats or Actions (Placeholder for now, could be used for 'Withdraw' or 'Add Funds' later) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Payment Methods</h3>
            <p className="text-xs text-gray-500 mb-4">Manage your saved cards and bank accounts for withdrawals.</p>
            <button className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
              Manage Cards
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">Transaction History</h2>
          </div>

          {wallet.transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {wallet.transactions.slice().reverse().map((transaction, index) => (
                <div key={transaction.referenceId || index} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {transaction.type === 'CREDIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{format(new Date(transaction.date), 'PPP p')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-gray-800'
                      }`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${transaction.status === 'COMPLETED' ? 'text-green-500' :
                        transaction.status === 'PENDING' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
