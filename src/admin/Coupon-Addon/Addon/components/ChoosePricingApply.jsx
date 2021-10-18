import { Button } from 'antd';
import { AddIcon } from 'app/icons';
import React, { useState } from 'react';
import { useLng } from 'app/hooks';
import { AddonAdmin } from 'app/models';
import TreeModalAddon from './TreeModalAddon';

export default function ChoosePricingApply({ onChange, value = [], disabled, form }) {
	const [openModal, setOpenModal] = useState(false);
	const { tOthers, tField } = useLng();
	const placeholder = tField('opt_search', { field: 'serviceName' });

	const onChoose = () => {
		setOpenModal(true);
	};
	return (
		<>
			<div className="flex gap-2">
				<div className="text-primary flex-auto pt-2 text-right">
					{value.length > 0 && `${tOthers('selected')}: ${value?.length}`}
				</div>
				<div className="flex justify-between items-center">
					<Button onClick={onChoose} disabled={disabled} icon={<AddIcon width="w-3.5" />} size="middle">
						Chọn gói dịch vụ
					</Button>
				</div>
			</div>

			{openModal && (
				<TreeModalAddon
					visible={openModal}
					handleApply={onChange}
					handleClose={() => setOpenModal(false)}
					callFn={async (params) => {
						const { content: res } = await AddonAdmin.getListPricingAddonOnce({ ...params });
						return res;
					}}
					initItemsPick={value}
					placeholder={placeholder}
					form={form}
				/>
			)}
		</>
	);
}
