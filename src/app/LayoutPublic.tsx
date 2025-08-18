import { Outlet } from "react-router-dom";

export default function LayoutPublic() {
  return (
    <div className="min-h-dvh bg-white">
      <main><Outlet /></main>
    </div>
  );
}
