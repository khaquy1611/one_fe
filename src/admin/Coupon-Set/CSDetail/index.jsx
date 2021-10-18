import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Dropdown, Input, Menu, message, Modal, Row, Select, Table, Tag, Typography } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { DeleteOutlined, ExclamationCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useLng, usePagination, useUser } from '../../../app/hooks';
import { AdminCoupon, CouponSetItem, DevCoupon, DevCouponSet, DX } from '../../../app/models';
import { renderOptions, SearchCommon, UrlBreadcrumb } from '../../../app/components/Atoms';
import { exportData, parseObjToQueryString, parseQueryStringToObjectStc } from '../../../app/helpers';
import { ExportCouponHeader, getDataTransform } from '../../../app/models/ExportCouponSetDTO';

const USED_ERROR = 'error.coupon.has.been.used';
const CODE = 'code';
const STATUS = 'status';
const IN_USED = '0';
const USED = '1';
const ALL = '';

function Index(props) {
	const { displayOptionsFormatStc } = AdminCoupon;
	const { id } = useParams();

	// const { pathname } = useLocation();
	const { user } = useUser();
	const [selectionRowKeys, setSelectionRowKeys] = useState([]);
	const [dirty, setDirty] = useState(false);
	const { tMessage, tButton, tOthers, tField, tFilterField, tLowerField, tModal } = useLng();

	const couponSetData = useQuery('getCouponSetName', () => DevCouponSet.getOneById(id));

	const {
		configTable,
		page,
		content,
		pageSize,
		refetch,
		isLoading,
		isFetching,
		query,
		onChangeOneParam,
		getColumnSortDefault,
	} = usePagination(CouponSetItem.search, ['query'], {
		query: `couponSetId==${id}`,
	});
	const [queryString] = [query.get('query') || ''];
	const queryObjParsed = parseQueryStringToObjectStc(queryString);
	queryObjParsed.couponSetId = id;

	// -----------------------------Delete promotion------------------------------//
	const deleteCouponItemMutation = useMutation(CouponSetItem.batchDelete, {
		onSuccess: (res) => {
			// if (res) message.success(res.message);
			message.success(tMessage('opt_successfullyDeleted', { field: 'couponItem' }));
			// else message.success('Xóa mã khuyến mãi thành công');
			refetch();
			setSelectionRowKeys([]);
			setDirty(false);
		},
		onError: (e) => {
			if (e.errorCode === USED_ERROR) return message.error(tMessage('err_promIsUsed'));
			return message.error(tMessage('opt_badlyDeleted', { field: 'couponItem' }));
		},
	});

	const handleDeleteCouponCode = () => {
		Modal.confirm({
			title: tMessage('opt_wantToDelete', { field: 'couponItem' }),
			icon: <ExclamationCircleOutlined />,
			okText: tButton('opt_confirm'),
			cancelText: tButton('opt_cancel'),
			onOk: () => {
				deleteCouponItemMutation.mutate([...selectionRowKeys]);
			},
			onCancel: () => {
				setSelectionRowKeys([]);
				setDirty(false);
			},
			confirmLoading: deleteCouponItemMutation.isLoading,
		});
	};

	// ----------------------check expired time---------------------------//

	const rowSelection = {
		onChange: (selectedRowKeys) => {
			const inserted = selectedRowKeys[selectedRowKeys.length - 1];
			const selected = content.filter((item) => item.id === inserted)[0];
			if (selected?.subscriptionId) {
				// Modal.info({
				// 	title: tMessage('opt_conditionToDelete'),
				// 	// content: (
				// 	// 	<div>
				// 	// 		<p>some messages...some messages...</p>
				// 	// 		<p>some messages...some messages...</p>
				// 	// 	</div>
				// 	// ),
				// 	onOk() {},
				// });
				return;
			}
			setSelectionRowKeys(selectedRowKeys);
			if (selectedRowKeys.length > 0) setDirty(true);
			else setDirty(false);
		},
		selectedRowKeys: selectionRowKeys,
		preserveSelectedRowKeys: true,
	};

	const onSearch = (value, type) => {
		let stringSearchSTCFormat = '';
		if (type === CODE) {
			queryObjParsed.code = value ? `*${value}*` : '';
		}
		if (type === STATUS) {
			queryObjParsed.status = value;
		}
		stringSearchSTCFormat = parseObjToQueryString(queryObjParsed);
		onChangeOneParam('query')(stringSearchSTCFormat);
	};
	function getTagColor(value) {
		if (value === 1) return 'error';
		if (value === 0) return 'success';
		return 'default';
	}
	const columns = [
		{
			title: '#',
			dataIndex: 'id',
			key: 'id',
			render: (value, item, index) => (page - 1) * pageSize + index + 1,
			width: 50,
		},
		{
			title: tField('shortcutCouponSetItemCode'),
			dataIndex: 'code',
			key: 'code',
			render: (value) => <p>{value}</p>,
			sorter: {},
			ellipsis: true,
		},
		{
			title: tField('status'),
			dataIndex: 'status',
			key: 'status',
			render: (value) => <Tag color={getTagColor(value)}>{tFilterField('inUseStatusOptions2', `${value}`)}</Tag>,
		},
		{
			title: tField('couponName2'),
			dataIndex: 'couponName',
			key: 'couponName',
			render: (value) => <Typography.Link>{value}</Typography.Link>,
		},
		{
			title: tField('couponSetName2'),
			dataIndex: 'couponSetName',
			key: 'couponSetName',
			render: (value) => <Typography.Link>{value}</Typography.Link>,
		},
		{
			title: tField('subscriptionName'),
			dataIndex: 'subscriptionName',
			key: 'subscriptionName',
			render: (value) => <Typography.Link>{value}</Typography.Link>,
			sorter: {},
		},
		{
			title: tField('totalCost'),
			dataIndex: 'totalMoneyDiscount',
			key: 'totalMoneyDiscount',
			render: (value) => <Typography.Text>{value}</Typography.Text>,
		},
	];

	useEffect(() => {
		setSelectionRowKeys([]);
		setDirty(false);
	}, [queryString]);
	useEffect(() => {
		if (content.length === 0 && !isFetching) {
			if (queryObjParsed.status === IN_USED) {
				message.info(tMessage('warnNoCodeInUse')).then();
			} else {
				message.info(tMessage('warnNoCodeUse')).then();
			}
		}
	}, [content, queryObjParsed.status, isFetching]);

	const couponItemListBreadCum = [
		{
			name: 'opt_manage/service',
			url: '',
		},
		{
			name: 'couponSet',
			url: '/admin-portal/promotion/coupon-set',
		},
		{
			isName: true,
			name: couponSetData?.data?.name || tMessage('err_400_couponSet'),
			url: '',
		},
	];

	const fileExportName = `coupon_set_code_of_${couponSetData?.data?.name}`;
	async function handleExportData(type) {
		CouponSetItem.export({ couponSetId: id })
			.then((data) => {
				const resultTransform = getDataTransform(data);
				exportData(ExportCouponHeader, resultTransform, fileExportName, type);
			})
			.catch((err) => {
				console.error(err);
				message.error(tMessage('error_export'));
			});
	}
	const menuExport = (
		<Menu>
			<Menu.Item key="csv" onClick={() => handleExportData('csv')}>
				Csv
			</Menu.Item>
			<Menu.Item key="excel" onClick={() => handleExportData('xlsx')}>
				Excel
			</Menu.Item>
		</Menu>
	);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const showModal = () => {
		setIsModalVisible(true);
	};
	const ModalChangeCouponName = () => {
		const inputRef = useRef(null);

		const editCouponSetName = useMutation(DevCouponSet.editCouponSet, {
			onSuccess: (res) => {
				message.success(tMessage('opt_successfullyEdited', { field: 'couponSetName' }));
				refetch();
				couponSetData.refetch();
				setSelectionRowKeys([]);
				setDirty(false);
			},
			onError: (e) => {
				if (e.errorCode === USED_ERROR) return message.error(tMessage('err_promIsUsed'));
				return message.error(tMessage('opt_badlyEdit', { field: 'couponSetName' }));
			},
		});

		const handleOk = () => {
			console.log('value', inputRef.current.value);
			editCouponSetName.mutate({
				id: couponSetData.data.id,
				body: { ...couponSetData.data, name: inputRef.current.value },
			});
			setIsModalVisible(false);
		};

		const handleCancel = () => {
			setIsModalVisible(false);
		};
		return (
			<Modal
				title={tModal('editCouponSetName')}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				style={{ top: 140, left: 10, display: 'inline-block', float: 'right', marginRight: 50 }}
				okText={tButton('opt_save')}
			>
				<Row align="middle">
					<Col span={8}>{tField('couponSetName2')} :</Col>
					<Col span={16}>
						<input
							defaultValue={couponSetData?.data?.name}
							ref={inputRef}
							style={{ width: '100%', paddingLeft: 10 }}
						/>
					</Col>
				</Row>
			</Modal>
		);
	};
	return (
		<div className="animate-zoomOut">
			<div className="flex justify-between">
				<UrlBreadcrumb breadcrumbs={couponItemListBreadCum} />
				<div>
					<Dropdown overlay={menuExport}>
						<Button type="primary" icon={<ExportOutlined width="w-4" />}>
							{tButton('opt_export')}
						</Button>
					</Dropdown>

					<Button type="primary" className="ml-5" onClick={showModal}>
						{tButton('opt_edit')}
					</Button>
					<ModalChangeCouponName />
				</div>
			</div>
			<div className="flex justify-between mt-5">
				<div className="flex gap-6 tablet:gap-4 tablet:flex-wrap w-10/12 tablet:w-9/12">
					<SearchCommon
						placeholder={`Tìm kiếm ${tLowerField('couponItem')}`}
						onSearch={(value) => onSearch(value, CODE)}
						defaultValue={queryObjParsed?.code?.replaceAll('*', '')}
						autoFocus
						maxLength={200}
						className="w-3/12 tablet:w-5/12"
					/>
					<Select
						className="w-3/12 tablet:w-5/12"
						value={queryObjParsed.status || ''}
						onSelect={(value) => onSearch(value, STATUS)}
					>
						{renderOptions(
							tFilterField('prefix', 'status'),
							displayOptionsFormatStc.map((e) => ({
								...e,
								label: tFilterField('inUseStatusOptions', e.label),
							})),
						)}
					</Select>
				</div>
				{DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions) && (
					<div className=" w-2/12 lg:w-3/12 flex justify-end lg:items-start">
						<div className="flex items-center">
							<span className="mr-4">
								{tOthers('selecting')}: {selectionRowKeys?.length}
							</span>
							<Button icon={<DeleteOutlined />} onClick={handleDeleteCouponCode} disabled={!dirty}>
								{tButton('delete')}
							</Button>
						</div>
					</div>
				)}
			</div>
			<Table
				rowSelection={
					DX.canAccessFuture2('dev/delete-coupon-by-dev', user.permissions) ? { ...rowSelection } : null
				}
				className="mt-8"
				columns={getColumnSortDefault(columns)}
				{...configTable}
			/>
		</div>
	);
}

export default Index;
