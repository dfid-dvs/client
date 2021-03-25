import React from 'react';
import Tree from 'react-d3-tree';
import { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree/lib/types/common';
import DendogramSVGNodeElement from '#components/DendogramSVGNodeElement';

interface TreeData extends RawNodeDatum {
    countChild?: number;
}
interface DendogramTreeInterface {
    zoom?: number;
    collapsible?: boolean;
    scaleExtent?: {
        min: number;
        max: number;
    };
    nodeSize: {
        x: number;
        y: number;
    };
    pathFunc: number;
    separation?: {
        siblings: number;
        nonSiblings: number;
    };
    translate: {
        x: number;
        y: number;
    };
    initialDepth: number;
    treeData: TreeData;
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
        nodeHeight={NODE_HEIGHT}
        nodeCircleRadius={NODE_CIRCLE_RADIUS}
        nodeDatum={nodeDatum.nodeDatum}
    />
);

function DendogramTree(props: DendogramTreeInterface) {
    const { treeData } = props;

    const secondLevelChildrens = treeData?.children?.length || 0;
    const thirdLevelChildrens = React.useMemo(() => {
        let n = 0;

        treeData?.children?.forEach((t) => {
            n += (t.children?.length || 0);
        });

        return n;
    }, [treeData]);

    if (thirdLevelChildrens > 0) {
        NODE_WIDTH = 164;
        NODE_GAP_X = 96;
    }

    const nodeSize = {
        x: NODE_WIDTH + NODE_GAP_X,
        y: NODE_HEIGHT + NODE_GAP_Y,
    };

    const childCount = secondLevelChildrens + thirdLevelChildrens;

    return (
        <div
            style={{
                height: childCount * nodeSize.y,
                pointerEvents: 'none',
                position: 'relative',
            }}
        >
            <Tree
                data={treeData}
                nodeSize={nodeSize}
                pathFunc={customPathFunction}
                renderCustomNodeElement={renderCustomNodeElement}
                translate={{
                    x: 0,
                    y: (childCount * nodeSize.y) / 2,
                }}
            />
        </div>
    );
}

export default DendogramTree;
