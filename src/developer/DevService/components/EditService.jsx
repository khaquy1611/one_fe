import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, message, Modal, Row, Spin, Tabs, Tag } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { HistoryService } from 'app/components/Templates';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import EyeIcon from 'app/icons/EyeIcon';
import { CategoryPortal, DX, SaasAdmin, SaasDev, SmeService } from 'app/models';
import { cloneDeep, trim } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import CommonPricingDetail from 'app/CommonPricing/CommonPricingDetail';
import PricingList from '../PricingModule/PricingList';
import DesProduct from './DesProduct';
import DrawerPreview from './DrawerPreview';
import Feature from './Feature';
import InforBasicProduct from './InforBasicProduct';

const getInitializeValues = (values) => {
	const initials = [];
	Object.keys(values).forEach((key) => {
		initials.push({
			value: values[key],
			touched: false,
			name: key,
		});
	});
	return initials;
};

const { TabPane } = Tabs;
const { confirm } = Modal;

function EditService() {
	const { selectServiceOwner, selectServiceOwnerVNPT } = SaasDev;
	const { tButton, tMessage, tMenu, tFilterField, tLowerField } = useLng();
	const [form] = Form.useForm();
	const [FormEdit] = Form.useForm();
	const { id, pricingId } = useParams();
	const [formInfo, setFormInfo] = useState(null);
	const [formDes, setFormDes] = useState(null);
	const [isDirty, setDirty] = useState(false);
	const [isDirtyTabPricing, setIsDirtyTabPricing] = useState(false);
	const [breadCrumb, setBreadCrumb] = useState('');
	const [serviceOwner, setServiceOwner] = useState('SAAS');
	const [serviceOwnerVNPT, setServiceOwnerVNPT] = useState('VNPT');
	const { user } = useUser();
	const CAN_LIST_SERVICE_PACKAGE = DX.canAccessFuture2('dev/list-service-pack', user.permissions);
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const [active, setActive] = useState(getTab);
	const { pathname } = useLocation();
	const history = useHistory();
	const [isVisible, setIsVisible] = useState(true);
	const [pricingName, setPricingName] = useState('');

	useEffect(() => {
		if (!pricingId) {
			setActive(getTab);
		}
	}, [getTab]);

	const { refetch, data: initValues, isFetching } = useQuery(
		['getSassInfo', id],
		async () => {
			try {
				const res = await SaasDev.getOneByIdBasic(id);
				const { language } = res;
				if (language === null) res.language = [];
				else {
					res.language = trim(language || '')
						.replaceAll(' ', '')
						.split(',');
				}

				let serType = {};
				if (res?.serviceOwner === 'VNPT' || (!res?.serviceOwner && res.status === 'UNAPPROVED')) {
					setServiceOwner(selectServiceOwner[0].value);
					setServiceOwnerVNPT(selectServiceOwnerVNPT[0].value);
					serType = {
						serviceOwner: selectServiceOwner[0].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[0].value,
					};
				} else if (res?.serviceOwner === 'SAAS') {
					setServiceOwner(selectServiceOwner[0].value);
					setServiceOwnerVNPT(selectServiceOwnerVNPT[1].value);
					serType = {
						serviceOwner: selectServiceOwner[0].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[1].value,
					};
				} else if (res?.serviceOwner === 'OTHER') {
					setServiceOwner(selectServiceOwner[1].value);
					setServiceOwnerVNPT(selectServiceOwnerVNPT[0].value);
					serType = {
						serviceOwner: selectServiceOwner[1].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[0].value,
					};
				} else {
					setServiceOwner(selectServiceOwner[1].value);
					setServiceOwnerVNPT(selectServiceOwnerVNPT[1].value);
					serType = {
						serviceOwner: selectServiceOwner[1].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[1].value,
					};
				}

				delete res.serviceOwner;
				form.setFields(
					getInitializeValues({
						...serType,
						...res,
					}),
				);
				setFormInfo({
					...serType,
					...res,
				});
				return {
					...serType,
					...res,
				};
			} catch (e) {
				return {};
			}
		},
		{ initialData: {} },
	);
	const nameProduct = initValues.name;
	const statusApprove = initValues.status;
	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: DX.dev.createPath('/service/list'),
		},
		{
			isName: true,
			name: nameProduct,
			url: !pricingId ? '' : DX.dev.createPath(`/service/list/${id}`),
		},
	];

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
	}, [id, pricingId, nameProduct, pricingName]);

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
	const { refetch: refetchDes, data: initValuesDes } = useQuery(
		['getSassDes', id],
		async () => {
			const res = await SaasDev.getOneByIdDescription(id);
			if (res.snapshots != null && res.snapshots.length > 0) {
				res.snapshots = res.snapshots.sort((itemFirst, itemSecond) => {
					if (itemFirst.priority < itemSecond.priority) return -1;
					if (itemFirst.priority > itemSecond.priority) return 1;
					return 0;
				});
				res.snapshots = res.snapshots.map((item) => ({
					name: item.fileName,
					url: item.filePath || item.externalLink,
					uid: item.id,
					fileSize: item.fileSize || 0,
				}));
			} else {
				res.snapshots = [];
			}

			const avatarLs = [];
			const videoList = [];
			if (res.icon !== null) {
				const icon = {
					name: res.icon.fileName,
					url: res.icon.filePath || res.icon.externalLink,
					uid: res.icon.id,
				};
				avatarLs.push(icon);
			}
			if (res.banner) {
				res.banner = [
					{
						name: res.banner.fileName,
						url: res.banner.filePath || res.banner.externalLink,
						uid: res.banner.id,
					},
				];
			}

			if (res.video != null) {
				const video = {
					name: res.video.fileName,
					url: res.video.filePath || res.video.externalLink,
					uid: res.video.id,
					thumbUrl: '/images/fileUpload.svg',
				};
				videoList.push(video);
			}
			res.icon = avatarLs;
			res.video = videoList;
			FormEdit.setFields(
				getInitializeValues({
					...res,
				}),
			);
			setDirty(false);
			setFormDes(res);
			return res;
		},
		{ desValues: {} },
	);

	const updateServiceMutation = useMutation(SaasDev.updateServiceDescription, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetchDes();
		},
		onError: (e) => {
			if (e.fields[0].apiErrorCode === 'error.valid.size' && e.fields[0].field === 'shortDescription') {
				message.error(tMessage('char_200'));
			} else message.error(tMessage('retryError'));
		},
	});

	const showPromiseUpdateConfirm = (itemValues) => {
		confirm({
			title: tMessage('opt_wantToUpdate', { field: 'service' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('agreement'),
			cancelText: tButton('opt_cancel'),
			onOk: () =>
				updateServiceMutation.mutate({
					id: initValues.id,
					body: { ...itemValues },
				}),
			onCancel() {},
			confirmLoading: updateServiceMutation.isLoading,
		});
	};

	const { data: plans, refetch: refetchInfoService } = useQuery(
		['getServices'],
		async () => {
			try {
				const res = await SmeService.getServicesByCategoryId({ id });
				return res;
			} catch (e) {
				return null;
			}
		},
		{
			initialData: [],
		},
	);

	const updateImproveProduct = useMutation(SaasDev.approveProduct, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
			refetch();
		},
		onError: () => message.error(tMessage('retryError')),
	});

	async function approveProduct(mess) {
		let step = '1';
		try {
			await form.validateFields();
			const form1 = form.getFieldValue();
			delete form1.languageType;
			if (!DX.checkEqualsObject(form1, formInfo)) {
				message.warning(
					`${tMessage('opt_updateBefore', { field: 'editBasicInfo' })} ${
						mess === 'previewApprove' ? tLowerField('approvalRequest') : tLowerField('watchServiceDetail')
					}`,
				);
				return;
			}
			step = '2';
			await FormEdit.validateFields();
			if (!DX.checkEqualsObject(FormEdit.getFieldValue(), formDes)) {
				message.warning(
					`${tMessage('opt_updateBefore', { field: 'editServiceDes' })} ${
						mess === 'previewApprove' ? tLowerField('approvalRequest') : tLowerField('watchServiceDetail')
					}`,
				);
				return;
			}

			if (isDirtyTabPricing) {
				message.warning(
					`${tMessage('opt_updateBefore', { field: 'servicePackageSetting' })} ${tLowerField(
						'watchServiceDetail',
					)}`,
				);
				return;
			}

			if (mess === 'preview') {
				history.replace(`${pathname}?tab=1`);
				setActive('1');
				setIsVisible(false);
			} else updateImproveProduct.mutate({ id });
		} catch (e) {
			setActive(step);
		}
	}
	const resetForm = () => {
		form.setFieldsValue(initValues);
	};

	const tagStatus = SaasAdmin.tagStatus[statusApprove];
	const saasInfo = form.getFieldValue();
	const Icon = tagStatus?.icon;

	const goBack = () => history.push(DX.dev.createPath('/service/list'));

	if (isFetching)
		return (
			<div className="text-center mt-28">
				<Spin />
			</div>
		);

	return (
		<>
			<div className={isVisible ? 'show' : 'hidden'}>
				<div className="flex">
					<UrlBreadcrumb breadcrumbs={breadCrumb} />
				</div>
				<Row>
					<Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={20}>
						<div className="mt-5 mb-7 flex justify-between">
							<div>
								<span className="text-xl font-semibold">{nameProduct}</span>
								<span className="font-medium ml-3">
									<Tag color={tagStatus?.color} icon={Icon && <Icon />}>
										{tFilterField('approvalStatusOptions', tagStatus?.text)}
									</Tag>
								</span>
							</div>

							{!pricingId && (
								<div>
									<Button
										type="primary"
										onClick={() => approveProduct('preview')}
										icon={<EyeIcon width="w-4" />}
									>
										{tButton('preview')}
									</Button>

									<Button
										className="ml-3"
										onClick={() => approveProduct('preview')}
										icon={<EyeIcon width="w-4" />}
									>
										{tButton('currentStatus')}
									</Button>

									{DX.canAccessFuture2('dev/request-approved-service', user.permissions) &&
										statusApprove === 'UNAPPROVED' && (
											<Button className="ml-3" onClick={() => approveProduct('previewApprove')}>
												{tButton('approvalRequest')}
											</Button>
										)}
								</div>
							)}
						</div>

						{!pricingId ? (
							<Tabs
								activeKey={active || '1'}
								onChange={(activeTab) => {
									history.replace(`${pathname}?tab=${activeTab}`);
									setActive(activeTab);
								}}
							>
								<TabPane tab={tMenu('opt_edit', { field: 'basicInfo' })} key="1">
									<InforBasicProduct
										formEdit={form}
										refetch={refetch}
										initValues={initValues}
										resetForm={resetForm}
										statusApprove={statusApprove}
										selectServiceType={selectServiceType}
										refetchInfoService={refetchInfoService}
										serviceOwner={serviceOwner}
										setServiceOwner={setServiceOwner}
										serviceOwnerVNPT={serviceOwnerVNPT}
										setServiceOwnerVNPT={setServiceOwnerVNPT}
										goBack={goBack}
									/>
								</TabPane>
								<TabPane tab={tMenu('opt_edit', { field: 'serviceDes' })} key="2" forceRender>
									<DesProduct
										FormEdit={FormEdit}
										statusApprove={statusApprove}
										isDirty={isDirty}
										setDirty={setDirty}
										showPromiseUpdateConfirm={showPromiseUpdateConfirm}
										initValues={initValuesDes}
										typePortal="DEV"
										goBack={goBack}
									/>
								</TabPane>
								{CAN_LIST_SERVICE_PACKAGE && (
									<TabPane tab={tMenu('servicePackage')} key="3" forceRender>
										<PricingList
											refetchInfoService={refetchInfoService}
											isDirty={isDirtyTabPricing}
											setIsDirty={setIsDirtyTabPricing}
											serviceInfo={initValues}
										/>
									</TabPane>
								)}

								<TabPane tab={tMenu('activityHistory')} key="4" forceRender>
									<HistoryService data={initValuesDes} />
								</TabPane>
								<TabPane tab={tMenu('featureList')} key="5" forceRender>
									<Feature />
								</TabPane>
							</Tabs>
						) : (
							<CommonPricingDetail portal="dev" setPricingName={setPricingName} />
						)}
					</Col>
				</Row>
			</div>

			{!isVisible && (
				<DrawerPreview
					saasInfo={saasInfo}
					desInFo={FormEdit.getFieldsValue()}
					data={plans}
					classToggle={isVisible ? 'hidden' : ''}
					backEdit={() => setIsVisible(true)}
					approveProduct={approveProduct}
					statusApprove={statusApprove}
					type="dev"
				/>
			)}
		</>
	);
}

export default EditService;
