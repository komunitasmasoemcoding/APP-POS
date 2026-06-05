import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>POS Cafe is Running</h1>
      <p>If you see this, React is working. Redirecting to POS...</p>
      <button onClick={() => window.location.href = '/login'}>Go to Login</button>
    </div>
  );
};

export default App;
