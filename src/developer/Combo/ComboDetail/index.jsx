import React, { useEffect, useState } from 'react';
import { ClockCircleOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Col, Form, message, Row, Tabs, Tag, Modal } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import EyeIcon from 'app/icons/EyeIcon';
import { LeftIcon } from 'app/icons';
import { AdminCombo, CategoryPortal, DevCombo, DX, SaasAdmin } from 'app/models';
import { cloneDeep, isEqual, trim } from 'opLodash';
import { useMutation, useQuery } from 'react-query';
import { useLng, useQueryUrl } from 'app/hooks';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import ComboInProgress from 'app/CommonCombo/CommonComboInfor/components/ComboInProgress';
import ComboApproved from 'app/CommonCombo/CommonComboInfor/components/ComboApproved';
import CommonPricingList from 'app/CommonCombo/CommonPricing/CommonPricingList';
import HistoryCombo from 'app/CommonCombo/CommonComboInfor/HistoryCombo';
import { ComboContextProvider } from 'app/contexts/ComboContext';
import ComboPreview from 'developer/Combo/ComboDetail/ComboPreview';
import ComboPricingDetail from '../ComboPricing/ComboPricingDetail';
import useUser from '../../../app/hooks/useUser';

const { TabPane } = Tabs;
const { selectComboOwner, selectComboType } = AdminCombo;

export default function ComboDetail() {
	const { user } = useUser();

	const CAN_REQUEST_APPROVED = DX.canAccessFuture2('dev/request-approved-combo', user.permissions);
	const CAN_LIST_PACKAGE = DX.canAccessFuture2('dev/list-combo-pack', user.permissions);

	const { putRequestApprove } = DevCombo;
	const { pathname } = useLocation();
	const { id, pricingId } = useParams();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const [formInprogess] = Form.useForm();
	const [formApproved] = Form.useForm();
	const history = useHistory();
	const [active, setActive] = useState(getTab);
	const [breadCrumb, setBreadCrumb] = useState('');
	const [objectCheck, setObjectCheck] = useState({});
	const { tButton, tFilterField, tMenu } = useLng();
	const [dirtyInprogess, setDirtyProgess] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [currentPage, setCurrentPage] = useState('');

	useEffect(() => {
		if (!pricingId) {
			setActive(getTab);
		}
	}, [getTab]);

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

	const { data: comboInfo } = useQuery(
		['getComboInfo', id],
		async () => {
			const res = await DevCombo.getOneById(id, 'PROCCESSING');
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
			if (res.videos != null) {
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
			res.isInitial = true;
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
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: oldComboInfo } = useQuery(
		['getComboInfoApproved', id],
		async () => {
			const res = await DevCombo.getOneById(id, 'APPROVED');
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
			// formApproved.setFieldsValue(res);
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

	const breadcrumb = [
		{
			name: 'service',
			url: '',
		},
		{
			name: 'comboList',
			url: '/dev-portal/combo',
		},
		{
			isName: true,
			name: comboInfo?.name,
			url: !pricingId ? '' : DX.dev.createPath(`/combo/${id}`),
		},
	];
	const [pricingName, setPricingName] = useState();
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

	const goBack = () => {
		history.push(DX.dev.createPath('/combo'));
	};

	const onMutateRequest = useMutation(putRequestApprove, {
		onSuccess: () => {
			message.success('Yêu cầu phê duyệt thành công');
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
			title: 'Bạn có chắc chắn muốn gửi yêu cầu phê duyệt cho Combo dịch vụ?',
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

	const statusApprove = comboInfo.approvedStatus;
	const tagApproveInfo = SaasAdmin.tagStatus[comboInfo.approvedStatus] || {};

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
								history.push(DX.dev.createPath(`/combo/${id}?tab=1`));
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
						<p className="mb-0 ml-1 mt-0">
							Cập nhật cuối: {currentPage ? oldComboInfo?.lastUpdateTime : comboInfo?.lastUpdateTime}
						</p>
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
												{comboInfo.name || 'This is combo name'}
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

											{comboInfo.approvedStatus === 'UNAPPROVED' && CAN_REQUEST_APPROVED && (
												<Button onClick={onRequestApprove}>{tButton('approvalRequest')}</Button>
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
												selectServiceType={selectServiceType}
												data={comboInfo}
												setDirtyProgess={setDirtyProgess}
												objectCheck={objectCheck}
												dirtyInprogess={dirtyInprogess}
												portal="dev"
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
														<CommonPricingList comboInfo={comboInfo} portal="dev" />
													</TabPane>
												)}

												<TabPane tab={tMenu('activityHistory')} key="4" forceRender>
													<HistoryCombo data={comboInfo} portal="dev" setActive={setActive} />
												</TabPane>
											</>
										)}
									</Tabs>
								</>
							) : (
								<ComboPricingDetail setPricingName={setPricingName} />
							)}
						</Col>
					</Row>
				) : (
					<ComboPreview
						formInprogess={formInprogess}
						isDirtyInfoBasic={dirtyInprogess}
						selectServiceType={selectServiceType}
						currentPage={currentPage}
						statusApprove={statusApprove}
						comboId={comboInfo?.comboId}
						developerName={comboInfo.ownerDev === 'NO' ? comboInfo.publisher : comboInfo.developerName}
						lastUpdateTime={currentPage ? oldComboInfo.lastUpdateTime : comboInfo.lastUpdateTime}
					/>
				)}
			</div>
		</ComboContextProvider>
	);
}
