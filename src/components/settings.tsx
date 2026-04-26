import React from 'react';
import { Drawer, Radio, Space, Typography, Button, Divider, ColorPicker, Tooltip, message } from 'antd';
import { UndoOutlined, CheckOutlined } from '@ant-design/icons';
import { useSettings, DEFAULT_SETTINGS } from './settings_context';

const { Title, Text } = Typography;

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Navy', color: '#1B3150' },
  { name: 'Gray', color: '#37474F' },
  { name: 'Blue', color: '#1565C0' },
  { name: 'Green', color: '#2E7D32' },
  { name: 'Purple', color: '#6A1B9A' },
  { name: 'Red', color: '#C62828' },
  { name: 'Warm', color: '#5D4037' },
];

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ open, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleReset = () => {
    resetSettings();
    message.success('설정이 초기화되었습니다.');
  };

  return (
    <Drawer
      title="환경 설정"
      placement="right"
      onClose={onClose}
      open={open}
      width={320}
    >
      {/* 테이블 밀도 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>테이블 밀도</Title>
        <Radio.Group
          value={settings.tableDensity}
          onChange={(e) => updateSettings({ tableDensity: e.target.value })}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="small">조밀</Radio.Button>
          <Radio.Button value="middle">기본</Radio.Button>
          <Radio.Button value="large">넓게</Radio.Button>
        </Radio.Group>
      </div>

      <Divider />

      {/* 테마 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>테마</Title>
        <Radio.Group
          value={settings.themeMode}
          onChange={(e) => updateSettings({ themeMode: e.target.value })}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="light">라이트 모드</Radio.Button>
          <Radio.Button value="dark">다크 모드</Radio.Button>
        </Radio.Group>
      </div>

      <Divider />

      {/* 레이아웃 색상 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>레이아웃 색상</Title>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {COLOR_PRESETS.map(preset => (
            <Tooltip title={preset.name} key={preset.name}>
              <div
                onClick={() => updateSettings({ layoutColor: preset.color })}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: preset.color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: settings.layoutColor === preset.color
                    ? '3px solid #1890ff'
                    : '2px solid rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  boxShadow: settings.layoutColor === preset.color
                    ? '0 0 0 2px rgba(24,144,255,0.3)'
                    : 'none',
                }}
              >
                {settings.layoutColor === preset.color && (
                  <CheckOutlined style={{ color: '#ffffff', fontSize: 14 }} />
                )}
              </div>
            </Tooltip>
          ))}
        </div>
        <Space>
          <Text>커스텀:</Text>
          <ColorPicker
            value={settings.layoutColor}
            onChange={(color) => updateSettings({ layoutColor: color.toHexString() })}
            showText
          />
        </Space>
      </div>

      <Divider />

      {/* 초기화 */}
      <Button
        icon={<UndoOutlined />}
        danger
        block
        onClick={handleReset}
      >
        설정 초기화
      </Button>
    </Drawer>
  );
};

export default SettingsDrawer;
