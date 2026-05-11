import { useState } from "react";
import Sidebar from "./components/Sidebar";
import RunbookPage from "./components/RunbookPage";

const pages = [
  {
    id: "auth-service",
    title: "Auth Service Runbook",
    category: "Runbooks",
  },
];

export default function App() {
  const [activePage] = useState("auth-service");

  return (
    <div className="app">
      <Sidebar pages={pages} activePage={activePage} />
      <main className="main-content">
        {activePage === "auth-service" && <RunbookPage />}
      </main>
    </div>
  );
}
