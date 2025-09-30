import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/chat";
import ConfigMenu from "./pages/configMenu";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* default: redirect / -> /chat (or use <ConfigMenu /> if you prefer) */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/config" element={<ConfigMenu />} />
        {/* catch-all */}
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </Router>
  );
}