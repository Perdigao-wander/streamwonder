'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
}

export function ConfirmationModal({
                                      isOpen,
                                      onClose,
                                      onConfirm,
                                      title,
                                      description,
                                      confirmText = 'Confirmar',
                                      cancelText = 'Cancelar',
                                      variant = 'default',
                                  }: ConfirmationModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // Foco inicial + restauração de foco
    useEffect(() => {
        if (isOpen) {
            previouslyFocused.current = document.activeElement as HTMLElement;
            // Espera o modal montar antes de focar
            const timer = setTimeout(() => confirmRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else if (previouslyFocused.current) {
            previouslyFocused.current.focus();
        }
    }, [isOpen]);

    // Esc para fechar
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Bloqueia scroll do body
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const confirmClasses =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
            : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-description"
                className="relative w-full max-w-md bg-[#14141a] border border-gray-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fechar */}
                <button
                    onClick={onClose}
                    aria-label="Fechar"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Ícone */}
                <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        variant === 'danger'
                            ? 'bg-red-600/20 text-red-400'
                            : 'bg-indigo-600/20 text-indigo-400'
                    }`}
                >
                    <AlertTriangle className="w-6 h-6" />
                </div>

                {/* Texto */}
                <h3
                    id="confirm-modal-title"
                    className="text-lg font-bold text-white text-center mb-2"
                >
                    {title}
                </h3>
                <p
                    id="confirm-modal-description"
                    className="text-sm text-gray-400 text-center mb-6"
                >
                    {description}
                </p>

                {/* Botões */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141a] ${confirmClasses}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}