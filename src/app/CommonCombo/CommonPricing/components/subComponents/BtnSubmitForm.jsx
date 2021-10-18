import React from 'react';
import { Button } from 'antd';
import { FileAddOutlined, SaveOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { comboPricingSelects } from 'app/redux/comboPricingReducer';

export default function BtnSubmitForm({ data, loading, disabled }) {
	const selectDisableBtn = useSelector(comboPricingSelects.selectDisableBtn);
	return (
		<>
			{!disabled && (
				<Button
					className="float-right ml-4"
					type="primary"
					htmlType="submit"
					icon={data?.id ? <SaveOutlined width="w-4" /> : <FileAddOutlined width="w-4" />}
					disabled={selectDisableBtn}
					loading={loading}
				>
					{data?.id ? 'Lưu' : 'Tạo gói Combo dịch vụ'}
				</Button>
			)}
		</>
	);
}
