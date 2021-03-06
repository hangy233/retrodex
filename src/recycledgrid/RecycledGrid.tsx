import React, { useEffect, useState } from 'react';
import { useThrottledCallback } from '../../node_modules/use-debounce/lib';
import { useRect } from '../hooks/useRect';
import './RecycledGrid.css';

type RecycledGridProps<T> = {
  list: Array<T>;
  extraItemProps: Object;
  itemWidth: number;
  itemHeight: number;
  initCursor?: number;
  keyField?: string;
  ItemComponent: React.ComponentType<T>;
  PlaceholderComponent: React.ComponentType<T>;
}

const RecycledGrid = ({list, ItemComponent, PlaceholderComponent, itemWidth, itemHeight, initCursor = 0, keyField, ...extraItemProps} : RecycledGridProps<any>): JSX.Element => {
  const [gridRef, {width: gridWidth, height: gridHeight}] = useRect<HTMLDivElement>();
  const columns = (gridWidth / itemWidth) | 0;
  const rows = (list.length / columns) | 0 + 1;
  const scrollHeight = rows * itemHeight;
  const visibleRows = (gridHeight / itemHeight) | 0 + 1;

  const [scrollTop, setScrollTop] = useState(initCursor * itemHeight);
  const cursor = (scrollTop / itemHeight) | 0;

  const start = Math.max((cursor - visibleRows) * columns, 0);
  const end = (cursor + visibleRows * 2) * columns;
  const topPadding = Math.max(0, cursor - visibleRows * 2) * itemHeight;
  // const bottomPadding = (rows - cursor + visibleRows * 3) * itemHeight;

  // const isOff = () => {
  //   if (!gridRef.current) return false;
  //   return gridRef.current.scrollTop < topPadding || gridRef.current.scrollTop > (scrollHeight - bottomPadding);
  // }

  // useEffect(() => {
  //   if (!gridRef?.current?.scrollTop) return;
  //   if (gridRef.current.scrollTop === initCursor * itemHeight) return;
  //   gridRef.current.scrollTop = initCursor * itemHeight;
  // }, [gridRef, initCursor, itemHeight, list]);

  const handleScroll = () => {
    if (!gridRef.current) return;
    setScrollTop(gridRef.current.scrollTop);
  }

  const throttledHandleScroll = useThrottledCallback(handleScroll, 200);

  return (
    <div ref={gridRef} className="recycled-grid" onScroll={throttledHandleScroll}>
      <div className="scroll-content" style={{height: `${scrollHeight}px`}}>
        <div className="inner-grid-content" style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth}px, 1fr))`,
          transform: `translateY(${topPadding}px)`,
          }}>
          {list.map((item, i) => {
            if (i >= start && i < end) {
              return <ItemComponent key={keyField ? item[keyField] : i} {...item} {...extraItemProps} />
            }
            if ((i >= start - visibleRows * columns) && i < (end + visibleRows * columns)) {
              return <PlaceholderComponent key={keyField ? item[keyField] : i} {...item} {...extraItemProps} />
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default RecycledGrid;
