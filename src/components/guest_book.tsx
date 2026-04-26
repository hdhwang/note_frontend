import React, { useState, useEffect } from 'react';
import { useSettings } from './settings_context';
import { Layout, Table, Button, Input, message, Modal, Form, Select, Space, Checkbox, Dropdown } from 'antd';
import { SmartTable } from "./SmartTable";
import type { MenuProps, TablePaginationConfig } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import '../App.css';
import apiClient from './api/api_client';

const { Content } = Layout;
const { Option } = Select;

// 1. 데이터 구조 인터페이스 정의
interface GuestBookData {
  id: number;
  name: string;
  amount: number;
  date: string;
  area: string;
  attend: 'Y' | 'N' | '-';
  description: string;
}

const GuestBook: React.FC = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GuestBookData[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    amount: true,
    date: true,
    area: true,
    attend: true,
    description: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [currentGuest, setCurrentGuest] = useState<GuestBookData | null>(null);
  const [form] = Form.useForm();

  const columnLabels: Record<string, string> = {
    name: '이름',
    amount: '금액',
    date: '일자',
    area: '장소',
    attend: '참석 여부',
    description: '설명',
    actions: '작업',
  };

  const handleColumnVisibilityChange = (columnKey: string) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey as keyof typeof visibleColumns]: !prevState[columnKey as keyof typeof visibleColumns],
    }));
  };

  // 필드 설정 드롭다운 메뉴 구성
  const menuItems: MenuProps['items'] = Object.keys(columnLabels).map(columnKey => ({
    key: columnKey,
    label: (
        <Checkbox
            checked={visibleColumns[columnKey as keyof typeof visibleColumns]}
            onChange={() => handleColumnVisibilityChange(columnKey)}
            onClick={(e) => e.stopPropagation()}
        >
          {columnLabels[columnKey]}
        </Checkbox>
    ),
  }));

  // 전체 컬럼 정의 (align: 'center' as const 적용)
  const allColumns: ColumnType<GuestBookData>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center' as const,
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
          <div style={{ padding: 8 }}>
            <Input
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => confirm()}
                style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>확인</Button>
              <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>초기화</Button>
            </Space>
          </div>
      ),
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center' as const,
      sorter: true,
      render: (text: number) => new Intl.NumberFormat().format(text),
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '장소',
      dataIndex: 'area',
      key: 'area',
      align: 'center' as const,
      sorter: true,
    },
    {
      title: '참석 여부',
      dataIndex: 'attend',
      key: 'attend',
      align: 'center' as const,
      sorter: true,
      filters: [
        { text: '참석', value: 'Y' },
        { text: '미참석', value: 'N' },
        { text: '- (미정)', value: '-' },
      ],
      filterMultiple: false,
      render: (text: string) => {
        if (text === 'Y') return '참석';
        if (text === 'N') return '미참석';
        return '미정';
      },
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center' as const,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: GuestBookData) => (
          <Space size={2}>
            <Button type="text" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Space>
      ),
    },
  ];

  // 필터링된 컬럼 생성 및 타입 단언
  const columns = allColumns.filter(column =>
      column.key === 'index' || visibleColumns[column.key as keyof typeof visibleColumns]
  ) as ColumnsType<GuestBookData>;

  const getData = async (page = 1, pageSize = 10, ordering = 'name', filters = {}) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, ordering, ...filters };
      const response = await apiClient.get('guest-book', { params });
      setResult(response.data.results);
      setPagination({ current: page, pageSize, total: response.data.count });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '삭제하시겠습니까?',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`guest-book/${id}`);
          message.success('삭제되었습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (e) { message.error('삭제 실패'); }
      },
    });
  };

  const showEditModal = (guest: GuestBookData) => {
    setCurrentGuest(guest);
    form.setFieldsValue(guest);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddOrEdit = async (mode: 'add' | 'edit') => {
    try {
      const values = await form.validateFields();
      if (mode === 'add') {
        await apiClient.post('guest-book', values);
        message.success('추가되었습니다.');
        setIsAddModalVisible(false);
      } else if (mode === 'edit' && currentGuest) {
        await apiClient.put(`guest-book/${currentGuest.id}`, values);
        message.success('수정되었습니다.');
        setIsModalVisible(false);
      }
      getData(pagination.current, pagination.pageSize);
    } catch (e) { message.error('작업에 실패했습니다.'); }
  };

  useEffect(() => { getData(); }, []);

  const handleTableChange = (
      p: TablePaginationConfig,
      f: Record<string, any>,
      s: any
  ) => {
    const order = s.field ? (s.order === 'ascend' ? s.field : `-${s.field}`) : 'name';
    getData(p.current || 1, p.pageSize || 10, order, f);
  };

  return (
      <div>
        <Content style={{ padding: '24px' }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: '8px 0' }}>
              <Space wrap>
                <Button className="responsive-icon-btn" icon={<ReloadOutlined />} onClick={() => getData(pagination.current, pagination.pageSize)}>새로고침</Button>
                <Button className="responsive-icon-btn" icon={<PlusOutlined />} onClick={showAddModal}>추가</Button>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                  <Button className="responsive-icon-btn" icon={<EyeOutlined />}>필드 보기</Button>
                </Dropdown>
              </Space>
            </div>

            <SmartTable tableId="guest_book_table"
                size={settings.tableDensity}
                dataSource={result}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 'max-content' }}
            />
          </div>
        </Content>

        {/* 추가/편집 모달 재사용 구조 */}
        {(['add', 'edit'] as const).map(mode => {
          const isAdd = mode === 'add';
          const visible = isAdd ? isAddModalVisible : isModalVisible;
          const setVisible = isAdd ? setIsAddModalVisible : setIsModalVisible;

          return (
              <Modal
                  key={mode}
                  title={`결혼식 방명록 ${isAdd ? '추가' : '편집'}`}
                  open={visible}
                  onOk={() => handleAddOrEdit(mode)}
                  onCancel={() => setVisible(false)}
              >
                <Form form={form} layout="vertical">
                  <Form.Item name="name" label="이름" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="amount" label="금액"><Input type="number" /></Form.Item>
                  <Form.Item name="date" label="일자" rules={[{ pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'YYYY-MM-DD 형식' }]}>
                    <Input placeholder="YYYY-MM-DD" />
                  </Form.Item>
                  <Form.Item name="area" label="장소"><Input /></Form.Item>
                  <Form.Item name="attend" label="참석 여부" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Y">참석</Option>
                      <Option value="N">미참석</Option>
                      <Option value="-">미정</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="description" label="설명"><Input.TextArea autoSize={{ minRows: 2 }} /></Form.Item>
                </Form>
              </Modal>
          )
        })}
      </div>
  );
}

export default GuestBook;