import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ConfigMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query params from current URL
    const params = new URLSearchParams(location.search);
    const tech = params.get("tech") ?? "baseline";
    const count = params.get("count") ?? "0";

    // Redirect to /chat with the same query
    navigate(`/chat?tech=${tech}&count=${count}`, { replace: true });
  }, [location, navigate]);

  return null; // no UI, just redirects
}