import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
                    <div className="text-6xl mb-4">🧩</div>
                    <h1 className="text-2xl font-black mb-2">Ой! Что-то пошло не так.</h1>
                    <p className="text-slate-400 mb-8 max-w-xs">Произошла ошибка при загрузке страницы. Попробуйте обновить приложение.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
                    >
                        Обновить
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
