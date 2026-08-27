import { Route, Routes } from "react-router-dom";
import { Sidebar } from "@/pages/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { AlertDetail } from "@/pages/AlertDetail";
import { SystemHealth } from "@/pages/SystemHealth";

export default function App() {
  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts/:id" element={<AlertDetail />} />
          <Route path="/system" element={<SystemHealth />} />
        </Routes>
      </div>
    </div>
  );
}
