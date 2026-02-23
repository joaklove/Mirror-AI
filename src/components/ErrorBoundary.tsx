import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 taiji-bg">
          <Card className="max-w-md w-full p-8 text-center scroll-effect chinese-border">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-700 to-red-800 flex items-center justify-center shadow-md mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-50" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-[ZCOOL XiaoWei] mb-4">
              页面出错了
            </h2>
            <p className="text-gray-600 mb-6">
              很抱歉，页面发生了错误。请尝试刷新页面或返回首页。
            </p>
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-green-700 to-red-800 hover:from-green-800 hover:to-red-900 text-amber-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新页面
              </Button>
              <Button
                variant="ghost"
                onClick={this.handleGoHome}
                className="w-full border border-gray-200 hover:bg-amber-100"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
            {(process.env.NODE_ENV === 'development' && this.state.error) && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-left">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  错误信息：
                </h3>
                <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      错误堆栈：
                    </h3>
                    <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;