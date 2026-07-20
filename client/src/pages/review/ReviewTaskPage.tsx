import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Timeline, Tag, Button, Space, Spin, Typography,
  Input, Select, Form, message, Modal, Descriptions, Divider
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { applicationService } from '../../services/applicationService';
import { reviewService } from '../../services/reviewService';
import {
  APPLICATION_TYPES, STAGE_LABELS,
  STAGE_STATUS, APPLICATION_STATUS, REVIEW_ACTIONS,
} from '../../utils/constants';
import type { Application, Review } from '../../types/application';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ReviewTaskPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewContent, setReviewContent] = useState('');
  const [reviewAction, setReviewAction] = useState('comment');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageAction, setStageAction] = useState('approve');
  const [stageNotes, setStageNotes] = useState('');
  const [advancingStage, setAdvancingStage] = useState(false);

  const fetchData = async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const [appData, reviewData] = await Promise.all([
        applicationService.getById(parseInt(appId)),
        reviewService.getByApplication(parseInt(appId)),
      ]);
      setApp(appData);
      setReviews(reviewData);
    } catch {
      navigate('/reviewer/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [appId]);

  const handleSubmitReview = async () => {
    if (!app || !reviewContent.trim()) return;
    const currentStage = app.stages?.find(s => s.status === 'in_progress');
    setSubmittingReview(true);
    try {
      await reviewService.create(app.id, {
        stageId: currentStage?.id,
        content: reviewContent,
        action: reviewAction,
      });
      message.success('审评意见已提交');
      setReviewContent('');
      fetchData();
    } catch { /* handled */ }
    finally { setSubmittingReview(false); }
  };

  const handleAdvanceStage = async () => {
    if (!app) return;
    setAdvancingStage(true);
    try {
      await applicationService.advanceStage(app.id, stageAction, stageNotes || undefined);
      message.success('审评操作完成');
      setStageModalOpen(false);
      setStageNotes('');
      fetchData();
    } catch { /* handled */ }
    finally { setAdvancingStage(false); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!app) return null;

  const currentStage = app.stages?.find(s => s.status === 'in_progress');

  const timelineItems = (app.stages || []).map((stage) => {
    const stageCfg = STAGE_STATUS[stage.status];
    const color = stageCfg?.color === 'processing' ? 'blue' :
      stageCfg?.color === 'success' ? 'green' :
        stageCfg?.color === 'warning' ? 'orange' : 'gray';

    return {
      color,
      children: (
        <div>
          <div style={{ fontWeight: stage.status === 'in_progress' ? 600 : 400 }}>
            {STAGE_LABELS[stage.stageName] || stage.stageName}
            <Tag color={color} style={{ marginLeft: 8 }}>{stageCfg?.label}</Tag>
          </div>
          {stage.deadline && (
            <div style={{ fontSize: 12, color: '#faad14' }}>
              截止: {new Date(stage.deadline).toLocaleString('zh-CN')}
            </div>
          )}
          {stage.notes && (
            <Paragraph style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {stage.notes}
            </Paragraph>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reviewer/tasks')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>
            {app.applicationNo} - {app.drugName}
          </Title>
        </Space>
        {currentStage && (
          <Button type="primary" onClick={() => setStageModalOpen(true)}>
            审评操作（推进/发补/否决）
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="申请信息">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="受理号">{app.applicationNo}</Descriptions.Item>
            <Descriptions.Item label="注册类型">{APPLICATION_TYPES[app.type]}</Descriptions.Item>
            <Descriptions.Item label="药品名称">{app.drugName}</Descriptions.Item>
            <Descriptions.Item label="药品分类">{app.drugType}</Descriptions.Item>
            <Descriptions.Item label="申请人">{app.applicant?.realName}</Descriptions.Item>
            <Descriptions.Item label="申请单位">{app.applicant?.organization}</Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={APPLICATION_STATUS[app.status]?.color}>
                {APPLICATION_STATUS[app.status]?.label}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="审评阶段">
          <Timeline items={timelineItems} />
        </Card>

        <Card title="审评意见" style={{ gridColumn: '1 / -1' }}>
          {reviews.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无审评意见</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <Text strong>{review.reviewer?.realName}</Text>
                    {review.action && review.action !== 'comment' && (
                      <Tag color={review.action === 'approve' ? 'green' : review.action === 'request_supplement' ? 'orange' : 'red'}>
                        {REVIEW_ACTIONS[review.action]}
                      </Tag>
                    )}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(review.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </div>
                <Paragraph>{review.content}</Paragraph>
              </div>
            ))
          )}

          <Divider />
          <div>
            <Text strong>添加意见:</Text>
            <Select
              value={reviewAction}
              onChange={setReviewAction}
              style={{ width: 160, marginLeft: 8 }}
              options={[
                { value: 'comment', label: '评论' },
                { value: 'approve', label: '通过' },
                { value: 'request_supplement', label: '要求补正' },
                { value: 'reject', label: '不通过' },
              ]}
            />
            <TextArea
              rows={3}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="审评意见..."
              style={{ marginTop: 8 }}
            />
            <Button
              type="primary"
              onClick={handleSubmitReview}
              loading={submittingReview}
              style={{ marginTop: 8 }}
            >
              提交意见
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        title="审评操作"
        open={stageModalOpen}
        onCancel={() => setStageModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setStageModalOpen(false)}>取消</Button>,
          <Button key="submit" type="primary" loading={advancingStage}
            onClick={handleAdvanceStage}
            danger={stageAction === 'reject'}>
            确认
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="操作类型">
            <Select value={stageAction} onChange={setStageAction} style={{ width: '100%' }}
              options={[
                { value: 'approve', label: '✅ 通过 → 推进到下一阶段' },
                { value: 'request_supplement', label: '⚠️ 要求补充资料（暂停）' },
                { value: 'reject', label: '❌ 不予批准' },
              ]}
            />
          </Form.Item>
          {currentStage && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              当前阶段: <Text strong>{STAGE_LABELS[currentStage.stageName]}</Text>
            </div>
          )}
          <Form.Item label="备注">
            <TextArea rows={3} value={stageNotes} onChange={(e) => setStageNotes(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
