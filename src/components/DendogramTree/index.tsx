import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import ReactDOMServer from 'react-dom/server';
import { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree/lib/types/common';
import { sum } from '@togglecorp/fujs';

import { IoMdClose } from 'react-icons/io';
import DendogramSVGNodeElement from '#components/DendogramSVGNodeElement';
import Button from '#components/Button';
import styles from './styles.css';

interface DendrogramContextProps {
    nodeWidth: number;
    nodeGapX: number;
    nodeGapY: number;
    nodeHeight: number;
    nodeCircleRadius: number;
    setNodeWidth: (data: number) => void;
    setNodeGapX: (data: number) => void;
}

export const DendogramContext = React.createContext<DendrogramContextProps>({
    nodeWidth: 164,
    nodeGapX: 96,
    nodeGapY: 12,
    nodeHeight: 24,
    nodeCircleRadius: 4,
    setNodeWidth: (data: number) => {
        console.warn('Trying to set node width', data);
    },
    setNodeGapX: (data: number) => {
        console.warn('Trying to set node width', data);
    },
});

interface TreeData extends RawNodeDatum {
    countChild?: number;
}
interface DendogramTreeInterface {
    treeData: TreeData;
    onHideDendrogram?: (id: string | undefined) => void
}

interface LinkDatum {
    source: {
        x: number;
        y: number;
    };
    target: {
        x: number;
        y: number;
    };
}

interface PathProps extends LinkDatum {
}

function Path(props: PathProps) {
    const {
        source,
        target,
    } = props;

    const {
        nodeWidth,
        nodeCircleRadius,
    } = useContext(DendogramContext);

    return (
        <>
            {`M ${source.y + nodeWidth + nodeCircleRadius} ${source.x} C ${source.y + nodeWidth + nodeCircleRadius} ${source.x} ${target.y - nodeWidth / 3} ${target.x} ${target.y - nodeCircleRadius} ${target.x}`}
        </>
    );
}

const customPathFunction = (linkDatum: LinkDatum) => {
    const { source, target } = linkDatum;
    const path = (
        <Path
            source={source}
            target={target}
        />
    );

    return ReactDOMServer.renderToString(path);
};

const renderCustomNodeElement = (nodeDatum: CustomNodeElementProps) => (
    <DendogramSVGNodeElement
        nodeDatum={nodeDatum.nodeDatum}
    />
);

function DendogramTree(props: DendogramTreeInterface) {
    const { treeData, onHideDendrogram } = props;
    const [nodeWidth, setNodeWidth] = useState(260);
    const [nodeGapX, setNodeGapX] = useState(120);

    const dendogramContextInstance: DendrogramContextProps = {
        nodeWidth,
        nodeHeight: 24,
        nodeGapY: 12,
        nodeGapX,
        nodeCircleRadius: 4,
        setNodeWidth,
        setNodeGapX,
    };

    const secondLevelChildren = treeData?.children?.length || 0;
    const thirdLevelChildren = useMemo(
        () => {
            if (!treeData.children) {
                return 0;
            }
            return sum(treeData.children?.map(t => t.children?.length ?? 0));
        },
        [treeData.children],
    );

    useEffect(() => {
        if (thirdLevelChildren > 0) {
            setNodeWidth(160);
            setNodeGapX(90);
        }
    }, [thirdLevelChildren]);

    const nodeSize = {
        x: nodeWidth + nodeGapX,
        y: (treeData.name.length > dendogramContextInstance.nodeHeight
            ? treeData.name.length
            : dendogramContextInstance.nodeHeight) + dendogramContextInstance.nodeGapY,
    };

    const childCount = secondLevelChildren + thirdLevelChildren;

    const handleHideDendrogram = useCallback(
        () => {
            if (onHideDendrogram) {
                onHideDendrogram(treeData.name);
            }
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
