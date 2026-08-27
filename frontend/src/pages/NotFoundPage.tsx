// src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
      <p className="text-7xl font-bold text-gray-700 select-none">404</p>
      <h1 className="text-2xl font-semibold text-white">Page not found</h1>
      <p className="text-gray-400 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-semibold text-sm
                   hover:bg-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
