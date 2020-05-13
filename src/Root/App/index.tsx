import React from 'react';
import Multiplexer from './Multiplexer';

import './styles.css';

// NOTE: Typescript has really powerful type inference, but usually chooses the
// loosest types it can. In this case you need to force it to think of your
// transforms as a Tuple so that each element has it's own type, and then let
// the inference do the rest.
function tuplify<T extends unknown[]>(...args: T) {
    return args;
}

interface Transform<ArgType, ReType> {
    transformer: (input: string, arg: ArgType) => string;
    arg: ArgType;
    name: string;

    value: ReType;
}

// Typescript will use all the tuple keys (such as "length"), not just the
// numeric ones. You just need to force it to only map the numeric ones.
// Hence the condition: T[P] extends T[number]
type TransformRest<T> = (
    T extends Transform<infer A, infer B>
        ? Transform<unknown, unknown>
        : never
)

function applyTransforms<T>(input: string, ...transforms: TransformRest<T>[]) {
    transforms.forEach((transform) => {
        transform.transformer(transform.name, transform.arg);
    });
}

const transforms = tuplify(
    {
        transformer: (input: string, arg: string) => input.concat(arg),
        arg: 'END',
        name: 'shym',
    },
    {
        transformer: (input: string, arg: number) => input.repeat(arg),
        arg: 12,
        name: 'sundar',
    },
);

applyTransforms('string', ...transforms);

function App() {
    return (
        <Multiplexer />
    );
}
export default App;
