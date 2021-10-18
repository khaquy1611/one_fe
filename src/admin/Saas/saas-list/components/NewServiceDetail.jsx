import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Tabs, Tag, Modal, Spin } from 'antd';
import EyeIcon from 'app/icons/EyeIcon';
import { CategoryPortal, DX, SaasAdmin, SaasDev, SmeService } from 'app/models';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useUser, useQueryUrl, useLng } from 'app/hooks';
import UrlBreadcrumb from 'app/components/Atoms/UrlBreadcrumb';
import { EyeOutlined, MinusOutlined } from '@ant-design/icons';
import CommonEvaluate from 'app/models/CommonEvaluate';
import { cloneDeep, trim } from 'opLodash';
import DesProduct from 'developer/DevService/components/DesProduct';
import InforBasicProduct from 'developer/DevService/components/InforBasicProduct';
import { HistoryService } from 'app/components/Templates';
import Feature from 'developer/DevService/components/Feature';
import DrawerPreview from 'developer/DevService/components/DrawerPreview';
import SaasApprove from './SaasApprove';
import PricingListAdmin from '../../PricingNew/PricingListAdmin';
import PricingDetailAdmin from '../../PricingNew/PricingDetailAdmin';

const { TabPane } = Tabs;
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
export default function NewServiceDetail() {
	const { selectServiceOwner, selectServiceOwnerVNPT } = SaasDev;
	const { id, pricingId } = useParams();
	const [form] = Form.useForm();
	const { user } = useUser();
	const CAN_LIST_SERVICE_PACKAGE = DX.canAccessFuture2('admin/list-service-pack', user.permissions);
	const [openForm, setOpenForm] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [breadCrumb, setBreadCrumb] = useState('');
	const [FormEdit] = Form.useForm();
	const queryUrl = useQueryUrl();
	const { pathname } = useLocation();
	const history = useHistory();
	const [isVisible, setIsVisible] = useState(true);
	const { tMessage, tMenu, tButton, tFilterField } = useLng();
	const { refetch: refetchDrawer, data: initValues } = useQuery(
		['getSassInfo', id],
		async () => {
			try {
				const res = await SaasAdmin.getOneByIdBasic(id);
				const { language } = res;
				if (language === null) res.language = [];
				else {
					res.language = trim(language || '')
						.replaceAll(' ', '')
						.split(',');
				}

				let serType = {};
				if (res?.serviceOwner === 'VNPT' || (!res?.serviceOwner && res.status === 'UNAPPROVED')) {
					serType = {
						serviceOwner: selectServiceOwner[0].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[0].value,
					};
				} else if (res?.serviceOwner === 'SAAS') {
					serType = {
						serviceOwner: selectServiceOwner[0].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[1].value,
					};
				} else if (res?.serviceOwner === 'OTHER') {
					serType = {
						serviceOwner: selectServiceOwner[1].value,
						serviceOwnerVNPT: selectServiceOwnerVNPT[0].value,
					};
				} else {
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
				if (res.status === SaasAdmin.tagStatus.AWAITING_APPROVAL.value) {
					setIsDirty(true);
				} else setIsDirty(false);
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
	const { refetch, data: saasInfo } = useQuery(
		['getSassInfo', id],
		async () => {
			const res = await SaasAdmin.getOneById(id);

			return res;
		},
		{
			initialData: {
				isInit: true,
			},
			enabled: !!id,
		},
	);

	const { data: dataEvaluate } = useQuery(
		['getDescriptComment', id],
		async () => {
			const res = await CommonEvaluate.getOneByIdAdmin(id);
			return res;
		},
		{
			initialData: {},
		},
	);
	function openApproveForm() {
		if (saasInfo.status === SaasAdmin.tagStatus.AWAITING_APPROVAL.value) {
			setOpenForm(true);
		} else {
			Modal.info({
				title: tMessage('notification'),
				content: tMessage('noneApprovalRequest'),
			});
		}
	}

	function closeForm() {
		setOpenForm(false);
		form.resetFields();
	}
	const nameProduct = saasInfo.name;
	const statusApprove = saasInfo.status;
	const breadcrumb = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'serviceList',
			url: DX.admin.createPath('/saas/list'),
		},
		{
			isName: true,
			name: nameProduct,
			url: !pricingId ? '' : DX.admin.createPath(`/saas/list/${id}`),
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
	}, [id, pricingId, nameProduct, pricingName]);

	const tagStatus = SaasAdmin.tagStatus[statusApprove];
	const Icon = tagStatus?.icon;
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
	const resetForm = () => {
		form.setFieldsValue(saasInfo);
	};
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

			if (res.video != null) {
				const video = {
					name: res.video.fileName,
					url: res.video.filePath || res.video.externalLink,
					uid: res.video.id,
					thumbUrl: '/images/fileUpload.svg',
				};
				videoList.push(video);
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
			res.icon = avatarLs;
			res.video = videoList;
			FormEdit.setFields(
				getInitializeValues({
					...res,
				}),
			);
			return res;
		},
		{ desValues: {} },
	);
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

	const goBack = () => history.push(DX.admin.createPath('/saas/list'));

	if (saasInfo.isInit)
		return (
			<div className="flex items-center mt-8">
				<Spin />
			</div>
		);
	return (
		<>
			<div className="w-full pb-8">
				<div className={isVisible ? 'show' : 'hidden'}>
					<div className="flex justify-between">
						<UrlBreadcrumb breadcrumbs={breadCrumb} />
					</div>
					{isDirty &&
						!user?.department?.provinceId &&
						DX.canAccessFuture2('admin/approved-service', user.permissions) && (
							<>
								<Button
									onClick={() => {
										openApproveForm();
									}}
									style={{ backgroundColor: '#2C3D94' }}
									className="text-white fixed bottom-0 right-0 rounded-none h-14 w-80 z-max"
								>
									<div className="flex justify-between">
										<div>{tButton('opt_approve', { field: 'service' })}</div>
										<div>
											<MinusOutlined />
										</div>
									</div>
								</Button>
								<SaasApprove
									form={form}
									idValue={id}
									closeForm={closeForm}
									visible={openForm}
									refetch={refetch}
									refetchDrawer={refetchDrawer}
								/>
							</>
						)}

					<Row>
						<Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={20}>
							<div className="font-semibold mt-5 mb-7 flex justify-between">
								<div>
									{nameProduct}
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
											onClick={() => setIsVisible(false)}
											icon={<EyeIcon width="w-4" />}
										>
											{tButton('preview')}
										</Button>
										{/* <Button
											type="default ml-4"
											className={` ${initValues.status === 'APPROVED' ? 'show' : 'hidden'}`}
											icon={<EyeOutlined />}
										>
											{tButton('currentStatus')}
										</Button> */}
									</div>
								)}
							</div>
							{!pricingId ? (
								<Tabs
									activeKey={queryUrl.get('tab') || '1'}
									onChange={(activeTab) => {
										history.replace(`${pathname}?tab=${activeTab}`);
									}}
								>
									<TabPane tab={tMenu('basicInfo')} key="1">
										<InforBasicProduct
											formEdit={form}
											initValues={initValues}
											resetForm={resetForm}
											statusApprove={statusApprove}
											selectServiceType={selectServiceType}
											typePortal="ADMIN"
											serviceOwner={initValues.serviceOwner}
											serviceOwnerVNPT={initValues.serviceOwnerVNPT}
											goBack={goBack}
										/>
									</TabPane>
									<TabPane tab={tMenu('serviceDes')} key="2" forceRender>
										<DesProduct
											FormEdit={FormEdit}
											statusApprove={statusApprove}
											isDirty={isDirty}
											initValues={initValuesDes}
											typePortal="ADMIN"
											goBack={goBack}
										/>
									</TabPane>
									{CAN_LIST_SERVICE_PACKAGE && (
										<TabPane tab={tMenu('servicePackage')} key="3" forceRender>
											<PricingListAdmin />
										</TabPane>
									)}
									<TabPane tab={tMenu('activityHistory')} key="4" forceRender>
										<HistoryService data={saasInfo} />
									</TabPane>
									<TabPane tab={tMenu('featureList')} key="5" forceRender>
										<Feature typePortal="ADMIN" />
									</TabPane>
								</Tabs>
							) : (
								<PricingDetailAdmin setPricingName={setPricingName} />
							)}
						</Col>
					</Row>
				</div>
				{!isVisible && (
					<DrawerPreview
						saasInfo={initValues}
						desInFo={FormEdit.getFieldsValue()}
						data={plans}
						classToggle={isVisible ? 'hidden' : ''}
						backEdit={() => setIsVisible(true)}
						statusApprove={statusApprove}
						typePortal="admin"
						dataEvaluate={dataEvaluate}
						type="admin"
					/>
				)}
			</div>
		</>
	);
}
