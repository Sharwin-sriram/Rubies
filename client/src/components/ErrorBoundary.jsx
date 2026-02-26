import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
      isServerError: error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('fetch') ||
        error.message.includes('axios') ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ERR_NETWORK'
      )
    });
  }

  render() {
    if (this.state.hasError) {
      const isServerError = this.state.isServerError;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isServerError ? "Uh oh, looks like we're the problem" : "Something went wrong"}
            </h2>
            <p className="text-gray-600 mb-6">
              {isServerError 
                ? "We're having trouble connecting to our servers. Please try again in a few minutes."
                : "We're sorry, but something unexpected happened. Please try refreshing the page."
              }
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              {isServerError ? "Try Again" : "Refresh Page"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
