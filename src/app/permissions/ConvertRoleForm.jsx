import { Button, Checkbox, Modal } from 'antd';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextArea from 'antd/lib/input/TextArea';
import { noop } from 'opLodash';
import { DX, Users } from 'app/models';
import { useUser } from 'app/hooks';
import { useHistory } from 'react-router-dom';

function ConvertRoleForm({ visible, setVisible, onCancel, newUserConvert = {} }) {
	const { user, updateUser } = useUser();
	const history = useHistory();
	const [checked, setChecked] = useState(false);

	const isSMEAdminOrDevAdmin = () => ({
		isSme: { ...user, ...newUserConvert }.roles.some((el) => el === DX.sme.role),
		isDev: { ...user, ...newUserConvert }.roles.some((el) => el === DX.dev.role),
	});

	const handleActiveRole = async () => {
		const { isSme, isDev } = isSMEAdminOrDevAdmin();

		if (!isSme) {
			const res = await Users.activeOnPortal('SME');
			updateUser({
				...user,
				...newUserConvert,
				roles: res.roles.map((r) => r.id),
			});
			setVisible(false);
			window.location.href = '/sme-portal';
			// history.push('/sme-portal');
			return res;
		}
		if (!isDev) {
			const res = await Users.activeOnPortal('DEV');
			updateUser({
				...user,
				...newUserConvert,
				roles: res.roles.map((r) => r.id),
			});
			setVisible(false);
			window.location.href = '/dev-portal';
			// history.push('/dev-portal');
			return res;
		}
		return null;
	};
	return (
		<Modal
			centered
			visible={visible}
			footer={null}
			maskClosable={false}
			closable={false}
			bodyStyle={{
				padding: '1.85rem 1.65rem',
			}}
			width="36rem"
		>
			<p className="font-semibold text-xl text-gray-800 mb-2">
				{`Xác nhận điều khoản ${isSMEAdminOrDevAdmin().isSme ? 'Dev' : 'SME'}`}
			</p>
			<p className="text-gray-700 mb-8">
				{`Điều kiện và điều khoản sử dụng tài khoản trên ${
					isSMEAdminOrDevAdmin().isSme ? 'Dev' : 'SME'
				} portal`}
			</p>
			<TextArea
				rows={12}
				readOnly
				value="Nội dung điều kiện và điều khoản"
				className="text-base mb-8 text-black"
			/>
			<Checkbox className="text-black" checked={checked} onChange={() => setChecked(!checked)}>
				Tôi đồng ý với điều khoản ở trên
			</Checkbox>
			<div className="flex justify-center">
				<Button
					className="text-sm font-semibold w-2/5 mt-8 mr-4"
					type="default"
					onClick={() => {
						setVisible(false);
						setChecked(false);
						onCancel();
					}}
				>
					HỦY
				</Button>
				<Button
					className="text-sm font-semibold w-2/5 mt-8 ml-4"
					type="primary"
					onClick={() => handleActiveRole()}
					disabled={!checked}
				>
					TIẾP THEO
				</Button>
			</div>
		</Modal>
	);
}
ConvertRoleForm.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	onCancel: PropTypes.func,
	newUserConvert: PropTypes.objectOf(PropTypes.object),
};
ConvertRoleForm.defaultProps = {
	visible: false,
	setVisible: noop,
	onCancel: noop,
	newUserConvert: {},
};

export default ConvertRoleForm;
