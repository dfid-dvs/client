import React, { useContext, useMemo } from 'react';
import { TreeNodeDatum } from 'react-d3-tree/lib/types/common';

import { DendogramContext } from '#components/DendogramTree';
import styles from './styles.css';

interface DendogramInterface {
    nodeDatum: TreeNodeDatum;
}

function DendogramSVGNodeElement(props: DendogramInterface) {
    const {
        nodeDatum,
    } = props;

    const {
        nodeWidth,
        nodeHeight: nodeHeightFromProps,
        nodeCircleRadius,
        nodeGapY,
    } = useContext(DendogramContext);

    const nodeHeight = nodeHeightFromProps + nodeGapY / 2;

    const endNodeHidden = (nodeDatum?.children && nodeDatum.children.length <= 0) ?? true;

    // eslint-disable-next-line no-underscore-dangle
    const nodeDepth = nodeDatum.__rd3t.depth;

    const foHeight = useMemo(
        () => {
            if (!nodeDatum.name) {
                return nodeHeight;
            }
            const nameLength = nodeDatum.name.length;

            return nameLength < nodeHeight ? nodeHeight : nameLength;
        },
        [nodeDatum.name, nodeHeight],
    );

    return (
        <>
            {nodeDepth > 0 && (
                <circle
                    cx={-nodeCircleRadius}
                    r={nodeCircleRadius}
                    fill="#ffffff"
                />
            )}
            <foreignObject
                width={`${nodeWidth}px`}
                height={`${foHeight}px`}
                style={{
                    transform: `translateY(-${foHeight / 2}px)`,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className={styles.nameContainer}>
                    <div
                        className={styles.name}
                        style={{
                            borderRadius: `${nodeHeight / 2}px`,
                        }}
                    >
                        <div className={styles.text}>
                            {nodeDatum.name}
                        </div>
                    </div>
                </div>
            </foreignObject>
            {!endNodeHidden && (
                <circle
                    cx={nodeWidth + nodeCircleRadius}
                    r={nodeCircleRadius}
                    fill="#ffffff"
                />
            )}
        </>
    );
}

export default DendogramSVGNodeElement;
