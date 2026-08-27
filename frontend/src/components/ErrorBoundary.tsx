// src/components/ErrorBoundary.tsx

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Page-level error boundary. Catches render errors in child component trees
 * and displays a fallback UI with a link back to the dashboard.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console in development; could wire to an error reporting service here
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-300 p-10">
          <svg
            className="w-12 h-12 text-red-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <p className="text-lg font-medium text-white">Something went wrong.</p>
          <p className="text-sm text-gray-400 text-center max-w-md">
            An unexpected error occurred while rendering this page.
          </p>
          <a
            href="/"
            className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 text-sm font-semibold hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition"
          >
            Return to Dashboard
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
