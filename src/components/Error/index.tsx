import React from 'react';

interface Props {
    error: Error;
}

function Error(props: Props) {
    const { error } = props;

    return (
        <div>
            { error.message }
        </div>
    );
}

export default Error;
