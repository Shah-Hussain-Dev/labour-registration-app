import LabourRegistrationForm from "./components/LabourRegistrationForm.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <span className="site-header__brand">YoloHealth</span>
          <span className="site-header__tag">Labour registration</span>
        </div>
      </header>
      <main className="site-main">
        <LabourRegistrationForm />
      </main>
    </div>
  );
}
