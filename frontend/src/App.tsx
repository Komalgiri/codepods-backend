import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import CreatePod from "./pages/CreatePod";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/create-pod" element={<CreatePod />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
