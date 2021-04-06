import React, { useMemo } from 'react';
import { TreeNodeDatum } from 'react-d3-tree/lib/types/common';
import styles from './styles.css';

interface DendogramInterface {
    nodeDatum: TreeNodeDatum;
    nodeWidth: number;
    nodeHeight: number;
    nodeCircleRadius: number;
}


function DendogramSVGNodeElement(props: DendogramInterface) {
    const {
        nodeWidth,
        nodeHeight,
        nodeCircleRadius,
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
                height={`${nodeHeight}px`}
                style={{
                    transform: `translateY(-${nodeHeight / 2}px)`,
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
