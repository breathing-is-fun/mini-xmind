import React, { useEffect } from 'react';
import classNames from 'classnames';
import LineGroup, { LineProps } from '../tools/LineGroup';
import {
  preventDefault,
  generateKey,
  stopPropagation,
} from '../utils/LineUtil';
import TagGroup, { TagGroupItem } from '../tools/TagGroup';
import BlockGroup, {
  BlockProps,
  updateLineDataByTargetDom,
} from '../tools/BlockGroup';
import Draggable from 'react-draggable';
import { TagProps } from 'antd/lib/tag';
import { setClickList, getTargetDom, setLineMapping } from './nino-zone';
import { OrientationProps } from '../line/SteppedLine';

export type CanvasPositionProps = {
  x: number;
  y: number;
  z: number;
  gap: number;
};
export type DataSource = {
  CanvasPosition?: CanvasPositionProps;
  BlockGroup?: BlockProps;
  TagGroup?: TagGroupItem;
  LineGroup?: LineProps;
};
export interface CanvasProps {
  className?: string;
  data: DataSource;
  orientation?: OrientationProps;
  blockClassName?: string;
  tagClassName?: string;
  lineClassName?: string;
  onChange?: (item: DataSource) => void;
  onWheel?: (item: DataSource, event?: any) => void;
  onClick?: () => void;
}
export interface CanvasState {
  newBlockProps?: BlockProps;
  newLinesProps?: LineProps;
  newTagProps?: TagProps;
  newPosition?: CanvasPositionProps;
}
export type ContextMenuProps = {
  event: Event;
  key: string;
  group: string;
};

export const defaultCanvasPosition = { x: 0, y: 0, z: 0, gap: 1 };

const Canvas = ({
  className,
  orientation = 'horizonal',
  blockClassName,
  tagClassName,
  lineClassName,
  data,
  onChange,
  onWheel,
  ...rest
}: CanvasProps) => {
  let blockProps = (data && data.BlockGroup) || {};
  let linesProps = (data && data.LineGroup) || {};
  let tagProps = (data && data.TagGroup) || {};
  let position = (data && data.CanvasPosition) || defaultCanvasPosition;

  useEffect(() => {
    setLineMapping(linesProps);
  }, [linesProps]);

  const handleBlockChange = (newBlockProps: BlockProps, blockDOM: any) => {
    if (onChange) {
      const newLinesProps = updateLineDataByTargetDom(linesProps, blockDOM);
      onChange(getTarData({ newBlockProps, newLinesProps }));
    }
  };

  const handleTagChange = (newTagProps: TagGroupItem) => {
    if (onChange) {
      onChange(getTarData({ newTagProps }));
    }
  };

  const onDrop = (e: any) => {
    let dragItem = e.dataTransfer.getData('dragItem');
    if (!dragItem) {
      return false;
    }
    dragItem = dragItem ? JSON.parse(dragItem) : {};
    const { value } = dragItem;
    const { clientX, clientY } = e;
    let defaultWidth = 100;
    let defaultHeight = 80;
    const newBlockProps: any = {};
    const newTagProps: any = {};

    switch (value) {
      case 'block':
        newBlockProps[generateKey('block')] = {
          x: clientX - defaultWidth / 2 - position.x,
          y: clientY - defaultHeight / 2 - position.y,
        };
        if (onChange) {
          onChange(getTarData({ newBlockProps }));
        }
        break;

      case 'input':
        defaultWidth = 100;
        defaultHeight = 32;
        newTagProps[generateKey('tag')] = {
          x: clientX - defaultWidth / 2 - position.x,
          y: clientY - defaultHeight / 2 - position.y,
          editable: true,
        };
        if (onChange) {
          onChange(getTarData({ newTagProps }));
        }
        break;
      default:
        break;
    }
  };

  const handleDrag = (_: any, { x, y }: { x: number; y: number }) => {
    const newPosition = Object.assign({}, position, { x, y });
    if (onChange) {
      onChange(getTarData({ newPosition }));
    }
  };

  const handleDragStart = (e: MouseEvent) => {
    setClickList({}, true);
    stopPropagation(e);
  };

  const handleRightClick = ({ key, event, group }: ContextMenuProps) => {
    preventDefault(event);
    switch (group) {
      case 'block-group':
        delete blockProps[key];
        break;

      case 'tag-group':
        delete tagProps[key];
        break;

      default:
        break;
    }
    for (const lineKey of Object.keys(linesProps)) {
      const { fromKey, toKey } = linesProps[lineKey];
      if (fromKey === key || toKey === key) {
        delete linesProps[lineKey];
      }
    }
    if (onChange) {
      onChange(
        getTarData({
          newBlockProps: blockProps,
          newLinesProps: linesProps,
          newTagProps: tagProps,
        }),
      );
    }
  };

  const handleOnWhell = (e: any) => {
    if (onWheel) {
      onWheel(getTarData({}), e);
    }
  };

  const getTarData = ({
    newBlockProps,
    newLinesProps,
    newTagProps,
    newPosition,
  }: CanvasState) => {
    return {
      BlockGroup: Object.assign({}, blockProps, newBlockProps),
      LineGroup: Object.assign({}, linesProps, newLinesProps),
      TagGroup: Object.assign({}, tagProps, newTagProps),
      CanvasPosition: Object.assign({}, position, newPosition),
    };
  };

  const renderLineGroup = (targetDom: any) => (
    <LineGroup
      data={updateLineDataByTargetDom(linesProps, targetDom)}
      offset={position}
      orientation={orientation}
      className={lineClassName}
    />
  );

  return (
    <Draggable
      onDrag={handleDrag}
      position={position}
      onStart={handleDragStart}
    >
      <div
        className={classNames('Canvas', className)}
        onDragOver={preventDefault}
        onDrop={onDrop}
        onWheel={handleOnWhell}
        {...rest}
      >
        {
          <>
            <BlockGroup
              offset={position}
              data={blockProps}
              onChange={handleBlockChange}
              lineData={linesProps}
              className={blockClassName}
              onContextMenu={handleRightClick}
            />
            <TagGroup
              data={tagProps}
              onChange={handleTagChange}
              className={tagClassName}
              lineData={linesProps}
              onContextMenu={handleRightClick}
            />
          </>
        }
        {renderLineGroup(getTargetDom())}
      </div>
    </Draggable>
  );
};

export default Canvas;
