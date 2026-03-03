import "./bootstrap";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";

const root = document.getElementById("app");
if (root) {
    createRoot(root).render(
        <BrowserRouter>
            <ToastProvider>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </ToastProvider>
        </BrowserRouter>,
    );
}
