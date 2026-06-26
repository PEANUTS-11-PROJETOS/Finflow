export default function RootLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F1E8',
        gap: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Ícone */}
      <div style={{
        width: 88,
        height: 88,
        borderRadius: 20,
        backgroundColor: '#232830',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(35,40,48,0.18)',
        animation: 'pulse 1.8s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 512 512" width="52" height="52">
          <rect x="130" y="110" width="76" height="292" rx="10" fill="#F5F1E8"/>
          <rect x="130" y="110" width="260" height="76" rx="10" fill="#F5F1E8"/>
          <rect x="130" y="228" width="192" height="68" rx="10" fill="#F5F1E8"/>
          <circle cx="380" cy="360" r="38" fill="#4A8C5C"/>
        </svg>
      </div>

      {/* Nome */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 26,
          fontWeight: 400,
          color: '#232830',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Finflow
        </p>
        <p style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          color: '#8A8A8A',
          margin: '4px 0 0',
          letterSpacing: '0.04em',
        }}>
          by Peanuts Labs
        </p>
      </div>
    </div>
  )
}
