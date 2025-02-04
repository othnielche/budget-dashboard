import {Layout} from "@/components/layout.jsx"
import {Dashboard} from "@/screens/Dashboard.jsx"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext.jsx";
import { Login } from "./screens/login.jsx";
function App() {


  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
