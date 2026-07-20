import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Timeline, Button, Space, Spin, Typography,
  Input, Select, Upload, List, Divider, Popconfirm, Form, message, Modal, Row, Col,
  InputNumber, Badge, Tooltip, Empty,
} from 'antd';
import {
  ArrowLeftOutlined, SendOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, CloseCircleOutlined,
  UploadOutlined, DownloadOutlined, DeleteOutlined, EditOutlined,
  ReloadOutlined, AlertOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { applicationService } from '../../services/applicationService';
import { reviewService, documentService } from '../../services/reviewService';
import { useAuthStore } from '../../store/authStore';
import {
  APPLICATION_TYPES, APPLICATION_STATUS, STAGE_LABELS,
  STAGE_STATUS, DOCUMENT_TYPES, REVIEW_ACTIONS,
  TECHNICAL_REVIEW_TRACKS, DEFICIENCY_LETTER_STATUS, NMPA_REVIEW_TIMELINES,
} from '../../utils/constants';
import type { Application, Review, DeficiencyLetter, StageName, TrackName, TrackStatus } from '../../types/application';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Track status display config
const TRACK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: '#d9d9d9' },
  in_progress: { label: '审评中', color: '#1A5C9E' },
  paused: { label: '已发补', color: '#faad14' },
  completed: { label: '通过', color: '#52c41a' },
};

const TRACK_ORDER: TrackName[] = ['pharmaceutical', 'nonclinical', 'clinical'];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [app, setApp] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewContent, setReviewContent] = useState('');
  const [reviewAction, setReviewAction] = useState('comment');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Upload
  const [uploadType, setUploadType] = useState('其他');
  const [uploading, setUploading] = useState(false);

  // Stage advance modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageAction, setStageAction] = useState('approve');
  const [stageNotes, setStageNotes] = useState('');
  const [advancingStage, setAdvancingStage] = useState(false);

  // Deficiency letter fields in stage modal
  const [deficiencyRound, setDeficiencyRound] = useState(1);

  // Deficiency letter section
  const [deficiencyLetters, setDeficiencyLetters] = useState<DeficiencyLetter[]>([]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [appData, reviewData] = await Promise.all([
        applicationService.getById(parseInt(id)),
        reviewService.getByApplication(parseInt(id)),
      ]);
      setApp(appData);
      setReviews(reviewData);

      // Collect deficiency letters from all stages
      const letters: DeficiencyLetter[] = [];
      (appData.stages || []).forEach((stage) => {
        if (stage.deficiencyLetters) {
          letters.push(...stage.deficiencyLetters);
        }
      });
      setDeficiencyLetters(letters);
    } catch {
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSubmit = async () => {
    if (!app) return;
    try {
      const updated = await applicationService.submit(app.id);
      setApp(updated);
      message.success(`提交成功！受理号: ${updated.applicationNo}`);
    } catch { /* handled */ }
  };

  const handleResumeReview = async () => {
    if (!app) return;
    try {
      const updated = await applicationService.resumeReview(app.id);
      setApp(updated);
      message.success('补正已提交，审评已恢复');
      fetchData();
    } catch { /* handled */ }
  };

  const handleSubmitReview = async () => {
    if (!app || !reviewContent.trim()) return;
    const currentStage = app.stages?.find(s => s.status === 'in_progress' || s.status === 'paused');
    setSubmittingReview(true);
    try {
      await reviewService.create(app.id, {
        stageId: currentStage?.id,
        content: reviewContent,
        action: reviewAction,
        isInternal: false,
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
      const payload: any = { action: stageAction, notes: stageNotes || undefined };
      if (stageAction === 'request_supplement') {
        payload.deficiencyRound = deficiencyRound;
      }
      const updated = await applicationService.advanceStage(app.id, stageAction, stageNotes || undefined);
      setApp(updated);
      if (stageAction === 'approve') {
        message.success('阶段已推进');
      } else if (stageAction === 'reject') {
        message.success('审评不通过');
      } else {
        message.success(`已发送第 ${deficiencyRound} 轮发补通知，审评时钟暂停`);
      }
      setStageModalOpen(false);
      setStageNotes('');
      setDeficiencyRound(1);
      fetchData();
    } catch { /* handled */ }
    finally { setAdvancingStage(false); }
  };

  const handleUpload = async (file: File) => {
    if (!app) return;
    setUploading(true);
    try {
      await documentService.upload(app.id, file, uploadType);
      message.success('文件上传成功');
      fetchData();
    } catch { /* handled */ }
    finally { setUploading(false); }
    return false; // prevent default upload
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await documentService.delete(docId);
      message.success('文件已删除');
      fetchData();
    } catch { /* handled */ }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!app) return null;

  const isApplicant = user?.role === 'applicant' || user?.role === 'admin';
  const isReviewer = user?.role === 'reviewer' || user?.role === 'approver' || user?.role === 'admin';
  const isOwner = app.applicantId === user?.id;
  const canSubmit = isOwner && app.status === 'draft';
  const canResume = isOwner && app.status === 'supplement_needed';
  const currentStage = app.stages?.find(s => s.status === 'in_progress' || s.status === 'paused');
  const canAdvance = isReviewer && !!currentStage;
  const canReview = isReviewer && (app.status === 'under_review' || app.status === 'supplement_needed');

  const statusCfg = APPLICATION_STATUS[app.status];

  // Determine review timeline label for the current application type
  const timelineLabel = NMPA_REVIEW_TIMELINES[app.type] || '';

  // Build stage timeline items with track status and clock-stop
  const timelineItems = (app.stages || []).map((stage) => {
    const stageCfg = STAGE_STATUS[stage.status];
    const isTechnicalReview = stage.stageName === 'technical_review';
    const isParallel = stage.stageName === 'onsite_inspection' || stage.stageName === 'sample_testing';
    const hasTracks = isTechnicalReview && stage.trackStatuses;

    let color: string = stageCfg?.color === 'processing' ? 'blue' :
      stageCfg?.color === 'success' ? 'green' :
        stageCfg?.color === 'warning' ? 'orange' : 'gray';

    return {
      color,
      children: (
        <div>
          <div style={{ fontWeight: stage.status === 'in_progress' ? 600 : 400 }}>
            {STAGE_LABELS[stage.stageName] || stage.stageName}
            {isTechnicalReview && (
              <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                平行审评
              </Tag>
            )}
            {isParallel && (
              <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                并行
              </Tag>
            )}
            <Tag color={color} style={{ marginLeft: 4 }}>
              {stageCfg?.label || stage.status}
            </Tag>
            {/* Clock-stop badge */}
            {stage.status === 'paused' && (
              <Tooltip title="审评时钟已暂停，等待申请人补正资料。补正期限4个月（120天）">
                <Tag color="orange" icon={<AlertOutlined />} style={{ marginLeft: 4 }}>
                  时钟暂停
                </Tag>
              </Tooltip>
            )}
          </div>
          {stage.startedAt && (
            <div style={{ fontSize: 12, color: '#999' }}>
              开始: {new Date(stage.startedAt).toLocaleString('zh-CN')}
            </div>
          )}
          {stage.completedAt && (
            <div style={{ fontSize: 12, color: '#999' }}>
              完成: {new Date(stage.completedAt).toLocaleString('zh-CN')}
            </div>
          )}
          {stage.clockStoppedAt && (
            <div style={{ fontSize: 12, color: '#faad14' }}>
              时钟暂停: {new Date(stage.clockStoppedAt).toLocaleString('zh-CN')}
            </div>
          )}
          {stage.deadline && stage.status === 'in_progress' && (
            <div style={{ fontSize: 12, color: '#faad14' }}>
              截止: {new Date(stage.deadline).toLocaleString('zh-CN')}
            </div>
          )}
          {stage.assignedReviewer && (
            <div style={{ fontSize: 12, color: '#999' }}>
              审评员: {stage.assignedReviewer.realName}
            </div>
          )}

          {/* Parallel tracks for technical review */}
          {hasTracks && (
            <div style={{
              marginTop: 8,
              padding: '8px 12px',
              background: '#FAFBFC',
              borderRadius: 6,
              border: '1px solid #F0F0F0',
            }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>技术审评三线并行：</div>
              {TRACK_ORDER.map((trackName) => {
                const trackStatus = (stage.trackStatuses?.[trackName] || 'pending') as string;
                const trackCfg = TRACK_STATUS_CONFIG[trackStatus] || TRACK_STATUS_CONFIG.pending;
                const trackLabel = TECHNICAL_REVIEW_TRACKS[trackName] || trackName;
                return (
                  <div key={trackName} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '2px 0', fontSize: 12,
                  }}>
                    <span>
                      <ExperimentOutlined style={{ marginRight: 6, color: '#999', fontSize: 11 }} />
                      <Text style={{ fontSize: 12 }}>{trackLabel}</Text>
                    </span>
                    <Tag color={trackCfg.color} style={{ fontSize: 11 }}>{trackCfg.label}</Tag>
                  </div>
                );
              })}
            </div>
          )}

          {stage.notes && (
            <Paragraph style={{ fontSize: 12, color: '#999', marginTop: 4 }} ellipsis={{ rows: 2, expandable: true }}>
              {stage.notes}
            </Paragraph>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/applications')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>
            {app.applicationNo || '草稿'} - {app.drugName}
          </Title>
          <Tag color={statusCfg?.color}>{statusCfg?.label}</Tag>
        </Space>
        <Space>
          {canSubmit && (
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
              提交申请
            </Button>
          )}
          {canResume && (
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleResumeReview}>
              补正完成，恢复审评
            </Button>
          )}
          {canAdvance && (
            <Button type="primary" onClick={() => setStageModalOpen(true)}>
              审评操作
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Left: Info + Timeline + Deficiency Letters + Reviews */}
        <Col xs={24} lg={16}>
          {/* Basic Info */}
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="受理号">{app.applicationNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册类型">{APPLICATION_TYPES[app.type] || app.type}</Descriptions.Item>
              <Descriptions.Item label="药品名称">{app.drugName}</Descriptions.Item>
              <Descriptions.Item label="药品分类">{app.drugType}</Descriptions.Item>
              <Descriptions.Item label="规格">{app.specification || '-'}</Descriptions.Item>
              <Descriptions.Item label="生产企业">{app.manufacturer || '-'}</Descriptions.Item>
              <Descriptions.Item label="申请人">{app.applicant?.realName}</Descriptions.Item>
              <Descriptions.Item label="申请单位">{app.applicant?.organization}</Descriptions.Item>
              <Descriptions.Item label="审评时限">
                <Tooltip title={timelineLabel}>
                  <Text style={{ color: '#1A5C9E' }}>{timelineLabel}</Text>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(app.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{new Date(app.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Stage Timeline */}
          <Card title="审评阶段" style={{ marginBottom: 16 }}>
            <Timeline items={timelineItems} />
          </Card>

          {/* Deficiency Letters Section */}
          {deficiencyLetters.length > 0 && (
            <Card
              title={
                <Space>
                  <AlertOutlined style={{ color: '#faad14' }} />
                  <span>发补通知</span>
                  <Badge count={deficiencyLetters.filter(d => d.status === 'pending').length} />
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <List
                dataSource={deficiencyLetters}
                renderItem={(letter) => {
                  const letterCfg = DEFICIENCY_LETTER_STATUS[letter.status];
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="orange">第 {letter.round} 轮发补</Tag>
                            <Tag color={letterCfg?.color}>{letterCfg?.label}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              发出: {new Date(letter.issuedAt).toLocaleString('zh-CN')}
                            </Text>
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph style={{ fontSize: 13, marginBottom: 4 }} ellipsis={{ rows: 2, expandable: true }}>
                              {letter.content}
                            </Paragraph>
                            {letter.responseDeadline && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                补正截止: {new Date(letter.responseDeadline).toLocaleString('zh-CN')}
                                {letter.status === 'overdue' && (
                                  <Tag color="error" style={{ marginLeft: 8, fontSize: 11 }}>已逾期</Tag>
                                )}
                              </Text>
                            )}
                            {letter.respondedAt && (
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  补正提交: {new Date(letter.respondedAt).toLocaleString('zh-CN')}
                                </Text>
                                {letter.responseContent && (
                                  <Paragraph style={{ fontSize: 12, color: '#666', marginTop: 4 }} ellipsis={{ rows: 2, expandable: true }}>
                                    补正内容: {letter.responseContent}
                                  </Paragraph>
                                )}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
          )}

          {/* Reviews */}
          <Card title="审评意见">
            {reviews.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无审评意见</div>
            ) : (
              <List
                dataSource={reviews}
                renderItem={(review) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{review.reviewer?.realName}</Text>
                          <Tag>{review.reviewer?.role === 'reviewer' ? '审评员' : review.reviewer?.role === 'approver' ? '审批人' : review.reviewer?.role}</Tag>
                          {review.action && review.action !== 'comment' && (
                            <Tag color={review.action === 'approve' ? 'green' : review.action === 'request_supplement' ? 'orange' : 'red'}>
                              {REVIEW_ACTIONS[review.action] || review.action}
                            </Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(review.createdAt).toLocaleString('zh-CN')}
                          </Text>
                        </Space>
                      }
                      description={review.content}
                    />
                  </List.Item>
                )}
              />
            )}

            {/* Review Form (for reviewers) */}
            {canReview && (
              <>
                <Divider />
                <div>
                  <Text strong>添加审评意见:</Text>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <Select
                      value={reviewAction}
                      onChange={setReviewAction}
                      style={{ width: 160 }}
                      options={[
                        { value: 'comment', label: '评论' },
                        { value: 'approve', label: '通过' },
                        { value: 'request_supplement', label: '要求补充资料' },
                        { value: 'reject', label: '不通过' },
                      ]}
                    />
                  </div>
                  <TextArea
                    rows={3}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="请输入审评意见..."
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
              </>
            )}
          </Card>
        </Col>

        {/* Right: Documents */}
        <Col xs={24} lg={8}>
          <Card title="申报资料" style={{ marginBottom: 16 }}>
            {(app.documents || []).length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无文件</div>
            ) : (
              <List
                size="small"
                dataSource={app.documents || []}
                renderItem={(doc) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        href={documentService.getDownloadUrl(doc.id)}
                        target="_blank"
                      />,
                      (isOwner || user?.role === 'admin') && (
                        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteDocument(doc.id)}>
                          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ),
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag>{doc.documentType}</Tag>
                          <Text style={{ fontSize: 13 }}>{doc.fileName}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {doc.uploadedBy?.realName} · {new Date(doc.uploadedAt).toLocaleString('zh-CN')}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}

            {/* Upload (for applicant) */}
            {isOwner && (app.status === 'draft' || app.status === 'supplement_needed') && (
              <>
                <Divider />
                <div>
                  <Text strong>上传文件:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Select
                      value={uploadType}
                      onChange={setUploadType}
                      style={{ width: '100%', marginBottom: 8 }}
                      options={DOCUMENT_TYPES.map(t => ({ value: t, label: t }))}
                    />
                    <Upload
                      customRequest={({ file }) => handleUpload(file as File)}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading} block>
                        选择文件上传
                      </Button>
                    </Upload>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Applicant Info */}
          {app.applicant && (
            <Card title="申请人信息" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="姓名">{app.applicant.realName}</Descriptions.Item>
                <Descriptions.Item label="单位">{app.applicant.organization}</Descriptions.Item>
                {app.applicant.email && <Descriptions.Item label="邮箱">{app.applicant.email}</Descriptions.Item>}
                {app.applicant.phone && <Descriptions.Item label="电话">{app.applicant.phone}</Descriptions.Item>}
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      {/* Stage Advance Modal */}
      <Modal
        title="审评操作"
        open={stageModalOpen}
        onCancel={() => {
          setStageModalOpen(false);
          setDeficiencyRound(1);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setStageModalOpen(false);
            setDeficiencyRound(1);
          }}>取消</Button>,
          <Button
            key="submit"
            type="primary"
            loading={advancingStage}
            onClick={handleAdvanceStage}
            danger={stageAction === 'reject'}
          >
            确认
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="操作类型">
            <Select
              value={stageAction}
              onChange={setStageAction}
              style={{ width: '100%' }}
              options={[
                { value: 'approve', label: '通过当前阶段，进入下一阶段' },
                { value: 'request_supplement', label: '发送发补通知（暂停审评时钟）' },
                { value: 'reject', label: '不予批准（终止审评）' },
              ]}
            />
          </Form.Item>

          {/* Deficiency round selector - only shown for supplement action */}
          {stageAction === 'request_supplement' && (
            <Form.Item label="发补轮次" required>
              <InputNumber
                min={1}
                max={4}
                value={deficiencyRound}
                onChange={(v) => setDeficiencyRound(v || 1)}
                style={{ width: '100%' }}
                addonBefore="第"
                addonAfter="轮"
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                最多4轮发补，每轮补正期限120天。发补期间审评时钟暂停。
              </div>
            </Form.Item>
          )}

          {currentStage && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              当前阶段: <Text strong>{STAGE_LABELS[currentStage.stageName]}</Text>
              {stageAction === 'request_supplement' && (
                <div style={{ color: '#faad14', marginTop: 4 }}>
                  将暂停审评时钟，向申请人发送第 {deficiencyRound} 轮发补通知
                </div>
              )}
              {STAGE_FLOW_REVERSE[currentStage.stageName] && stageAction === 'approve' && (
                <div style={{ color: '#52c41a', marginTop: 4 }}>
                  将进入: {STAGE_FLOW_REVERSE[currentStage.stageName]}
                </div>
              )}
              {!STAGE_FLOW_REVERSE[currentStage.stageName] && stageAction === 'approve' && (
                <div style={{ color: '#52c41a', marginTop: 4 }}>
                  最后一个阶段，通过后将批准申请
                </div>
              )}
            </div>
          )}

          {/* Track status summary for technical review */}
          {currentStage?.stageName === 'technical_review' && (
            <div style={{
              marginBottom: 16, padding: '10px 12px',
              background: '#F0F5FF', borderRadius: 6, border: '1px solid #D6E4FF',
            }}>
              <div style={{ fontSize: 12, color: '#1A5C9E', marginBottom: 6, fontWeight: 600 }}>
                技术审评三线并行状态：
              </div>
              {TRACK_ORDER.map((trackName) => {
                const trackStatus = (currentStage.trackStatuses?.[trackName] || 'pending') as string;
                const trackCfg = TRACK_STATUS_CONFIG[trackStatus] || TRACK_STATUS_CONFIG.pending;
                const trackLabel = TECHNICAL_REVIEW_TRACKS[trackName] || trackName;
                return (
                  <div key={trackName} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                    <Text style={{ fontSize: 12 }}>{trackLabel}</Text>
                    <Tag color={trackCfg.color} style={{ fontSize: 11 }}>{trackCfg.label}</Tag>
                  </div>
                );
              })}
            </div>
          )}

          <Form.Item label="备注说明">
            <TextArea
              rows={3}
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              placeholder={stageAction === 'request_supplement' ? '发补内容摘要（将作为发补通知内容发送给申请人）...' : '审评意见摘要...'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

const STAGE_FLOW_REVERSE: Record<string, string> = {};
const FLOW: Array<{ name: StageName; label: string; parallel?: boolean }> = [
  { name: 'acceptance', label: '受理' },
  { name: 'formal_review', label: '形式审查' },
  { name: 'technical_review', label: '技术审评' },
  { name: 'onsite_inspection', label: '现场核查', parallel: true },
  { name: 'sample_testing', label: '样品检验', parallel: true },
  { name: 'administrative_approval', label: '行政审批' },
  { name: 'certificate_issuance', label: '制证送达' },
];
// Build reverse mapping: parallel stages (onsite_inspection, sample_testing)
// run concurrently with technical_review, so they all point to the same next stage.
// Sequential stages point to the immediate next sequential stage.
// The sequential order is: acceptance → formal_review → technical_review → administrative_approval → certificate_issuance
const sequentialOrder: StageName[] = [
  'acceptance', 'formal_review', 'technical_review', 'administrative_approval', 'certificate_issuance',
];
sequentialOrder.forEach((name, i) => {
  if (i < sequentialOrder.length - 1) {
    STAGE_FLOW_REVERSE[name] = FLOW.find(f => f.name === sequentialOrder[i + 1])!.label;
    // Also map parallel stages at this position to the same next stage
    if (name === 'technical_review') {
      STAGE_FLOW_REVERSE['onsite_inspection'] = FLOW.find(f => f.name === sequentialOrder[i + 1])!.label;
      STAGE_FLOW_REVERSE['sample_testing'] = FLOW.find(f => f.name === sequentialOrder[i + 1])!.label;
    }
  }
});
