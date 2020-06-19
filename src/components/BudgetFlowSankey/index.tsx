import React, { useMemo } from 'react';
import {
    Sankey,
    Tooltip,
    Layer,
    Label,
    Rectangle,
    ResponsiveContainer,
} from 'recharts';
import { SankeyData } from '#types';
import { typedMemo } from '#utils/common';

import styles from './styles.css';

type ExtendedData<T> = T & {
    value: number;
    depth: number;
}

interface Node<T> {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: ExtendedData<T>;
    containerWidth: number;
}

interface Link<T> {
    sourceX: number;
    targetX: number;
    sourceY: number;
    targetY: number;
    sourceControlX: number;
    targetControlX: number;
    linkWidth: number;
    index: number;
    payload: {
        source: ExtendedData<T>;
        target: ExtendedData<T>;
    };
}

function getNode<T>(
    labelSelector: (val: ExtendedData<T>) => string,
    colorSelector: (val: ExtendedData<T>) => string,
) {
    return (node: Node<T>) => {
        const {
            x,
            y,
            width,
            height,
            index,
            payload,
            // containerWidth,
        } = node;

        const {
            value,
            depth,
        } = payload;

        if (value <= 0) {
            return null;
        }

        // FIXME: containerWidth is not defined idk why, need to fix this
        // const isOut = (x + width) + 6 > containerWidth;
        const isOut = depth >= 3 - 1;

        const label = labelSelector(payload);
        const color = colorSelector(payload);
        return (
            <Layer key={`sankey-node-${index}`}>
                <Rectangle
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    fillOpacity="1"
                />
                {height >= 14 && (
                    <text
                        textAnchor={isOut ? 'end' : 'start'}
                        x={isOut ? x - 6 : x + width + 6}
                        y={y + height / 2 + 4}
                        fontSize="14"
                        fill="var(--color-text)"
                        strokeWidth={0}
                        pointerEvents="none"
                    >
                        {label}
                    </text>
                )}
            </Layer>
        );
    };
}

function getLink<T>(
    colorSelector: (val: ExtendedData<T>) => string,
) {
    return (link: Link<T>) => {
        const {
            sourceX,
            targetX,
            sourceY,
            targetY,
            sourceControlX,
            targetControlX,
            linkWidth,
            index,
            payload,
        } = link;

        const d = `
        M${sourceX},${sourceY + linkWidth / 2}
        C${sourceControlX},${sourceY + linkWidth / 2}
        ${targetControlX},${targetY + linkWidth / 2}
        ${targetX},${targetY + linkWidth / 2}
        L${targetX},${targetY - linkWidth / 2}
        C${targetControlX},${targetY - linkWidth / 2}
        ${sourceControlX},${sourceY - linkWidth / 2}
        ${sourceX},${sourceY - linkWidth / 2}
        Z`;

        const id = `gradient-id-${index}`;

        const colorFoo = colorSelector(payload.source);
        const colorBar = colorSelector(payload.target);

        return (
            <Layer key={`custom-link-${index}`}>
                <defs>
                    <linearGradient id={id}>
                        <stop offset="5%" stopColor={colorFoo} />
                        <stop offset="95%" stopColor={colorBar} />
                    </linearGradient>
                </defs>
                <path
                    className={styles.sankeyLink}
                    d={d}
                    fill={`url('#${id}')`}
                    strokeWidth={0}
                />
            </Layer>
        );
    };
}

interface Props<T> {
    data: SankeyData<T> | undefined;
    colorSelector: (val: ExtendedData<T>) => string;
    nameSelector: (val: ExtendedData<T>) => string;
}

function BudgetFlowSankey<T>(props: Props<T>) {
    const {
        data: newData,
        colorSelector,
        nameSelector,
    } = props;

    /*
    const newData = useMemo(
        () => {
            if (!data) {
                return data;
            }
            const allReferencedNodes = new Set<number>();
            data.links.forEach((item) => {
                allReferencedNodes.add(item.source);
                allReferencedNodes.add(item.target);
            });

            const usedNodes = data.nodes.map((item, index) => ({
                ...item,
                prevIndex: index,
                used: allReferencedNodes.has(index),
            }));
            const onlyUsedNodes = usedNodes.filter(item => item.used);

            const mapping: { [key: number]: number } = onlyUsedNodes.reduce(
                (acc, val, index) => ({
                    ...acc,
                    [val.prevIndex]: index,
                }),
                {},
            );
            const mappedLinks = data.links.map(item => ({
                ...item,
                source: mapping[item.source],
                target: mapping[item.target],
            }));

            return {
                nodes: onlyUsedNodes,
                links: mappedLinks,
            };
        },
        [data],
    );
    */

    if (!newData || newData.links.length <= 0 || newData.nodes.length <= 0) {
        return null;
    }

    const node = getNode(
        nameSelector,
        colorSelector,
    );

    const link = getLink(
        colorSelector,
    );

    return (
        <ResponsiveContainer>
            <Sankey
                nameKey={nameSelector}
                data={newData}
                link={link}
                node={node}
                // FIXME: make this customizable
                margin={{
                    top: 14,
                    left: 14,
                    right: 14,
                    bottom: 14,
                }}
                iterations={2000}
                danglingLeaf
            >
                <Tooltip />
                <Label />
            </Sankey>
        </ResponsiveContainer>
    );
}

export default typedMemo(BudgetFlowSankey);
