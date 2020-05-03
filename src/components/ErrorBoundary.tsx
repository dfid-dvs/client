import React from 'react';
import Error from '#components/Error';

interface Props {
    render?: React.ReactElement;
    children: React.ReactNode;
}

interface State {
    error: Error | undefined;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state = {
        error: undefined,
    };

    public componentDidCatch(e: Error, i: React.ErrorInfo) {
        this.setState({ error: e });
        console.warn(i);
    }

    public render() {
        const {
            render,
            children,
        } = this.props;

        const { error } = this.state;

        if (error) {
            if (render) {
                return React.cloneElement(render, { error });
            }

            return <Error error={error} />;
        }

        return children;
    }
}

export default ErrorBoundary;
