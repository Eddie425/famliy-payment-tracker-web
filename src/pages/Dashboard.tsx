import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Wallet
} from 'lucide-react'

interface DashboardSummary {
  summary: {
    totalPaid: number
    totalOutstanding: number
    totalAmount: number
    progressPercentage: number
    activeDebtsCount: number
    completedDebtsCount: number
  }
  monthlyBreakdown: Array<{
    month: string
    monthLabel: string
    totalDue: number
    totalPaid: number
    remaining: number
    isComplete: boolean
    installments: Array<{
      installmentId: number
      debtTitle: string
      amount: number
      dueDate: string
      paid: boolean
      paidAt: string | null
      isOverdue: boolean
    }>
  }>
  debtBreakdown: Array<{
    debtId: number
    title: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    progressPercentage: number
    status: string
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/dashboard/summary')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running on http://localhost:8080')
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
      maximumFractionDigits: 0,
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontSize: '1.2rem' }}>Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--danger)',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem auto',
      }}>
        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { summary, monthlyBreakdown } = data
  
  // Get current and upcoming months
  const currentMonth = monthlyBreakdown.find(m => !m.isComplete) || monthlyBreakdown[0]
  const upcomingMonths = monthlyBreakdown.filter(m => !m.isComplete && m.remaining > 0).slice(0, 6)

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Payment Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track your family's payment progress and upcoming installments
        </p>
      </div>

      {/* Summary Cards - Binance Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <SummaryCard
          icon={<Wallet size={24} />}
          title="Total Outstanding"
          value={formatCurrency(summary.totalOutstanding)}
          subtitle="Remaining to pay"
          color="var(--binance-yellow)"
          trend="outstanding"
        />
        <SummaryCard
          icon={<CheckCircle2 size={24} />}
          title="Total Paid"
          value={formatCurrency(summary.totalPaid)}
          subtitle={`${summary.progressPercentage.toFixed(1)}% complete`}
          color="var(--success)"
          trend="paid"
        />
        <SummaryCard
          icon={<Calendar size={24} />}
          title="Active Debts"
          value={summary.activeDebtsCount.toString()}
          subtitle={`${summary.completedDebtsCount} completed`}
          color="var(--info)"
          trend="neutral"
        />
        <SummaryCard
          icon={<TrendingUp size={24} />}
          title="Total Amount"
          value={formatCurrency(summary.totalAmount)}
          subtitle="All debts combined"
          color="var(--text-secondary)"
          trend="neutral"
        />
      </div>

      {/* Current Month Payment - Prominent Display */}
      {currentMonth && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}>
                {currentMonth.monthLabel}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Current payment period
              </p>
            </div>
            {currentMonth.isComplete ? (
              <div style={{
                background: 'rgba(14, 203, 129, 0.1)',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'var(--success)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <CheckCircle2 size={18} />
                All Paid
              </div>
            ) : (
              <div style={{
                background: 'rgba(240, 185, 11, 0.1)',
                border: '1px solid var(--binance-yellow)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'var(--binance-yellow)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Clock size={18} />
                Pending
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <PaymentStat
              label="Total Due"
              value={formatCurrency(currentMonth.totalDue)}
              color="var(--text-primary)"
            />
            <PaymentStat
              label="Paid"
              value={formatCurrency(currentMonth.totalPaid)}
              color="var(--success)"
            />
            <PaymentStat
              label="Remaining"
              value={formatCurrency(currentMonth.remaining)}
              color="var(--binance-yellow)"
            />
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              <span>Payment Progress</span>
              <span>
                {currentMonth.totalDue > 0 
                  ? ((currentMonth.totalPaid / currentMonth.totalDue) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
            <div style={{
              background: 'var(--bg-dark)',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                background: currentMonth.isComplete 
                  ? 'var(--gradient-success)' 
                  : 'var(--gradient-yellow)',
                height: '100%',
                width: `${currentMonth.totalDue > 0 
                  ? (currentMonth.totalPaid / currentMonth.totalDue) * 100 
                  : 0}%`,
                transition: 'width 0.5s ease',
                borderRadius: '8px',
              }} />
            </div>
          </div>

          {/* Installments List */}
          {currentMonth.installments && currentMonth.installments.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}>
                Installments This Month
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentMonth.installments.map((inst) => (
                  <InstallmentRow key={inst.installmentId} installment={inst} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Months */}
      {upcomingMonths.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
          }}>
            Upcoming Payments
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingMonths.map((month) => (
              <MonthCard key={month.month} month={month} formatCurrency={formatCurrency} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: string
  trend: string
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      transition: 'all 0.2s',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-card)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bg-card-hover)'
      e.currentTarget.style.borderColor = 'var(--border-light)'
      e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--bg-card)'
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.boxShadow = 'var(--shadow-card)'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ color }}>{icon}</div>
        <h3 style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.85rem', 
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </h3>
      </div>
      <div style={{ 
        fontSize: '1.75rem', 
        fontWeight: '700', 
        color: 'var(--text-primary)',
        marginBottom: '0.25rem',
        fontFamily: 'monospace',
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '0.85rem', 
        color: 'var(--text-muted)',
      }}>
        {subtitle}
      </div>
    </div>
  )
}

function PaymentStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div>
      <div style={{ 
        fontSize: '0.85rem', 
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '1.5rem', 
        fontWeight: '700', 
        color,
        fontFamily: 'monospace',
      }}>
        {value}
      </div>
    </div>
  )
}

function InstallmentRow({ 
  installment, 
  formatCurrency, 
  formatDate 
}: { 
  installment: any
  formatCurrency: (n: number) => string
  formatDate: (s: string) => string
}) {
  return (
    <div style={{
      background: 'var(--bg-dark)',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ 
          fontWeight: '600', 
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          {installment.debtTitle}
        </div>
        <div style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
        }}>
          Due: {formatDate(installment.dueDate)}
        </div>
      </div>
      <div style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
      }}>
        {formatCurrency(installment.amount)}
      </div>
      <div>
        {installment.paid ? (
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
        ) : installment.isOverdue ? (
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
      </div>
    </div>
  )
}

function MonthCard({ 
  month, 
  formatCurrency 
}: { 
  month: any
  formatCurrency: (n: number) => string
}) {
  const progress = month.totalDue > 0 ? (month.totalPaid / month.totalDue) * 100 : 0
  
  return (
    <div style={{
      background: 'var(--bg-dark)',
      borderRadius: '12px',
      padding: '1.25rem',
      border: '1px solid var(--border)',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-light)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border)'
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1.1rem',
            marginBottom: '0.25rem',
          }}>
            {month.monthLabel}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            {formatCurrency(month.remaining)} remaining
          </div>
        </div>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--binance-yellow)',
          fontFamily: 'monospace',
        }}>
          {formatCurrency(month.totalDue)}
        </div>
      </div>
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '6px',
          height: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            background: month.isComplete 
              ? 'var(--gradient-success)' 
              : 'var(--gradient-yellow)',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    </div>
  )
}


