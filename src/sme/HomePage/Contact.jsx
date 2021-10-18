import React, { useState } from 'react';
import { Form, Button, Input, Select, message } from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLng } from 'app/hooks';
import { MailContact } from 'app/icons';
import { SmeContact } from 'app/models';
import { validateRequireInput, validateEmail, validateMaxLengthStr } from 'app/validator';
import { queryCache } from 'app/helpers';
import ContactBg from 'app/icons/contact_bg.png';
import { useSelector } from 'react-redux';
import { appSelects } from 'actions';

const HANOI_LOCATION_ID = 22;

const queryKey = 'Home.GetListContact';

const { getData, setData } = queryCache(queryKey, 60);

const getListCombo = async () => {
	const dataCache = getData();
	if (dataCache) {
		return dataCache;
	}
	const res = await SmeContact.getContactProvinces();
	const temp = res.map((item) => ({
		value: item.id,
		label: item.name,
		phoneNo: item.phoneNo,
		email: item.email,
	}));
	setData(temp);
	return temp;
};
const Contact = () => {
	const [contactForm] = Form.useForm();
	const { tField, tOthers, tButton, tValidation, tMessage } = useLng();
	const [currentProvinceValue, setCurrentProvinceValue] = useState({ value: HANOI_LOCATION_ID });
	const { isMobile } = useSelector(appSelects.selectSetting);

	const { data: provincesForContact } = useQuery([queryKey], getListCombo, {
		initialData: [],
	});

	const currentProvince = provincesForContact.find(({ value }) => value === currentProvinceValue.value);

	const handleSuccess = (messageType) => () => {
		contactForm.resetFields();
		message.success(tMessage(messageType, { field: 'message' }));
	};

	const handleError = (messageType) => () => {
		message.error(tMessage(messageType, { field: 'message' }));
	};

	const sendContactMutation = useMutation(SmeContact.sendContact, {
		onSuccess: handleSuccess('opt_successfullySent'),
		onError: (err) => {
			handleError('opt_badlySent');
			console.log(err);
		},
	});

	const handleSubmit = (request) => {
		sendContactMutation.mutate({ id: currentProvinceValue.value, data: request });
	};

	const handleProvinceChange = (data) => {
		setCurrentProvinceValue({ value: data.value });
	};

	const { TextArea } = Input;

	return (
		<div className="bg-gray-250 relative">
			<div className="container mx-auto py-10">
				<h1 className="text-4xl font-bold text-primary">{tOthers('contact')}</h1>
				<div className="w-1/2 mobile:w-full">
					<p className="mb-3 text-base font-medium">{tField('choose_province')}</p>
					<Select
						labelInValue
						defaultValue={currentProvinceValue}
						className="w-full mb-5"
						options={provincesForContact}
						onChange={handleProvinceChange}
						placeholder={tField('province')}
					/>
					<div className="text-base font-medium">
						<p>
							{tField('address')}:{' '}
							<span>
								<a title="email" href={`mailto:${currentProvince?.email}`}>
									{currentProvince?.email}
								</a>
							</span>
						</p>
						<p>
							{tField('phoneNum')}:{' '}
							<span className="cursor-pointer">
								<a title="Số điện thoại" href={`tel:${currentProvince?.phoneNo}`}>
									{currentProvince?.phoneNo}
								</a>
							</span>
						</p>
						<p>
							Hotline:{' '}
							<span className="cursor-pointer">
								<a title="hotline" href="tel:18001260">
									18001260
								</a>
							</span>
						</p>
					</div>

					<Form form={contactForm} onFinish={handleSubmit} layout="vertical" autoComplete="off" className="">
						<Form.Item
							label={tField('name')}
							name="fullName"
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'name' })),
								validateMaxLengthStr(50, tValidation('opt_enterMaxLength', { maxLength: '50' })),
							]}
						>
							<Input placeholder={tField('name')} maxLength={50} />
						</Form.Item>
						<Form.Item
							label={tField('email')}
							name="email"
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'email' })),
								validateEmail(tValidation('opt_isNotValid', { field: 'email' })),
								validateMaxLengthStr(100, tValidation('opt_enterMaxLength', { maxLength: '100' })),
							]}
						>
							<Input placeholder={tField('email')} maxLength={100} />
						</Form.Item>
						<Form.Item
							label={tField('message')}
							name="message"
							rules={[
								validateRequireInput(tValidation('opt_isRequired', { field: 'message' })),
								validateMaxLengthStr(500, tValidation('opt_enterMaxLength', { maxLength: '500' })),
							]}
						>
							<TextArea rows={4} placeholder={tField('message')} maxLength={500} />
						</Form.Item>
						<div className="text-right">
							<Button htmlType="submit">
								{tButton('sendUs')}
								<MailContact className="relative top-0.5" />
							</Button>
						</div>
					</Form>
				</div>
			</div>
			{!isMobile && (
				<div className="w-1/2 pt-12 absolute top-16 right-0">
					<img src={ContactBg} alt="contact" className="w-full max-w-5xl" />
				</div>
			)}
		</div>
	);
};

export default React.memo(Contact);
