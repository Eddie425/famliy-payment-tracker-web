import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react'

interface DashboardSummary {
  summary: {
    totalPaid: number
    totalOutstanding: number
    totalAmount: number
    progressPercentage: number
    activeDebtsCount: number
    completedDebtsCount: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/summary')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running on http://localhost:8080')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--danger)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { summary } = data
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount / 100) // Assuming amounts are in cents
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <Card
          icon={<DollarSign size={24} />}
          title="Total Paid"
          value={formatCurrency(summary.totalPaid)}
          color="var(--success)"
        />
        <Card
          icon={<TrendingUp size={24} />}
          title="Total Outstanding"
          value={formatCurrency(summary.totalOutstanding)}
          color="var(--warning)"
        />
        <Card
          icon={<Calendar size={24} />}
          title="Active Debts"
          value={summary.activeDebtsCount.toString()}
          color="var(--primary)"
        />
        <Card
          icon={<DollarSign size={24} />}
          title="Progress"
          value={`${summary.progressPercentage.toFixed(1)}%`}
          color="var(--primary-dark)"
        />
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Payment Progress</h2>
        <div style={{
          background: 'var(--bg-dark)',
          borderRadius: '8px',
          height: '24px',
          overflow: 'hidden',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            height: '100%',
            width: `${summary.progressPercentage}%`,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
        }}>
          <span>{formatCurrency(summary.totalPaid)} paid</span>
          <span>{formatCurrency(summary.totalAmount)} total</span>
        </div>
      </div>
    </div>
  )
}

function Card({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ color }}>{icon}</div>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'normal' }}>
          {title}
        </h3>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}
