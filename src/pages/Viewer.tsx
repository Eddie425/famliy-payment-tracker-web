export default function Viewer() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Viewer Mode</h1>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Viewer features coming soon...
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>
          This will include: View payment list, mark installments as paid
        </p>
      </div>
    </div>
  )
}






