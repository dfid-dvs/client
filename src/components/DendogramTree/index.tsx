import React, { useMemo } from 'react';
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

const customPathFunction = (linkDatum: any) => {
    const { source, target } = linkDatum;
    return `M ${source.y + 325} ${source.x} C ${source.y + 325} ${source.x} ${target.y - 450} ${target.x} ${target.y} ${target.x}`;
};

const renderCustomNodeElement = (nodeDatum: CustomNodeElementProps) => (
    <DendogramSVGNodeElement
        nodeDatum={nodeDatum.nodeDatum}
    />
);

function DendogramTree(props: DendogramTreeInterface) {
    const {
        zoom = 1,
        collapsible = false,
        scaleExtent = { min: 0.4, max: 0.4 },
        nodeSize = { x: 750, y: 35 },
        separation = { siblings: 3, nonSiblings: 3 },
        initialDepth = 2,
        treeData,
    } = props;

    const countChild = useMemo(
        () => {
            if (treeData.countChild) {
                return treeData.countChild;
            }
            return 1;
        },
        [treeData.countChild],
    );

    return (
        <div
            style={{
                height: countChild * 45,
                pointerEvents: 'none',
                position: 'relative',
            }}
        >
            <Tree
                data={treeData}
                zoom={zoom}
                collapsible={collapsible}
                scaleExtent={scaleExtent}
                nodeSize={nodeSize}
                pathFunc={customPathFunction}
                separation={separation}
                translate={{ x: 100, y: countChild * 21 }}
                initialDepth={initialDepth}
                renderCustomNodeElement={renderCustomNodeElement}
            />
        </div>
    );
}

export default DendogramTree;
