import { Timeline, Tag, Space, Typography, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
  PauseCircleOutlined,
  ExperimentOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import type { RegulatorySystem, StageConfig } from '../../types/regulatory';
import { STAGE_FLOW } from '../../types/regulatory';
import type { TrackName, TrackStatus } from '../../types/application';
import { TECHNICAL_REVIEW_TRACKS } from '../../utils/constants';

const { Text } = Typography;

export interface TimelineStage {
  key: string;
  name: string;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'skipped';
  startDate?: string;
  completionDate?: string;
  deadline?: string;
  clockStoppedAt?: string;
  notes?: string;
  trackStatuses?: Record<TrackName, TrackStatus>;
}

interface RegulatoryTimelineProps {
  stages: TimelineStage[];
  systemCode: RegulatorySystem;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待开始', color: '#d9d9d9', icon: <MinusCircleOutlined /> },
  in_progress: { label: '进行中', color: '#1A5C9E', icon: <SyncOutlined spin /> },
  paused: { label: '暂停中', color: '#faad14', icon: <PauseCircleOutlined /> },
  completed: { label: '已完成', color: '#52c41a', icon: <CheckCircleOutlined /> },
  skipped: { label: '已跳过', color: '#d9d9d9', icon: <MinusCircleOutlined /> },
};

const TRACK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: '#d9d9d9' },
  in_progress: { label: '审评中', color: '#1A5C9E' },
  paused: { label: '已发补', color: '#faad14' },
  completed: { label: '通过', color: '#52c41a' },
};

const TRACK_ICONS: Record<TrackName, React.ReactNode> = {
  pharmaceutical: <ExperimentOutlined />,
  nonclinical: <ExperimentOutlined />,
  clinical: <ExperimentOutlined />,
};

const SYSTEM_LABELS: Record<RegulatorySystem, string> = {
  NMPA: 'NMPA 审评流程',
  FDA: 'FDA Review Process',
  EMA: 'EMA Review Process',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function RegulatoryTimeline({ stages, systemCode }: RegulatoryTimelineProps) {
  const flowConfig = STAGE_FLOW[systemCode] || [];
  const flowMap: Record<string, StageConfig> = {};
  flowConfig.forEach((s) => { flowMap[s.key] = s; });

  const timelineItems = stages.map((stage, index) => {
    const cfg = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending;
    const flowCfg = flowMap[stage.key];

    // Determine dot color
    const dotColor = stage.status === 'in_progress' ? '#1A5C9E'
      : stage.status === 'completed' ? '#52c41a'
      : stage.status === 'paused' ? '#faad14'
      : '#d9d9d9';

    const dot = (
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: dotColor,
        border: `2px solid ${dotColor}`,
      }}>
        {stage.status === 'in_progress' && (
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2px solid #1A5C9E',
            margin: '-6px 0 0 -6px',
            animation: 'pulse 1.5s infinite',
          }} />
        )}
      </div>
    );

    // Check if this is the technical_review stage with parallel tracks
    const hasTracks = stage.key === 'technical_review' && flowCfg?.tracks && flowCfg?.tracks.length > 0;

    return {
      color: dotColor,
      dot,
      children: (
        <div style={{
          padding: '8px 0',
          opacity: stage.status === 'skipped' ? 0.5 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{
              fontSize: 14,
              color: stage.status === 'in_progress' ? '#1A5C9E' : '#333',
            }}>
              {stage.name}
            </Text>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            {flowCfg && (
              <Tooltip title={flowCfg.description}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  (约 {flowCfg.estimatedDays} {systemCode === 'NMPA' ? '个工作日' : '天'})
                </Text>
              </Tooltip>
            )}
            {/* Clock-stop indicator */}
            {stage.clockStoppedAt && stage.status === 'paused' && (
              <Tooltip title={`审评时钟暂停于 ${formatDate(stage.clockStoppedAt)} — 等待申请人补正资料`}>
                <Tag color="orange" icon={<AlertOutlined />}>
                  时钟暂停
                </Tag>
              </Tooltip>
            )}
            {flowCfg?.priorityDays && stage.key === 'technical_review' && (
              <Tooltip title={`优先审评：${flowCfg.priorityDays}个工作日 / IND：${flowCfg.indDays}个工作日`}>
                <Tag color="blue" style={{ fontSize: 11 }}>优先/IND</Tag>
              </Tooltip>
            )}
          </div>

          {flowCfg?.description && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {flowCfg.description}
            </Text>
          )}

          {/* Parallel tracks for technical_review */}
          {hasTracks && (
            <div style={{
              marginTop: 8,
              marginLeft: 4,
              padding: '8px 12px',
              background: '#FAFBFC',
              borderRadius: 6,
              border: '1px solid #F0F0F0',
            }}>
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 6, display: 'block' }}>
                平行审评三线：
              </Text>
              {flowCfg.tracks!.map((trackKey) => {
                const trackName = trackKey as TrackName;
                const trackLabel = TECHNICAL_REVIEW_TRACKS[trackName] || trackKey;
                const trackStatus = stage.trackStatuses?.[trackName] || 'pending';
                const trackCfg = TRACK_STATUS_CONFIG[trackStatus] || TRACK_STATUS_CONFIG.pending;
                return (
                  <div key={trackKey} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    fontSize: 12,
                  }}>
                    <span>
                      <span style={{ marginRight: 6, color: '#999' }}>
                        {TRACK_ICONS[trackName]}
                      </span>
                      <Text style={{ fontSize: 12 }}>{trackLabel}</Text>
                    </span>
                    <Tag
                      color={trackCfg.color}
                      style={{ fontSize: 11, marginLeft: 8 }}
                    >
                      {trackCfg.label}
                    </Tag>
                  </div>
                );
              })}
            </div>
          )}

          <Space size={16} style={{ fontSize: 12 }}>
            {stage.startDate && (
              <span>
                <Text type="secondary">开始: </Text>
                <Text>{formatDate(stage.startDate)}</Text>
              </span>
            )}
            {stage.completionDate && (
              <span>
                <Text type="secondary">完成: </Text>
                <Text>{formatDate(stage.completionDate)}</Text>
              </span>
            )}
            {stage.deadline && stage.status !== 'completed' && (
              <span>
                <Text type="secondary">截止: </Text>
                <Text style={{ color: '#faad14' }}>{formatDate(stage.deadline)}</Text>
              </span>
            )}
            {stage.clockStoppedAt && stage.status === 'paused' && (
              <span>
                <Text type="secondary">时钟暂停于: </Text>
                <Text style={{ color: '#faad14' }}>{formatDate(stage.clockStoppedAt)}</Text>
              </span>
            )}
          </Space>

          {stage.notes && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {stage.notes}
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      <div style={{
        marginBottom: 16,
        padding: '12px 16px',
        background: '#F0F5FF',
        borderRadius: 8,
        border: '1px solid #D6E4FF',
      }}>
        <Text strong style={{ color: '#1A5C9E', fontSize: 15 }}>
          {SYSTEM_LABELS[systemCode] || systemCode + ' Review Process'}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          共 {flowConfig.length} 个阶段，预计总时长约 {flowConfig.reduce((s, c) => s + c.estimatedDays, 0)} {systemCode === 'NMPA' ? '个工作日' : '天'}
          {systemCode === 'NMPA' && '（含并行阶段）'}
        </Text>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.4); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Timeline items={timelineItems} />
    </div>
  );
}
