import React, { useMemo, useState } from 'react';
import { Button, Input, Modal, Tree } from 'antd';
import { CaretDownOutlined, CloseCircleOutlined } from '@ant-design/icons';
import DepartmentDev from 'app/models/DepartmentDev';
import { useQuery } from 'react-query';
import { trim, uniq } from 'opLodash';
import classNames from 'classnames';
import { SearchCommon } from 'app/components/Atoms';
import { useLng } from 'app/hooks';

const listToTree = (arr = [], disableId) => {
	const map = {};
	let node;
	const res = [];
	let i;
	// eslint-disable-next-line no-return-assign
	// eslint-disable-next-line array-callback-return
	arr.map((item) => {
		item.children = null;
		item.title = `( ${item?.code} ) ${item?.name}`;
		item.key = item.id;
		if (item.id === disableId) {
			item.disabled = true;
		}
	});
	for (i = 0; i < arr.length; i += 1) {
		map[arr[i].id] = i;
		arr[i].children = [];
	}
	for (i = 0; i < arr.length; i += 1) {
		node = arr[i];
		if (node.parentId !== -1) {
			if (arr[map[node.parentId]]?.disabled === true) {
				node.disabled = true;
			}
			arr[map[node.parentId]]?.children?.push(node);
		} else {
			res.push(node);
		}
	}
	if (res.length > 0) {
		return res;
	}
	return arr;
};
function ChooseDepartment({ isSme, id, ...argss }) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { value = {}, onChange, disabled } = argss;
	const [selects, setSelect] = useState(value);
	const [searchDe, setSearchDe] = useState();
	const [expandedKeys, setExpandKeys] = useState([]);
	const { tButton, tField, tOthers, tMessage } = useLng();

	const { data } = useQuery(
		['getDescriptComment'],
		async () => {
			const res = await DepartmentDev.getAllTreeDepartPagination({});
			return listToTree(res, id);
		},
		{
			initialData: [],
		},
	);
	const filterTree = (dataRaw, searchText) => {
		const rs = [];
		dataRaw.forEach((node) => {
			const r = node.children?.length ? filterTree(node.children, searchText) : [];
			if (new RegExp(searchText, 'gi').test(node.title) || r.length) {
				expandedKeys.push(node.id);
				rs.push({
					...node,
					children: r,
				});
			}
		});
		return rs;
	};
	const treeData = useMemo(() => {
		if (!searchDe) {
			setExpandKeys([]);
			return data;
		}
		const treeSearch = filterTree(data, trim(searchDe));
		setExpandKeys(uniq(expandedKeys));
		return treeSearch;
	}, [searchDe, data]);

	function setDefaultsParent() {
		onChange({});
	}

	function closeModal() {
		setSearchDe('');
		setExpandKeys([]);
		setIsModalVisible(false);
	}
	return (
		<div className="flex">
			<Input
				{...argss}
				value={`${value?.name ? `(${value?.code}) ${value?.name}` : ``}`}
				placeholder={tField('parentDepartmentName')}
				maxLength={100}
				readOnly
				suffix={value.name && <CloseCircleOutlined onClick={setDefaultsParent} />}
			/>

			<Button
				disabled={disabled}
				className={classNames('ml-5', { uppercase: isSme, 'font-semibold': isSme })}
				onClick={() => setIsModalVisible(true)}
			>
				{tButton('opt_select', { field: 'department' })}
			</Button>
			{isModalVisible && (
				<Modal
					maskClosable={false}
					title={
						<div className={`font-semibold text-xl ${isSme ? 'text-gray-800' : ''}`}>
							{tMessage('opt_select', { field: 'parentDepartment' })}
						</div>
					}
					visible={isModalVisible}
					onOk={() => {
						onChange(selects);
						setIsModalVisible();
					}}
					onCancel={closeModal}
					okText={tButton('opt_select')}
					cancelText={tButton('opt_cancel')}
					footer={null}
					width={600}
				>
					<SearchCommon
						className="w-60 mr-6 mb-5"
						placeholder={tField('opt_select', { field: 'department' })}
						onSearch={setSearchDe}
						maxLength={100}
						defaultValue={searchDe}
					/>
					<div
						className="border border-gray-600 p-4"
						style={{
							minHeight: '400px',
							maxHeight: '60vh',
							overflowX: 'hidden',
							overflowY: 'auto',
							borderStyle: 'solid',
						}}
					>
						{treeData.length > 0 ? (
							<Tree
								treeData={treeData}
								onSelect={(keys, info) => {
									setSelect({
										id: keys[0],
										name: info.node.name,
										code: info.node.code,
										parentId: info.node.parentId,
										provinceName: info.node.provinceName,
										provinceId: info.node.provinceId,
									});
								}}
								blockNode
								expandedKeys={expandedKeys}
								onExpand={setExpandKeys}
								defaultSelectedKeys={[value.id]}
								showLine={{
									showLeafIcon: false,
								}}
								switcherIcon={<CaretDownOutlined />}
								titleRender={(node) => <div className="line-clamp-1">{node.title}</div>}
							/>
						) : (
							tOthers('noneDataForSearch')
						)}
					</div>

					<div className="mt-6 flex flex-row-reverse  text-right">
						<div className={`${isSme ? 'w-full flex' : ''}`}>
							<Button onClick={closeModal} className={`${isSme ? 'w-2/4 mr-4' : ''}`}>
								{tButton('opt_cancel')}
							</Button>
							<Button
								className={`ml-2 ${isSme ? 'w-2/4 ml-2' : ''}`}
								type="primary"
								onClick={() => {
									onChange(selects);
									setIsModalVisible();
								}}
								disabled={!selects.id}
							>
								{tButton('opt_select')}
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}

export default ChooseDepartment;
