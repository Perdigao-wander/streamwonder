'use client';

import { User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { serverPhoto } from "@/app/lib/utils";

interface AvatarProps {
    name?: string;
    surname?: string;
    photoUrl?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallback?: 'initials' | 'icon';
}

const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
};

export function Avatar({
                           name,
                           surname,
                           photoUrl,
                           size = 'md',
                           className = '',
                           fallback = 'initials'
                       }: AvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getInitials = () => {
        const firstInitial = name ? name.charAt(0).toUpperCase() : '';
        const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const getRandomGradient = () => {
        const gradients = [
            'from-blue-600 to-blue-800',
            'from-green-600 to-green-800',
            'from-purple-600 to-purple-800',
            'from-red-600 to-red-800',
            'from-yellow-600 to-yellow-800',
            'from-pink-600 to-pink-800',
            'from-indigo-600 to-indigo-800',
            'from-teal-600 to-teal-800',
            'from-orange-600 to-orange-800',
            'from-cyan-600 to-cyan-800',
            'from-emerald-600 to-amber-500',
        ];
        const index = name ? name.length % gradients.length : 0;
        return gradients[index];
    };

    // Função para verificar se é uma URL de preview (base64 ou blob)
    const isPreviewUrl = (url: string): boolean => {
        return url.startsWith('data:image') || url.startsWith('blob:') || url.startsWith('http://localhost') || url.startsWith('https://');
    };


    // Função para obter a URL correta da imagem
    const getImageUrl = (url: string): string => {
        if (!url) return '';
        // Se for preview (base64, blob, ou URL completa)
        if (isPreviewUrl(url)) {
            return url;
        }
        // Se for caminho do servidor
        return `${serverPhoto}/${url}`;
    };

    const hasPhoto = photoUrl && !imageError && photoUrl !== '';
    const imageSrc = hasPhoto ? getImageUrl(photoUrl) : '';

    // Resetar erro quando photoUrl mudar
    useEffect(() => {
        setImageError(false);
        setIsLoading(true);
    }, [photoUrl]);

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setIsLoading(false);
    };

    // Renderizar loading
/*    if (isLoading) {
        return (
            <div className={`${sizeClasses[size]} ${className}`}>
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                    <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 20 : 24} className="text-gray-400" />
                </div>
            </div>
        );
    }*/

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {hasPhoto ? (
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={imageSrc}
                        alt={`${name || ''} ${surname || ''}`}
                        className="w-full h-full object-cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                </div>
            ) : (
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${getRandomGradient()} flex items-center justify-center shadow-sm`}>
                    {fallback === 'initials' && getInitials() ? (
                        <span className="text-white font-semibold uppercase text-center">
                            {getInitials()}
                        </span>
                    ) : (
                        <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 20 : 24} className="text-white" />
                    )}
                </div>
            )}
        </div>
    );
}