import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  X,
  Save
} from 'lucide-react'

interface Debt {
  id: number
  title: string
  totalAmount: number
  installmentCount: number
  startDate: string
  interestRate?: number
  status: string
  summary?: {
    paidAmount: number
    remainingAmount: number
    paidInstallmentsCount: number
    remainingInstallmentsCount: number
  }
  installments?: Installment[]
}

interface Installment {
  id: number
  debtId: number
  debtTitle: string
  installmentNumber: number
  amount: number
  dueDate: string
  paid: boolean
  paidAt?: string
  isOverdue: boolean
}

export default function Admin() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/debts?includeInstallments=true')
      setDebts(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load debts. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading debts...
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Admin Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage debts and adjust payment installments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: 'var(--gradient-yellow)',
            color: 'var(--bg-dark)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} />
          Create New Debt
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(246, 70, 93, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Create Debt Form Modal */}
      {showCreateForm && (
        <CreateDebtForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchDebts()
          }}
        />
      )}

      {/* Edit Installment Modal */}
      {editingInstallment && (
        <EditInstallmentModal
          installment={editingInstallment}
          onClose={() => setEditingInstallment(null)}
          onSuccess={() => {
            setEditingInstallment(null)
            fetchDebts()
          }}
        />
      )}

      {/* Debts List */}
      {debts.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border)',
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No debts found. Create your first debt to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onViewInstallments={(debt) => setSelectedDebt(selectedDebt?.id === debt.id ? null : debt)}
              onEditInstallment={(inst) => setEditingInstallment(inst)}
              onDelete={async (id) => {
                if (confirm('Are you sure you want to delete this debt? This action cannot be undone.')) {
                  try {
                    await api.delete(`/api/admin/debts/${id}`)
                    // Immediately remove from UI for better UX
                    setDebts(prevDebts => prevDebts.filter(debt => debt.id !== id))
                    // Also refresh from server to ensure consistency
                    fetchDebts()
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Failed to delete debt')
                    // Refresh on error to ensure UI is in sync
                    fetchDebts()
                  }
                }
              }}
              onRefresh={fetchDebts}
            />
          ))}
        </div>
      )}

      {/* Installments View */}
      {selectedDebt && selectedDebt.installments && (
        <InstallmentsView
          debt={selectedDebt}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onClose={() => setSelectedDebt(null)}
          onEdit={(inst) => {
            setSelectedDebt(null)
            setEditingInstallment(inst)
          }}
        />
      )}
    </div>
  )
}

function CreateDebtForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [inputMode, setInputMode] = useState<'total' | 'monthly'>('monthly') // Default to monthly
  const [formData, setFormData] = useState({
    title: '',
    totalAmount: '',
    monthlyPaymentAmount: '',
    installmentCount: '',
    startDate: '',
    interestRate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Calculate preview
  const calculatedTotal = formData.monthlyPaymentAmount && formData.installmentCount
    ? (parseFloat(formData.monthlyPaymentAmount) * parseInt(formData.installmentCount)).toFixed(2)
    : ''
  const calculatedMonthly = formData.totalAmount && formData.installmentCount
    ? (parseFloat(formData.totalAmount) / parseInt(formData.installmentCount)).toFixed(2)
    : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        title: formData.title,
        installmentCount: parseInt(formData.installmentCount),
        startDate: formData.startDate,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
      }
      
      // Add either totalAmount or monthlyPaymentAmount based on input mode
      if (inputMode === 'monthly' && formData.monthlyPaymentAmount) {
        payload.monthlyPaymentAmount = Math.round(parseFloat(formData.monthlyPaymentAmount) * 100)
      } else if (inputMode === 'total' && formData.totalAmount) {
        payload.totalAmount = Math.round(parseFloat(formData.totalAmount) * 100)
      }
      
      await api.post('/api/admin/debts', payload)
      onSuccess()
      // Refresh the debts list after successful creation
      // onSuccess already calls fetchDebts, but this ensures it happens
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create debt')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid var(--border)',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Create New Debt</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Car Loan, Credit Card"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            {/* Input Mode Toggle */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-dark)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}>
              <button
                type="button"
                onClick={() => setInputMode('monthly')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: inputMode === 'monthly' ? 'rgba(240, 185, 11, 0.2)' : 'transparent',
                  border: `1px solid ${inputMode === 'monthly' ? 'var(--binance-yellow)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  color: inputMode === 'monthly' ? 'var(--binance-yellow)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: inputMode === 'monthly' ? '600' : '500',
                  fontSize: '0.9rem',
                }}
              >
                Monthly Payment
              </button>
              <button
                type="button"
                onClick={() => setInputMode('total')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: inputMode === 'total' ? 'rgba(240, 185, 11, 0.2)' : 'transparent',
                  border: `1px solid ${inputMode === 'total' ? 'var(--binance-yellow)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  color: inputMode === 'total' ? 'var(--binance-yellow)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: inputMode === 'total' ? '600' : '500',
                  fontSize: '0.9rem',
                }}
              >
                Total Amount
              </button>
            </div>

            {inputMode === 'monthly' ? (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                }}>
                  Monthly Payment Amount (TWD) *
                </label>
                <input
                  type="number"
                  required={inputMode === 'monthly'}
                  min="0"
                  step="0.01"
                  value={formData.monthlyPaymentAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyPaymentAmount: e.target.value })}
                  placeholder="2230.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                />
                {calculatedTotal && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(240, 185, 11, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--binance-yellow)',
                  }}>
                    💡 Total will be: ${calculatedTotal} ({formData.installmentCount || '?'} installments × ${formData.monthlyPaymentAmount || '0'})
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                }}>
                  Total Amount (TWD) *
                </label>
                <input
                  type="number"
                  required={inputMode === 'total'}
                  min="0"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="3000.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                />
                {calculatedMonthly && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(240, 185, 11, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--binance-yellow)',
                  }}>
                    💡 Monthly payment will be: ${calculatedMonthly} ({formData.totalAmount || '0'} ÷ {formData.installmentCount || '?'} installments)
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Number of Installments *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.installmentCount}
                onChange={(e) => setFormData({ ...formData, installmentCount: e.target.value })}
                placeholder="12"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Interest Rate (%) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="5.5"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--gradient-yellow)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-dark)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Creating...' : 'Create Debt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DebtCard({ 
  debt, 
  formatCurrency, 
  formatDate,
  onViewInstallments,
  onEditInstallment,
  onDelete,
  onRefresh,
}: { 
  debt: Debt
  formatCurrency: (n: number) => string
  formatDate: (s: string) => string
  onViewInstallments: (debt: Debt) => void
  onEditInstallment: (inst: Installment) => void
  onDelete: (id: number) => void
  onRefresh: () => void
}) {
  const progress = debt.summary 
    ? (debt.summary.paidAmount / debt.totalAmount) * 100 
    : 0

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {debt.title}
            </h3>
            <span style={{
              background: debt.status === 'ACTIVE' 
                ? 'rgba(240, 185, 11, 0.1)' 
                : 'rgba(14, 203, 129, 0.1)',
              border: `1px solid ${debt.status === 'ACTIVE' ? 'var(--binance-yellow)' : 'var(--success)'}`,
              borderRadius: '6px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: debt.status === 'ACTIVE' ? 'var(--binance-yellow)' : 'var(--success)',
            }}>
              {debt.status}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Total Amount
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'monospace' }}>
                {formatCurrency(debt.totalAmount)}
              </div>
            </div>
            {debt.summary && (
              <>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Paid
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--success)', fontFamily: 'monospace' }}>
                    {formatCurrency(debt.summary.paidAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Remaining
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--binance-yellow)', fontFamily: 'monospace' }}>
                    {formatCurrency(debt.summary.remainingAmount)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onViewInstallments(debt)}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-dark)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Eye size={16} />
            View
          </button>
          <button
            onClick={() => onDelete(debt.id)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(246, 70, 93, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {debt.summary && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            <span>Progress: {debt.summary.paidInstallmentsCount} / {debt.installmentCount} installments</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div style={{
            background: 'var(--bg-dark)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'var(--gradient-yellow)',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

function InstallmentsView({
  debt,
  formatCurrency,
  formatDate,
  onClose,
  onEdit,
}: {
  debt: Debt
  formatCurrency: (n: number) => string
  formatDate: (s: string) => string
  onClose: () => void
  onEdit: (inst: Installment) => void
}) {
  if (!debt.installments) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '900px',
        width: '100%',
        border: '1px solid var(--border)',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            Installments - {debt.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {debt.installments.map((inst) => (
            <div
              key={inst.id}
              style={{
                background: 'var(--bg-dark)',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Installment #{inst.installmentNumber}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Due: {formatDate(inst.dueDate)}
                </div>
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}>
                {formatCurrency(inst.amount)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {inst.paid ? (
                  <div style={{
                    background: 'rgba(14, 203, 129, 0.1)',
                    border: '1px solid var(--success)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    color: 'var(--success)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <CheckCircle2 size={14} />
                    Paid
                  </div>
                ) : inst.isOverdue ? (
                  <div style={{
                    background: 'rgba(246, 70, 93, 0.1)',
                    border: '1px solid var(--danger)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <AlertCircle size={14} />
                    Overdue
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(240, 185, 11, 0.1)',
                    border: '1px solid var(--binance-yellow)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    color: 'var(--binance-yellow)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <Clock size={14} />
                    Pending
                  </div>
                )}
                <button
                  onClick={() => onEdit(inst)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditInstallmentModal({
  installment,
  onClose,
  onSuccess,
}: {
  installment: Installment
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    amount: (installment.amount / 100).toFixed(2),
    dueDate: installment.dueDate,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {}
      if (formData.amount) {
        payload.amount = Math.round(parseFloat(formData.amount) * 100)
      }
      if (formData.dueDate) {
        payload.dueDate = formData.dueDate
      }
      await api.put(`/api/admin/installments/${installment.id}`, payload)
      onSuccess()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update installment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            Edit Installment #{installment.installmentNumber}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Amount (TWD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'var(--gradient-yellow)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-dark)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
