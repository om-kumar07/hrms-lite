import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";
import ColdStartScreen from "./components/ColdStartScreen";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import AttendancePicker from "./pages/AttendancePicker";
import AttendanceView from "./pages/AttendanceView";

function App() {
  const [serverReady, setServerReady] = useState(false);

  return (
    <ThemeProvider>
      {!serverReady && <ColdStartScreen onReady={() => setServerReady(true)} />}
      {serverReady && (
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<AddEmployee />} />
              <Route path="/employees/:employeeId/edit" element={<EditEmployee />} />
              <Route path="/attendance" element={<AttendancePicker />} />
              <Route path="/attendance/:employeeId" element={<AttendanceView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

export default App;
