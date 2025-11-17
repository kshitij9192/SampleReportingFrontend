import React from 'react';

function App() {
  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <header className="app-header">
        <h1>Sample React App</h1>
        <p>This is a simple test React component for Vite build verification.</p>
      </header>
      <main>
        <button onClick={() => alert('Button clicked!')}>
          Click me
        </button>
      </main>
    </div>
  );
}

export default App;
