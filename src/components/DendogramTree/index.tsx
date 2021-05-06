import React, { useCallback } from 'react';
import Tree from 'react-d3-tree';
import { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree/lib/types/common';

import { IoMdClose } from 'react-icons/io';
import DendogramSVGNodeElement from '#components/DendogramSVGNodeElement';
import Button from '#components/Button';
import styles from './styles.css';

interface TreeData extends RawNodeDatum {
    countChild?: number;
}
interface DendogramTreeInterface {
    treeData: TreeData;
    onHideDendrogram?: (id: string | undefined) => void
}

let NODE_WIDTH = 260;
const NODE_HEIGHT = 24;
const NODE_CIRCLE_RADIUS = 4;
const NODE_GAP_Y = 12;
let NODE_GAP_X = 120;

const customPathFunction = (linkDatum: {
    source: {
        x: number;
        y: number;
    };
    target: {
        x: number;
        y: number;
    };
}) => {
    const { source, target } = linkDatum;
    return `M ${source.y + NODE_WIDTH + NODE_CIRCLE_RADIUS} ${source.x} C ${source.y + NODE_WIDTH + NODE_CIRCLE_RADIUS} ${source.x} ${target.y - NODE_WIDTH / 3} ${target.x} ${target.y - NODE_CIRCLE_RADIUS} ${target.x}`;
};

const renderCustomNodeElement = (nodeDatum: CustomNodeElementProps) => (
    <DendogramSVGNodeElement
        nodeWidth={NODE_WIDTH}
        nodeHeight={NODE_HEIGHT + NODE_GAP_Y / 2}
        nodeCircleRadius={NODE_CIRCLE_RADIUS}
        nodeDatum={nodeDatum.nodeDatum}
    />
);

function DendogramTree(props: DendogramTreeInterface) {
    const { treeData, onHideDendrogram } = props;
    const secondLevelChildrens = treeData?.children?.length || 0;
    const thirdLevelChildrens = React.useMemo(() => {
        let n = 0;

        treeData?.children?.forEach((t) => {
            n += (t.children?.length || 0);
        });

        return n;
    }, [treeData]);

    if (thirdLevelChildrens > 0) {
        NODE_WIDTH = 160;
        NODE_GAP_X = 90;
    }

    const nodeSize = {
        x: NODE_WIDTH + NODE_GAP_X,
        y: (treeData.name.length > NODE_HEIGHT ? treeData.name.length : NODE_HEIGHT) + NODE_GAP_Y,
    };

    const childCount = secondLevelChildrens + thirdLevelChildrens;

    const handleHideDendrogram = useCallback(
        () => {
            if (!onHideDendrogram) {
                return;
            }
            onHideDendrogram(treeData.name);
        },
        [onHideDendrogram, treeData.name],
    );

    return (
        <div
            className={styles.container}
            style={{
                height: childCount * nodeSize.y * 1.15,
                width: '100%',
                justifyContent: 'center',
            }}
        >
            {onHideDendrogram && (
                <Button
                    onClick={handleHideDendrogram}
                    title="Hide Dendrogram"
                    transparent
                    variant="icon"
                    className={styles.button}
                >
                    <IoMdClose />
                </Button>
            )}
            <div
                style={{
                    pointerEvents: 'none',
                    height: childCount * nodeSize.y * 1.15,
                    width: '100%',
                }}
            >
                <Tree
                    data={treeData}
                    nodeSize={nodeSize}
                    pathFunc={customPathFunction}
                    renderCustomNodeElement={renderCustomNodeElement}
                    translate={{
                        x: 0,
                        y: (childCount * nodeSize.y * 1.15) / 2,
                    }}
                />
            </div>
        </div>
    );
}

export default DendogramTree;
