import React, { useMemo } from 'react';
import { TreeNodeDatum } from 'react-d3-tree/lib/types/common';
import styles from './styles.css';

interface DendogramInterface {
    nodeDatum: TreeNodeDatum;
    isFirstNode?: boolean;
}
function DendogramSVGNodeElement(props: DendogramInterface) {
    const {
        nodeDatum,
    } = props;
    const endNodeHidden: boolean = useMemo(
        () => {
            if (nodeDatum.children) {
                return nodeDatum.children.length <= 0;
            }
            return true;
        },
        [nodeDatum.children],
    );

    // eslint-disable-next-line no-underscore-dangle
    const nodeDepth = nodeDatum.__rd3t.depth;

    const rectWidth = useMemo(() => {
        if (nodeDepth === 0) {
            return -120;
        }
        return (nodeDepth - 1) * 50;
    }, [nodeDepth]);

    return (
        <>
            {nodeDepth > 0 && <circle r={12} x="-140" fill="#ffffff" />}
            <foreignObject x={rectWidth} y="-45" width="420px" height="240px">
                <div className={styles.nameContainer}>
                    {nodeDatum.name}
                    {nodeDepth}
                </div>
            </foreignObject>
            {!endNodeHidden && <circle cx="325" x="-25" r={12} fill="#ffffff" />}
        </>
    );
}

export default DendogramSVGNodeElement;
