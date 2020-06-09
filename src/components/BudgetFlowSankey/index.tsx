import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ResponsiveContainer,
    Sankey,
    Tooltip,
    Layer,
    Label,
    Rectangle,
} from 'recharts';
import { SankeyData } from '#types';

import styles from './styles.css';

interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: {
        name: string;
        value: number;
    };
    containerWidth: number;
}

interface Link {
    sourceX: number;
    targetX: number;
    sourceY: number;
    targetY: number;
    sourceControlX: number;
    targetControlX: number;
    linkWidth: number;
    index: number;
}

interface Props {
    className?: string;
    data: SankeyData;
}

function SankeyNode(node: Node) {
    const { x, y, width, height, index, payload, containerWidth } = node;
    if (payload.value === 0) {
        return null;
    }
    const isOut = (x + width) + 6 > containerWidth;
    return (
        <Layer key={`sankey-node-${index}`}>
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill="#5192ca"
                fillOpacity="1"
            />
            <text
                textAnchor={isOut ? 'end' : 'start'}
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2 + 4}
                fontSize="12"
                fill="#000"
                strokeWidth={0}
                pointerEvents="none"
            >
                {payload.name}
                (
                {payload.value}
                )
            </text>
        </Layer>
    );
}

function SankeyLink(link: Link) {
    const {
        sourceX,
        targetX,
        sourceY,
        targetY,
        sourceControlX,
        targetControlX,
        linkWidth,
        index,
    } = link;

    return (
        <Layer key={`CustomLink${index}`}>
            <path
                className={styles.sankeyLink}
                d={`
            M${sourceX},${sourceY + linkWidth / 2}
            C${sourceControlX},${sourceY + linkWidth / 2}
              ${targetControlX},${targetY + linkWidth / 2}
              ${targetX},${targetY + linkWidth / 2}
            L${targetX},${targetY - linkWidth / 2}
            C${targetControlX},${targetY - linkWidth / 2}
              ${sourceControlX},${sourceY - linkWidth / 2}
              ${sourceX},${sourceY - linkWidth / 2}
            Z
                `}
                strokeWidth={0}
            />
        </Layer>
    );
}

function BudgetFlowSankey(props: Props) {
    const {
        className,
        data,
    } = props;

    return (
        <div
            className={_cs(className, styles.budgetFlowSankey)}
        >
            <ResponsiveContainer>
                <Sankey
                    data={data}
                    link={SankeyLink}
                    node={SankeyNode}
                >
                    <Tooltip />
                    <Label />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
}

export default React.memo(BudgetFlowSankey);
