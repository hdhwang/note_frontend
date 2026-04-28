import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Resizable } from 'react-resizable';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface SmartTableProps<RecordType> extends TableProps<RecordType> {
  tableId: string;
  lastRefreshed?: number;
}

// 가벼운 HTML5 기본 드래그 앤 드롭 및 리사이즈 지원 커스텀 헤더 셀
const DraggableResizableHeaderCell = (props: any) => {
  const { 
      id, index, onResize, width, className, children, 
      onDragStart, onDragOver, onDrop, onDragLeave, dragOverIndex,
      ...restProps 
  } = props;

  const isDragOver = dragOverIndex === index;

  const style: React.CSSProperties = {
    ...restProps.style,
    cursor: id && id !== 'actions' ? 'grab' : 'default',
    // 드래그 중인 컬럼이 위치할 곳에 구분선 표시
    borderLeft: isDragOver ? '3px solid #1677ff' : restProps.style?.borderLeft,
  };

  if (!width || !id || id === 'actions') {
    // 너비가 지정되지 않았거나, 작업(actions) 컬럼 등은 리사이즈/드래그 제외
    return <th {...restProps} className={className} style={{...restProps.style, borderLeft: style.borderLeft}}>{children}</th>;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <div
          className="react-resizable-handle"
          style={{
            position: 'absolute',
            right: -5,
            bottom: 0,
            zIndex: 100,
            width: 10,
            height: '100%',
            cursor: 'col-resize',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()} // 리사이즈 시 드래그 차단
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th 
        {...restProps} 
        style={{ ...style, position: 'relative' }} 
        className={className}
        draggable
        onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('colIndex', index.toString());
            if (onDragStart) onDragStart(index);
        }}
        onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (onDragOver) onDragOver(index);
        }}
        onDragLeave={() => {
            if (onDragLeave) onDragLeave();
        }}
        onDrop={(e) => {
            e.preventDefault();
            const sourceIndexStr = e.dataTransfer.getData('colIndex');
            if (sourceIndexStr && onDrop) {
                const sourceIndex = parseInt(sourceIndexStr, 10);
                onDrop(sourceIndex, index);
            }
        }}
      >
        <div style={{ display: 'inline-block', width: '100%' }}>
            {children}
        </div>
      </th>
    </Resizable>
  );
};

export function SmartTable<RecordType extends object>({ tableId, columns = [], ...restProps }: SmartTableProps<RecordType>) {
  const [smartColumns, setSmartColumns] = useState<any[]>(columns);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`smart_table_${tableId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedColumns = parsed.map((savedCol: any) => {
           const origCol = columns.find((c: any) => c.key === savedCol.key || c.dataIndex === savedCol.dataIndex);
           return origCol ? { ...origCol, width: savedCol.width } : null;
        }).filter(Boolean);
        
        const newColumns = columns.filter((c: any) => !mergedColumns.find((mc: any) => mc.key === c.key || mc.dataIndex === c.dataIndex));
        
        const finalCols = [...mergedColumns, ...newColumns].map(c => ({
            ...c, 
            width: c.width || 150
        }));

        // 작업(actions) 컬럼은 항상 맨 우측(마지막)에 위치하도록 강제 조정
        const actionsIndex = finalCols.findIndex((c: any) => c.key === 'actions' || c.dataIndex === 'actions');
        if (actionsIndex > -1) {
            const actionsCol = finalCols.splice(actionsIndex, 1)[0];
            finalCols.push(actionsCol);
        }

        setSmartColumns(finalCols);
      } catch (e) {
        setSmartColumns(columns.map((c: any) => ({ ...c, width: c.width || 150 })));
      }
    } else {
        setSmartColumns(columns.map((c: any) => ({ ...c, width: c.width || 150 })));
    }
  }, [columns, tableId]);

  // 설정 초기화 이벤트 수신
  useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === null || e.key === `smart_table_${tableId}`) {
              if (!localStorage.getItem(`smart_table_${tableId}`)) {
                  setSmartColumns(columns.map((c: any) => ({ ...c, width: c.width || 150 })));
              }
          }
      };
      window.addEventListener('storage', handleStorageChange);
      const handleCustomReset = () => {
          setSmartColumns(columns.map((c: any) => ({ ...c, width: c.width || 150 })));
      };
      window.addEventListener('reset_table_settings', handleCustomReset);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('reset_table_settings', handleCustomReset);
      };
  }, [columns, tableId]);

  const saveSettings = (newCols: any[]) => {
      setSmartColumns(newCols);
      const settingsToSave = newCols.map(c => ({ key: c.key || c.dataIndex, dataIndex: c.dataIndex, width: c.width }));
      localStorage.setItem(`smart_table_${tableId}`, JSON.stringify(settingsToSave));
  };

  const handleResize = (index: number) => (_: React.SyntheticEvent<Element>, { size }: { size: { width: number } }) => {
    const newColumns = [...smartColumns];
    newColumns[index] = {
      ...newColumns[index],
      width: size.width,
    };
    saveSettings(newColumns);
  };

  const handleDrop = (sourceIndex: number, targetIndex: number) => {
      setDragOverIndex(null);
      if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;

      const newColumns = [...smartColumns];
      const [draggedCol] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(targetIndex, 0, draggedCol);
      saveSettings(newColumns);
  };

  const mergedColumns = smartColumns.map((col, index) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      onResize: handleResize(index),
      id: column.key || column.dataIndex,
      index: index,
      onDragStart: () => setDragOverIndex(null),
      onDragOver: (idx: number) => setDragOverIndex(idx),
      onDragLeave: () => setDragOverIndex(null),
      onDrop: handleDrop,
      dragOverIndex: dragOverIndex,
    }),
  }));

  let mergedPagination = restProps.pagination;
  if (mergedPagination !== false && mergedPagination !== undefined) {
      mergedPagination = {
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          ...mergedPagination,
          showTotal: (total, range) => (
              <span style={{ marginRight: 16 }}>
                  {restProps.lastRefreshed ? <span style={{ fontSize: '0.85em', color: '#888' }}>마지막 새로고침: {dayjs(restProps.lastRefreshed).fromNow()} | </span> : ''}
                  총 {total}건 중 {range[0]}~{range[1]}건
              </span>
          ),
      };
  }

  const customFooter = restProps.pagination === false && restProps.lastRefreshed ? () => (
      <div style={{ textAlign: 'right', fontSize: '0.85em', color: '#888' }}>
          마지막 새로고침: {dayjs(restProps.lastRefreshed).fromNow()}
      </div>
  ) : restProps.footer;

  return (
    <Table
      {...restProps}
      pagination={mergedPagination}
      footer={customFooter}
      columns={mergedColumns}
      components={{
        header: {
          cell: DraggableResizableHeaderCell,
        },
      }}
    />
  );
}
