import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Tabs, Tag, Modal, message } from 'antd';
import { DrawerApproval, UrlBreadcrumb } from 'app/components/Atoms';
import EyeIcon from 'app/icons/EyeIcon';
import { LeftIcon } from 'app/icons';
import { AdminCombo, CategoryPortal, DX, SaasAdmin } from 'app/models';
import { cloneDeep, isEqual, trim } from 'opLodash';
import { useMutation, useQuery } from 'react-query';
import { useQueryUrl, useLng, useUser } from 'app/hooks';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ExclamationCircleOutlined, MinusOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import WrapDetail from 'app/HOCs/WrapDetail';
import ComboInProgress from 'app/CommonCombo/CommonComboInfor/components/ComboInProgress';
import ComboApproved from 'app/CommonCombo/CommonComboInfor/components/ComboApproved';
import { ComboContextProvider } from 'app/contexts/ComboContext';
import HistoryCombo from 'app/CommonCombo/CommonComboInfor/HistoryCombo';
import CommonPricingList from 'app/CommonCombo/CommonPricing/CommonPricingList';
import ComboPreview from 'admin/Combo/ComboDetail/ComboPreview';
import ComboPricingDetail from '../ComboPricing/ComboPricingDetail';

const { TabPane } = Tabs;
function ButtonShowModal({ openApproveForm }) {
	return (
		<Button
			type="primary"
			onClick={() => {
				openApproveForm();
			}}
			className="text-white fixed bottom-0 right-10 h-14 w-80 z-max"
		>
			<div className="flex justify-between">
				<div>Phê duyệt Combo dịch vụ</div>
				<div>
					<MinusOutlined />
				</div>
			</div>
		</Button>
	);
}

function ComboDetail({ setHaveError }) {
	const { pathname } = useLocation();
	const { user } = useUser();
	const CAN_APPROVED = DX.canAccessFuture2('admin/approved-combo', user.permissions);
	const CAN_REQUEST_APPROVED = DX.canAccessFuture2('admin/request-approved-combo', user.permissions);
	const CAN_LIST_PACKAGE = DX.canAccessFuture2('admin/list-combo-pack', user.permissions);
	const { id, pricingId } = useParams();
	const { putRequestApprove, putApproveCombo, selectComboOwner, selectComboType } = AdminCombo;
	const [formInprogess] = Form.useForm();
	const [formApproved] = Form.useForm();
	const [approve, setApproveStatus] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [typeLoading, setTypeLoading] = useState('');
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const history = useHistory();
	const [active, setActive] = useState(getTab);
	const [breadCrumb, setBreadCrumb] = useState('');
	const [objectCheck, setObjectCheck] = useState({});
	const { tButton, tMessage, tFilterField, tMenu, tOthers, tValidation, tField, tLowerField } = useLng();
	const [dirtyInprogess, setDirtyProgess] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [currentPage, setCurrentPage] = useState('');

	const goBack = () => {
		history.push(DX.admin.createPath('/combo'));
	};

	const { refetch, data: comboInfo } = useQuery(
		['getComboInfo', id],
		async () => {
			const res = await AdminCombo.getOneById(id, 'PROCCESSING');
			res.categories = res.categories?.map((e) => e.id);
			if (res.snapshots != null && res.snapshots.length > 0) {
				res.snapshots = res.snapshots.sort((itemFirst, itemSecond) => {
					if (itemFirst.priority < itemSecond.priority) return -1;
					if (itemFirst.priority > itemSecond.priority) return 1;
					return 0;
				});
				res.snapshots = res.snapshots.map((item) => ({
					name: item.fileNameSnapShot,
					url: item.url || item.embedUrl,
					uid: item.id,
					fileSize: item.fileSize || 0,
				}));
			} else {
				res.snapshots = [];
			}
			const avatarLs = [];
			const videoList = [];

			if (res.icons) {
				const icon = {
					name: res.icons.fileNameIcon,
					url: res.icons.icon || res.icons.iconEmbedUrl,
					uid: res.icons.idIcon,
				};
				avatarLs.push(icon);
			}
			if (res.videos && res.videos != null) {
				const video = {
					name: res.videos.fileNameVideo,
					url: res.videos.video || res.videos.videoEmbedUrl,
					uid: res.videos.idVideo,
					thumbUrl: '/images/fileUpload.svg',
				};
				videoList.push(video);
			}
			res.icon = avatarLs;
			res.video = videoList;
			res.countGetData = (comboInfo.countGetData || 0) + 1;
			res.comboOwner = res.comboOwner || selectComboOwner[1].value;
			res.comboType = res.comboType || selectComboType[0].value;
			return res;
		},
		{
			initialData: {
				isInit: true,
				countGetData: 0,
			},
			onError: (e) => {
				e.callbackUrl = DX.admin.createPath('/combo');
				setHaveError(e);
			},
		},
	);

	const { data: oldComboInfo } = useQuery(
		['getComboInfoApproved', id],
		async () => {
			const res = await AdminCombo.getOneById(id, 'APPROVED');
			res.categories = res.categories?.map((e) => e.id);
			if (res.snapshots != null && res.snapshots.length > 0) {
				res.snapshots = res.snapshots.sort((itemFirst, itemSecond) => {
					if (itemFirst.priority < itemSecond.priority) return -1;
					if (itemFirst.priority > itemSecond.priority) return 1;
					return 0;
				});
				res.snapshots = res.snapshots.map((item) => ({
					name: item.fileNameSnapShot,
					url: item.url || item.embedUrl,
					uid: item.id,
					fileSize: item.fileSize || 0,
				}));
			} else {
				res.snapshots = [];
			}
			const avatarLs = [];
			const videoList = [];

			if (res.icons) {
				const icon = {
					name: res.icons.fileNameIcon,
					url: res.icons.icon || res.icons.iconEmbedUrl,
					uid: res.icons.idIcon,
				};
				avatarLs.push(icon);
			}
			if (res.videos && res.videos != null) {
				const video = {
					name: res.videos.fileNameVideo,
					url: res.videos.video || res.videos.videoEmbedUrl,
					uid: res.videos.idVideo,
					thumbUrl: '/images/fileUpload.svg',
				};
				videoList.push(video);
			}
			res.icon = avatarLs;
			res.video = videoList;
			const checkKeys = {};
			if (comboInfo.approvedStatus !== 'APPROVED') {
				Object.keys(comboInfo).forEach((key) => {
					if (!isEqual(comboInfo[key], res[key])) {
						checkKeys[key] = true;
					}
				});
			}
			res.countGetData = (oldComboInfo.countGetData || 0) + 1;

			setObjectCheck(checkKeys);

			return res;
		},
		{
			initialData: {
				isInit: true,
				countGetData: 0,
			},
			enabled: comboInfo?.statusBrowsing === 'HAVE_BROWSED',
		},
	);

	const isOwnerProvince = DX.checkIsOwnerProvince(user?.department?.provinceId, comboInfo?.provinceId);

	const enableDrawerApproval = () => {
		if (comboInfo.ownerDev === 'YES') {
			return true;
		}
		return user.roles.find((role) => role === DX.SUPER_ADMIN_ROLE);
	};

	const onMutateRequest = useMutation(putRequestApprove, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyApproved'));
			goBack();
		},
		onError: (e) => {
			console.log(e);
		},
	});

	const onRequestApprove = async () => {
		await formInprogess.validateFields();
		if (dirtyInprogess) {
			message.warning('Cập nhật thông tin trước khi yêu cầu phê duyệt.');
			return;
		}
		Modal.confirm({
			title: tMessage('opt_wantToApprove', { field: 'serviceCombo' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				onMutateRequest.mutate(id);
			},
			onCancel: () => {},
			confirmLoading: onMutateRequest.isLoading,
		});
	};

	const { data: selectServiceType } = useQuery(
		['getAllCategories'],
		async () => {
			const res = await CategoryPortal.getAll();
			return res.map((e) => ({
				label: e.name,
				value: e.id,
			}));
		},
		{
			initialData: [],
		},
	);

	// ---------------------------- modal approve -----------------------------//
	const openApproveForm = () => {
		setShowModal(true);
	};

	const onMutateApprove = useMutation(putApproveCombo, {
		onSuccess: () => {
			if (approve === SaasAdmin.tagStatus.APPROVED.value)
				message.success(tMessage('opt_successfullyApproved', { field: 'serviceCombo' }));
			else message.success(tMessage('opt_successfullyRejected', { field: 'serviceCombo' }));
			setShowModal(false);
			refetch();
		},
		onError: (e) => {
			console.log(e);
		},
	});

	const handleClickApprove = () => {
		setTypeLoading(SaasAdmin.tagStatus.APPROVED.value);
		setApproveStatus(SaasAdmin.tagStatus.APPROVED.value);
	};

	useEffect(() => {
		if (approve) {
			onMutateApprove.mutate({
				id,
				body: {
					approvedStatus: approve,
					comment: formInprogess.getFieldValue('comment') || 'approve',
				},
			});
		}
	}, [approve]);

	const handleClickReject = () => {
		const data = formInprogess.getFieldValue('comment');
		if (!trim(data)) {
			formInprogess.setFields([
				{
					name: 'comment',
					errors: [tValidation('plsEnterCommentContent')],
				},
			]);
			return;
		}
		setTypeLoading(SaasAdmin.tagStatus.REJECTED.value);
		setApproveStatus(SaasAdmin.tagStatus.REJECTED.value);
	};

	const statusApprove = comboInfo.approvedStatus;
	const tagApproveInfo = SaasAdmin.tagStatus[comboInfo.approvedStatus] || {};

	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'comboList',
			url: '/admin-portal/combo',
		},
		{
			isName: true,
			name: comboInfo.name,
			url: !pricingId ? '' : DX.admin.createPath(`/combo/${id}`),
		},
	];

	const [pricingName, setPricingName] = useState('');

	useEffect(() => {
		if (!trim(pricingId)) setBreadCrumb([...breadcrumb]);
		else {
			const arr = [...cloneDeep(breadcrumb)];
			arr.push({
				isName: true,
				name: pricingName,
				url: '',
			});
			setBreadCrumb([...arr]);
		}
	}, [id, pricingId, pricingName, comboInfo]);

	useEffect(() => {
		if (!pricingId) {
			setActive(getTab);
		}
	}, [getTab]);

	return (
		<ComboContextProvider value={{ comboInfo }}>
			<div>
				<div className="flex justify-between">
					<UrlBreadcrumb breadcrumbs={breadCrumb} />
					{isVisible ? (
						<Button
							type="default"
							className="flex"
							onClick={() => {
								setIsVisible(false);
								history.push(DX.admin.createPath(`/combo/${id}?tab=1`));
							}}
						>
							<LeftIcon width="w-2" className="my-auto" /> Quay lại chi tiết Combo dịch vụ
						</Button>
					) : (
						<span />
					)}
				</div>
				{isVisible ? (
					<div className="flex items-center gap-1 mt-2 mb-8">
						<ClockCircleOutlined />
						Cập nhật cuối: {currentPage ? oldComboInfo?.lastUpdateTime : comboInfo?.lastUpdateTime}
					</div>
				) : (
					<span />
				)}
				{!isVisible ? (
					<Row>
						<Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={20}>
							{!pricingId ? (
								<>
									<div className="font-semibold mt-5 mb-7 flex justify-between">
										<div>
											<span className="text-xl font-semibold">
												{comboInfo.name || 'This is coupon name'}
											</span>
											<span className="font-medium ml-3">
												<Tag color={tagApproveInfo?.color}>
													{tFilterField('approvalStatusOptions', tagApproveInfo?.text)}
												</Tag>
											</span>
										</div>
										<div className="flex gap-2">
											<Button
												type="primary"
												icon={<EyeIcon width="w-4" />}
												onClick={() => setIsVisible(true)}
											>
												{tButton('preview')}
											</Button>
											{statusApprove === 'APPROVED' && (
												<Button
													type="default"
													icon={<EyeOutlined />}
													onClick={() => {
														setCurrentPage('currentPage');
														setIsVisible(true);
													}}
												>
													{tButton('currentStatus')}
												</Button>
											)}
											{comboInfo.ownerDev === 'NO' &&
												comboInfo.approvedStatus === 'UNAPPROVED' &&
												CAN_REQUEST_APPROVED &&
												isOwnerProvince && (
													<Button onClick={onRequestApprove}>
														{tButton('approvalRequest')}
													</Button>
												)}
										</div>
									</div>

									<Tabs
										activeKey={active || '1'}
										onChange={(activeTab) => {
											history.replace(`${pathname}?tab=${activeTab}`);
											setActive(activeTab);
										}}
									>
										<TabPane tab={tMenu('infoBeingProcessed')} key="1" forceRender>
											<ComboInProgress
												formEdit={formInprogess}
												goBack={goBack}
												objectCheck={objectCheck}
												selectServiceType={selectServiceType}
												data={comboInfo}
												dirtyInprogess={dirtyInprogess}
												setDirtyProgess={setDirtyProgess}
												isOwnerProvince={isOwnerProvince}
												portal="admin"
											/>
										</TabPane>
										{comboInfo.statusBrowsing !== 'NEVER_BROWSED' && (
											<>
												<TabPane tab={tMenu('infoIsApproved')} key="2" forceRender>
													<ComboApproved
														formEdit={formApproved}
														goBack={goBack}
														statusApprove={statusApprove}
														selectServiceType={selectServiceType}
														data={oldComboInfo}
													/>
												</TabPane>
												{CAN_LIST_PACKAGE && (
													<TabPane tab={tMenu('serviceComboPackage')} key="3" forceRender>
														<CommonPricingList
															comboInfo={comboInfo}
															portal="admin"
															isOwnerProvince={isOwnerProvince}
														/>
													</TabPane>
												)}
												<TabPane tab={tMenu('activityHistory')} key="4" forceRender>
													<HistoryCombo
														data={comboInfo}
														portal="admin"
														setActive={setActive}
													/>
												</TabPane>
											</>
										)}
									</Tabs>
								</>
							) : (
								<ComboPricingDetail setPricingName={setPricingName} isOwnerProvince={isOwnerProvince} />
							)}
						</Col>
					</Row>
				) : (
					<ComboPreview
						formInprogess={formInprogess}
						setPricingName={setPricingName}
						isDirtyInfoBasic={dirtyInprogess}
						selectServiceType={selectServiceType}
						currentPage={currentPage}
						statusApprove={statusApprove}
						comboId={comboInfo?.comboId || oldComboInfo.id}
						developerName={comboInfo.ownerDev === 'NO' ? comboInfo.publisher : comboInfo.developerName}
					/>
				)}
				{comboInfo.approvedStatus === 'AWAITING_APPROVAL' && CAN_APPROVED && isOwnerProvince && (
					<>
						<ButtonShowModal openApproveForm={openApproveForm} />
						<DrawerApproval
							closeForm={() => {
								setShowModal(false);
							}}
							visible={showModal}
							form={formInprogess}
							handleClickApprove={handleClickApprove}
							handleClickReject={handleClickReject}
							loading={onMutateApprove.isLoading}
							typeLoading={typeLoading}
							title={tField('opt_approve', { field: 'serviceCombo' })}
							textAcceptBtn={tButton('accept')}
							content={
								<p>
									{tOthers('inCase')} <b>{tOthers('reject')}</b>, {tLowerField('giveDevReason')}
								</p>
							}
							approved={SaasAdmin.tagStatus.APPROVED.value}
							unApproved={SaasAdmin.tagStatus.REJECTED.value}
							hideBtnUnApproved
						/>
					</>
				)}
			</div>
		</ComboContextProvider>
	);
}

export default WrapDetail(ComboDetail);
