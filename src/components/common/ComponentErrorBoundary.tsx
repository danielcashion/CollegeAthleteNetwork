"use client";

import React from "react";
import ErrorBoundary from "./ErrorBoundary";

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  showError?: boolean;
}

const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName = "Component",
  showError = false,
}) => {
  const fallback = (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-red-800">
            {componentName} Error
          </h3>
          <p className="text-red-700 mt-1">
            This component encountered an error. Please refresh the page.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} showError={showError}>
      {children}
    </ErrorBoundary>
  );
};

export default ComponentErrorBoundary;