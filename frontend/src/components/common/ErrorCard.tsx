import React from 'react';
import { AlertCircle, Zap, Wifi, Clock, Lock, RefreshCw } from 'lucide-react';

interface ErrorDetails {
  type?: string;
  provider?: string;
  message?: string;
  code?: string;
  retryAfter?: string;
}

interface ErrorCardProps {
  title: string;
  message: string;
  error?: ErrorDetails;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  error,
  onRetry,
  isRetrying = false,
}) => {
  const getErrorIcon = () => {
    switch (error?.type) {
      case 'RATE_LIMIT':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'CONNECTION_ERROR':
        return <Wifi className="w-5 h-5 text-red-600" />;
      case 'TIMEOUT':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'AUTH_ERROR':
        return <Lock className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getErrorSuggestion = () => {
    switch (error?.type) {
      case 'RATE_LIMIT':
        return (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p>The AI service is receiving too many requests. Please wait a moment and try again.</p>
            {error?.retryAfter && (
              <p className="mt-1 text-xs">Retry available in: {error.retryAfter}s</p>
            )}
          </div>
        );
      case 'CONNECTION_ERROR':
        return (
          <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
            <p className="font-semibold mb-1">🔌 Connection Issue:</p>
            <p>Unable to reach the AI service. Check your internet connection and try again.</p>
          </div>
        );
      case 'TIMEOUT':
        return (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
            <p className="font-semibold mb-1">⏱️ Timeout:</p>
            <p>The request took too long. The service might be busy. Please try again.</p>
          </div>
        );
      case 'AUTH_ERROR':
        return (
          <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
            <p className="font-semibold mb-1">🔐 Authentication:</p>
            <p>There's an issue with the AI service configuration. Please contact support.</p>
          </div>
        );
      default:
        return (
          <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
            <p className="font-semibold mb-1">⚠️ Error:</p>
            <p>Something went wrong. Please try again or contact support if the problem persists.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 shadow-sm">
      {}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getErrorIcon()}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900">{title}</h4>
          <p className="text-sm text-red-800 mt-1">{message}</p>

          {}
          {error && (
            <div className="mt-2 text-xs text-red-700 bg-white/50 rounded p-2 font-mono">
              <p>
                <span className="font-semibold">Type:</span> {error.type || 'Unknown'}
              </p>
              {error.provider && (
                <p>
                  <span className="font-semibold">Service:</span> {error.provider}
                </p>
              )}
              {error.code && (
                <p>
                  <span className="font-semibold">Code:</span> {error.code}
                </p>
              )}
            </div>
          )}

          {}
          {getErrorSuggestion()}
        </div>
      </div>

      {}
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );
};

export default ErrorCard;
