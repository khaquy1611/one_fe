/* eslint-disable react/jsx-boolean-value */
/* eslint-disable prettier/prettier */
import React from 'react';
import { SaveOutlined } from '@ant-design/icons';
import { Editor, UploadImg, UploadImgDND, UploadVideo } from 'app/components/Atoms';
import { Button, Form, Input } from 'antd';
import { validateMaxLengthStr, validateRequire, validateRequireInput } from 'app/validator';
import { Link, useHistory } from 'react-router-dom';
import { DX } from 'app/models';
import { useLng } from 'app/hooks';
import useUser from '../../../app/hooks/useUser';

function DesProduct({
	FormEdit,
	statusApprove,
	isDirty,
	setDirty,
	showPromiseUpdateConfirm,
	initValues,
	goBack,
	typePortal,
}) {
	const history = useHistory();
	const { user } = useUser();
	const isDisable = React.useMemo(
		() =>
			statusApprove === 'APPROVED' ||
			statusApprove === 'REJECTED' ||
			statusApprove === 'AWAITING_APPROVAL' ||
			typePortal === 'ADMIN' ||
			!DX.canAccessFuture2('dev/update-service', user.permissions),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[statusApprove],
	);
	const { tButton, tOthers, tValidation, tField } = useLng();

	function onFinish(itemValues) {
		showPromiseUpdateConfirm({
			...itemValues,
			video: itemValues.video[0]?.uid,
			shortDescription: itemValues.sapoDescription,
			icon: itemValues.icon[0]?.uid,
			banner: itemValues.banner[0]?.uid,

			snapshots: (itemValues.snapshots || []).map((item, index) => ({
				id: item.uid,
				priority: index + 1,
			})),
		});
	}
	const invisibleBtn = statusApprove === 'AWAITING_APPROVAL' || statusApprove === 'REJECTED';
	function updateButtonSnapshots() {
		setDirty && setDirty(true);
	}

	return (
		<div>
			<Form
				className="mt-5 mb-20"
				labelCol={{ xxl: { span: 10 }, xl: { span: 6 }, lg: { span: 6 }, md: { span: 5 } }}
				wrapperCol={{ xxl: { span: 14 }, xl: { span: 14 }, lg: { span: 14 }, md: { span: 18 } }}
				layout="horizontal"
				form={FormEdit}
				onFinish={onFinish}
				autoComplete="off"
				initialValues={{
					description: ' ',
					sapoDescription: ' ',
					snapshots: [],
					...initValues,
				}}
				onValuesChange={() => updateButtonSnapshots()}
			>
				<Form.Item
					label={tField('avatar')}
					name="icon"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'avatar' }))]}
				>
					<UploadImg
						canUploadByLink
						onlyOne={true}
						disabled={isDisable}
						formEdit={FormEdit}
						fieldName="icon"
						type="service"
					/>
				</Form.Item>
				<Form.Item
					label={tField('banner')}
					name="banner"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'banner' }))]}
				>
					<UploadImg
						canUploadByLink
						onlyOne={true}
						disabled={isDisable}
						formEdit={FormEdit}
						fieldName="banner"
						type="service"
					/>
				</Form.Item>
				<Form.Item label={tField('introVideo')} name="video">
					<UploadVideo
						canUploadByLink
						onlyOne
						disabled={isDisable}
						formEdit={FormEdit}
						fieldName="video"
						type="service"
					/>
				</Form.Item>

				<Form.Item
					label={tField('capture')}
					name="snapshots"
					rules={[validateRequire(tValidation('opt_isRequired', { field: 'capture' }))]}
				>
					<UploadImgDND
						multiple
						type="service"
						disabled={isDisable}
						maxCount={20}
						formEdit={FormEdit}
						fieldName="snapshots"
					/>
				</Form.Item>
				<Form.Item
					label={tField('shortDes')}
					name="sapoDescription"
					rules={[validateRequireInput(tValidation('opt_isRequired', { field: 'shortDes' }))]}
					tooltip={typePortal === 'DEV' && tOthers('enterMaxLength', { maxLength: '200' })}
				>
					<Input.TextArea maxLength={500} showCount disabled={isDisable} rows={4} />
				</Form.Item>
				<Form.Item
					label={tField('serviceDes')}
					name="description"
					rules={[
						validateRequireInput(tValidation('opt_isRequired', { field: 'serviceDes' })),
						validateMaxLengthStr(5000, tValidation('opt_enterMaxLength', { maxLength: '5000' })),
					]}
					tooltip={typePortal === 'DEV' && tOthers('enterMaxLength', { maxLength: '5000' })}
				>
					<Editor disabled={isDisable} />
				</Form.Item>

				<div className="mt-5 ">
					{!invisibleBtn ? (
						<Button
							type="primary"
							htmlType="submit"
							icon={<SaveOutlined />}
							disabled={!isDirty || isDisable}
							className={`float-right ml-5 ${typePortal === 'ADMIN' ? 'hidden' : 'show'}`}
						>
							{tButton('update')}
						</Button>
					) : (
						''
					)}
					<Button type="dashed" className={`w-20 float-right border-217 `} onClick={goBack}>
						{tButton('opt_cancel')}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export default DesProduct;
