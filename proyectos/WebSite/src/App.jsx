import Clientes from './pages/Clientes';

function App() {
  return (
    <>
      <header className="encabezado">
        <h1>Wide World Importers</h1>
        <span className="subtitulo">Sistema de consulta</span>
      </header>

      <main className="contenido">
        <Clientes />
      </main>
    </>
  );
}

export default App;
