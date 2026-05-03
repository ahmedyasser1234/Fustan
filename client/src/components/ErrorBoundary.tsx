import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to an error reporting service if available
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
                <AlertTriangle size={40} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-medium text-gray-900">
                عذراً، حدث خطأ غير متوقع
              </h2>
              <p className="text-slate-500 font-bold">
                Something went wrong. We are working on fixing it. Please try again or go back to the homepage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 h-12 flex items-center gap-2"
              >
                <RotateCcw size={18} />
                تحديث الصفحة
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="rounded-full px-8 h-12 border-2 flex items-center gap-2"
              >
                <Home size={18} />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
