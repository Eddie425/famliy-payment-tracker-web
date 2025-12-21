export default function Admin() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Panel</h1>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Admin features coming soon...
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>
          This will include: Create debts, manage installments, adjust payments
        </p>
      </div>
    </div>
  )
}
