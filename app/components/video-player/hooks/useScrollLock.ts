// components/video-player/hooks/useScrollLock.ts
import { useEffect, useCallback, useRef } from 'react';

export const useScrollLock = <T extends HTMLElement>(
    containerRef: React.RefObject<T>,
    allowedScrollRefs?: React.RefObject<T>[]
) => {
    const scrollPosition = useRef<number>(0);

    const preventScroll = useCallback((e: Event) => {
        const target = e.target as HTMLElement;

        let shouldAllowScroll = false;

        if (allowedScrollRefs) {
            for (const ref of allowedScrollRefs) {
                if (ref.current && ref.current.contains(target)) {
                    shouldAllowScroll = true;
                    break;
                }
            }
        }

        if (shouldAllowScroll) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    }, [allowedScrollRefs]);

    useEffect(() => {
        scrollPosition.current = window.scrollY || document.documentElement.scrollTop;

        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition.current}px`;
        document.body.style.width = '100%';

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', preventScroll, { passive: false });
            container.addEventListener('touchmove', preventScroll, { passive: false });
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = '';
            document.body.style.width = '';

            window.scrollTo(0, scrollPosition.current);

            if (container) {
                container.removeEventListener('wheel', preventScroll);
                container.removeEventListener('touchmove', preventScroll);
            }
        };
    }, [containerRef, preventScroll]);
};