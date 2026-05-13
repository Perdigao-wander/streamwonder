'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Tv, Loader2 } from 'lucide-react';
import ChannelPlayer from './ChannelPlayer';

interface Channel {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    embed_url: string;
    category: string;
    is_active: boolean;
}

interface ChannelsGridProps {
    limit?: number;
    category?: string;
}

// Categorias bloqueadas (adulto)
const BLOCKED_CATEGORIES = ['adulto', 'adult'];
const BLOCKED_KEYWORDS = ['xxx', 'sex', 'adult', 'porn', 'hot', 'dreamsex', 'jennylive'];

const ChannelsGrid = ({ limit = 12, category="desenhos" }: ChannelsGridProps) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);

    // Verificar se canal é adulto
    const isAdultChannel = (channel: Channel): boolean => {
        if (BLOCKED_CATEGORIES.some(cat => channel.category?.toLowerCase().includes(cat))) {
            return true;
        }
        if (BLOCKED_KEYWORDS.some(keyword => channel.name?.toLowerCase().includes(keyword))) {
            return true;
        }
        if (BLOCKED_KEYWORDS.some(keyword => channel.id?.toLowerCase().includes(keyword))) {
            return true;
        }
        return false;
    };

    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true);
            try {
                let url = '/api/channels?limit=200';
                if (category) {
                    url = `/api/channels?genre=${category}&limit=200`;
                }

                const response = await fetch(url);
                const data = await response.json();

                if (data.channels) {
                    // Filtrar canais adultos e limitar
                    const safeChannels = data.channels
                        .filter((ch: Channel) => !isAdultChannel(ch) && ch.is_active !== false)
                        .slice(0, limit);
                    setChannels(safeChannels);
                } else {
                    setChannels([]);
                }
            } catch (err) {
                console.error('Erro ao buscar canais:', err);
                setError('Erro ao carregar canais');
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, [category, limit]);

    const handleChannelClick = (channel: Channel) => {
        if (isAdultChannel(channel)) return;
        setSelectedChannel(channel);
        setShowPlayer(true);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 rounded-xl aspect-video"></div>
                        <div className="h-4 bg-gray-800 rounded mt-2 w-3/4"></div>
                        <div className="h-3 bg-gray-800 rounded mt-1 w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <Tv className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Erro ao carregar canais</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (channels.length === 0) {
        return (
            <div className="text-center py-12">
                <Tv className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum canal disponível no momento</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {channels.map((channel) => (
                    <div
                        key={channel.id}
                        onClick={() => handleChannelClick(channel)}
                        className="group cursor-pointer"
                    >
                        <div className="bg-gray-800/50 hover:bg-indigo-600/20 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 overflow-hidden">
                            {/* Logo do canal */}
                            <div className="aspect-video bg-black/20 flex items-center justify-center p-4">
                                {channel.logo_url ? (
                                    <img
                                        src={channel.logo_url}
                                        alt={channel.name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Monitor className="w-6 h-6 text-indigo-500" />
                                    </div>
                                )}
                            </div>

                            {/* Informações do canal */}
                            <div className="p-3 border-t border-gray-700">
                                <h3 className="text-white font-medium text-sm truncate">
                                    {channel.name}
                                </h3>
                                <p className="text-gray-500 text-xs mt-1 truncate">
                                    {channel.category || 'Canal'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Channel Player */}
            {showPlayer && selectedChannel && (
                <ChannelPlayer
                    channelId={selectedChannel.id}
                    channelName={selectedChannel.name}
                    embedUrl={selectedChannel.embed_url}
                    onClose={() => {
                        setShowPlayer(false);
                        setSelectedChannel(null);
                    }}
                />
            )}
        </>
    );
};

export default ChannelsGrid;