'use client';

import React from 'react';
import { Monitor } from 'lucide-react';
import { Channel } from '@/types/channel';
import { WatchlistButton } from '@/components/WatchlistButton';

interface ChannelCardProps {
    channel: Channel;
    onClick: (channel: Channel) => void;
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
    return (
        <div onClick={() => onClick(channel)} className="group cursor-pointer relative">
            <div className="bg-gray-800/50 hover:bg-indigo-600/20 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center p-4">
                    {channel.logo_url ? (
                        <img
                            src={channel.logo_url}
                            alt={channel.name}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                            loading="lazy"
                            draggable={false}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Monitor className="w-6 h-6 text-indigo-500" />
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-gray-700">
                    <h3 className="text-white font-medium text-sm truncate">{channel.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 truncate">{channel.category || 'Canal'}</p>
                </div>
            </div>

            {/* 🔖 Watchlist — sempre visível no mobile, no hover no desktop */}
            <div
                className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <WatchlistButton
                    id={channel.id}
                    mediaType="channel"
                    title={channel.name}
                    posterPath={channel.logo_url || null}
                    embedUrl={channel.embed_url}
                    channelCategory={channel.category}
                />
            </div>
        </div>
    );
}