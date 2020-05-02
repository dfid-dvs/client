import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const emptyObject = {
    target: null,
    contentRect: {
        width: undefined,
        height: undefined,
        x: undefined,
        y: undefined,
    },
};

type EmptyResizeObserverEntry = typeof emptyObject;

function useResizeObserver(elRef: React.RefObject<HTMLElement>) {
    const [entry, setEntry] = React.useState<
    ResizeObserverEntry | EmptyResizeObserverEntry
    >(emptyObject);
    const observer = React.useRef<ResizeObserver>();

    const observe = React.useCallback(() => {
        observer.current = new ResizeObserver(
            ([e]) => setEntry(e),
        );

        if (elRef.current) {
            observer.current.observe(elRef.current);
        }
    }, [elRef]);

    const disconnect = React.useCallback(() => {
        const { current } = observer;
        if (current && current.disconnect) {
            current.disconnect();
        }
    }, []);

    React.useEffect(() => {
        observe();
        return disconnect;
    }, [disconnect, observe]);

    return entry;
}

export default useResizeObserver;
