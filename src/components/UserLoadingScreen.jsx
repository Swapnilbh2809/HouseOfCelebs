export default function UserLoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#111111',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '52px', height: '52px',
        border: '4px solid #2a2a2a',
        borderTop: '4px solid #e63946',
        borderRadius: '50%',
        animation: 'hoc-spin 1s linear infinite',
        marginBottom: '16px'
      }} />
      <p style={{ color: '#aaaaaa', fontFamily: 'sans-serif', fontSize: '0.95rem' }}>
        Loading...
      </p>
      <style>{`@keyframes hoc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
