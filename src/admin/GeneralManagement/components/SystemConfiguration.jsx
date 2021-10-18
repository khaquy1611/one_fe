/* eslint-disable no-unused-expressions */
/* eslint-disable no-unneeded-ternary */
import React, { useState } from 'react';
import { Select, Space, Button, message, Switch, Input, Row, Col, Radio, Form } from 'antd';
import { UrlBreadcrumb } from 'app/components/Atoms';
import { useMutation, useQuery } from 'react-query';
import { SystemConfig, DX } from 'app/models';
import { formatNormalizeNumber, validateInputNumAndComma, validateRequire } from 'app/validator';
import { useLng } from 'app/hooks';
import styled from 'styled-components';
import useUser from '../../../app/hooks/useUser';

const { Option } = Select;

const SystemConfiguration = () => {
	const { user } = useUser();
	const CAN_UPDATE = DX.canAccessFuture2('admin/update-system-config', user.permissions);
	const [isDirty, setIsDirty] = useState(false);
	const [form] = Form.useForm();
	const { tButton, tField, tMessage, tMenu, tFilterField, tLowerField, tValidation } = useLng();

	const SpanPosition = styled.span`
		position: absolute;
		left: -10rem;
	`;

	const { data } = useQuery(['SystemConfig.GetAllPromotionSystem'], () => SystemConfig.getAll(), {
		onSuccess: (res) => {
			const body = {};
			res.forEach((config) => {
				if (config.paramType === 'RENEWAL') {
					body.numberOfDayRemind = config.numberOfDayRemind;
				}
				// if (config.paramType === 'UPDATE_SUBSCRIPTION') {
				// 	body.updateSubscription = config.paramValue;
				// }
				// if (config.paramType === 'CHANGE_PRICING') {
				// 	body.changePricing = config.paramValue;
				// }
				if (config.paramType === 'COUPON') {
					body.paramValue = config.paramValue;
					config.paymentTypeOn === 'ON' ? (body.paymentTypeOn = true) : (body.paymentTypeOn = false);
					config.paymentTypeOff === 'ON' ? (body.paymentTypeOff = true) : (body.paymentTypeOff = false);
					body.paymentDateFailOn = config.paymentDateFailOn;
					body.paymentRequestDays = config.paymentRequestDays;
					body.paymentTypeAutoOn = config.paymentTypeAutoOn;
					body.unsubscribeOn = config.unsubscribeOn;
					body.paymentDateFailOff = config.paymentDateFailOff;
					body.unsubscribeOff = config.unsubscribeOff;
				}
			});
			form.setFieldsValue(body);
		},
	});

	const updateMutation = useMutation(SystemConfig.customizeUpdatePromotionSystem, {
		onSuccess: () => {
			message.success(tMessage('opt_successfullyUpdated'));
		},
	});

	function handleValueFormChange() {
		setIsDirty(true);
	}

	function handleCancel() {
		form.setFieldsValue(data.body);
		setIsDirty(false);
	}

	function onFinish(values) {
		console.log(values, 'huy');
		setIsDirty(false);
		const body = [];
		const parseValues = {
			numberOfDayRemind: parseInt(values.numberOfDayRemind, 10),
			paymentTypeOn: values.paymentTypeOn ? 'ON' : 'OFF',
			paymentTypeOff: values.paymentTypeOff ? 'ON' : 'OFF',
		};
		data.forEach((e) => {
			if (e.paramType === 'COUPON') {
				body.push({
					id: e.id,
					paramValue: values.paramValue,
					paymentDateFailOff: values.paymentDateFailOff,
					paymentDateFailOn: values.paymentDateFailOn,
					paymentRequestDays: values.paymentRequestDays,
					paymentTypeAutoOn: values.paymentTypeAutoOn,
					paymentTypeOff: values.paymentTypeOff,
					paymentTypeOn: values.paymentTypeOn,
					unsubscribeOff: values.unsubscribeOff,
					unsubscribeOn: values.unsubscribeOn,
					...parseValues,
				});
			}
			// if (e.paramType === 'CHANGE_PRICING') {
			// 	body.push({
			// 		id: e.id,
			// 		paramValue: values.changePricing,
			// 	});
			// }
			// if (e.paramType === 'UPDATE_SUBSCRIPTION') {
			// 	body.push({
			// 		id: e.id,
			// 		paramValue: values.updateSubscription,
			// 	});
			// }
			if (e.paramType === 'RENEWAL') {
				body.push({
					id: e.id,
					numberOfDayRemind: values.numberOfDayRemind,
				});
			}
		});
		console.log(body, 'final');
		updateMutation.mutate(body);
	}

	return (
		<div className="max-w-7xl">
			<div className="flex items-center justify-between mb-5">
				<UrlBreadcrumb type="systemConfig" />
			</div>
			<Form form={form} onFinish={onFinish} onValuesChange={handleValueFormChange}>
				<div className="border-solid border border-gray-200 rounded-lg">
					<div className="pl-4 py-3 font-bold">{tMenu('promConfiguration')}</div>
					<div className="pl-4 pt-5 pr-28 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200">
						<Row>
							<Col span={7} className="text-base pt-2.5">
								{tField('allowToApplyProms')}
							</Col>
							<Col>
								<Form.Item name="paramValue">
									<Select size="small" style={{ width: 210 }} disabled={!CAN_UPDATE}>
										<Option disabled={!CAN_UPDATE} value="UNLIMITED">
											{tFilterField('value', 'yes')}
										</Option>
										<Option disabled={!CAN_UPDATE} value="ONCE">
											{tFilterField('value', 'no')}
										</Option>
									</Select>
								</Form.Item>
							</Col>
						</Row>
					</div>
				</div>

				<div className="mt-6 border-solid border border-gray-200 rounded-lg ">
					<div className="pl-4 py-3 font-bold">{tMenu('paymentConfiguration')}</div>
					<div className="pl-4 pt-5 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200">
						<Row>
							<Col span={6} className="text-base pt-2.5">
								{tField('onPayment')}
							</Col>
							<Col className="pl-5">
								<Form.Item name="paymentTypeOn" className="my-0" valuePropName="checked">
									<Switch disabled={!CAN_UPDATE} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item shouldUpdate className="mb-0">
							{() => (
								<div className={!form.getFieldValue('paymentTypeOn') && 'hidden'}>
									<Row>
										<Col span={6} className="ml-4 pt-3.5 text-sm">
											{tField('paymentAuthorizationFailed')}
										</Col>
										<Col span={5} className="pl-1">
											<Form.Item
												name="paymentDateFailOn"
												className="my-0"
												normalize={(value) => formatNormalizeNumber(value)}
												rules={[
													validateRequire(
														tValidation('opt_isRequired', {
															field: 'paymentAuthorizationFailed',
														}),
													),
												]}
											>
												<Input disabled={!CAN_UPDATE} maxLength={10} className="h-8 w-24" />
											</Form.Item>
										</Col>
										<Col className="pt-3.5">
											<SpanPosition className="ml-1">{tLowerField('day')}</SpanPosition>
										</Col>
									</Row>
									<Row className="h-11">
										<Col span={6} className="ml-4 pt-3.5 text-sm">
											{tField('submitPaymentRequestTime')}
										</Col>
										<Col className="pl-1">
											<Form.Item name="paymentTypeAutoOn" className="my-0">
												<Radio.Group>
													<Radio disabled={!CAN_UPDATE} value="AUTO">
														<span className="text-sm">{tFilterField('value', 'auto')}</span>
													</Radio>
													<Radio disabled={!CAN_UPDATE} value="NOT_AUTO">
														<span className="text-sm">
															{tFilterField('value', 'dayConfiguration')}
														</span>
													</Radio>
												</Radio.Group>
											</Form.Item>
										</Col>
										<Col>
											<Form.Item shouldUpdate>
												{() => (
													<Form.Item
														name="paymentRequestDays"
														dependencies={['paymentDateFailOn']}
														rules={[
															validateInputNumAndComma(
																tValidation('plsEnterNumAndComma'),
															),
															({ getFieldValue }) => ({
																validator(_, value) {
																	const paymentDateFailOn = parseInt(
																		getFieldValue('paymentDateFailOn'),
																		10,
																	);
																	if (
																		value &&
																		Math.max(
																			...value
																				.split(',')
																				.filter((n) => !!n)
																				.map(parseInt),
																		) > paymentDateFailOn
																	) {
																		return Promise.reject(
																			new Error(
																				tMessage(
																					'dateConfigNotBiggerThanPaymentTime',
																				),
																			),
																		);
																	}
																	return Promise.resolve();
																},
															}),
														]}
													>
														<Input
															disabled={
																form.getFieldValue('paymentTypeAutoOn') === 'AUTO' ||
																!CAN_UPDATE
															}
															className="h-8 w-52"
															onBlur={({ target: { value } }) =>
																form.setFieldsValue({
																	paymentRequestDays: value
																		.split(',')
																		.filter((n) => !!n)
																		.join(','),
																})
															}
														/>
													</Form.Item>
												)}
											</Form.Item>
										</Col>
									</Row>
									<Row>
										<Col span={6} className="ml-4 pt-3.5 text-sm">
											{tField('autoUnsubscribe')}
										</Col>
										<Col>
											<Form.Item name="unsubscribeOn" className="my-0 pl-1">
												<Radio.Group>
													<Radio disabled={!CAN_UPDATE} value="AUTO">
														<span className="text-sm">{tFilterField('value', 'yes')}</span>
													</Radio>
													<Radio disabled={!CAN_UPDATE} value="NOT_AUTO">
														<span className="text-sm">{tFilterField('value', 'no')}</span>
													</Radio>
												</Radio.Group>
											</Form.Item>
										</Col>
									</Row>
								</div>
							)}
						</Form.Item>
						<Row>
							<Col span={6} className="text-base pt-2.5">
								{tField('offPayment')}
							</Col>
							<Col>
								<Form.Item name="paymentTypeOff" className="my-0 pl-5" valuePropName="checked">
									<Switch disabled={!CAN_UPDATE} />
								</Form.Item>
							</Col>
						</Row>
						<Form.Item shouldUpdate>
							{() => (
								<div className={!form.getFieldValue('paymentTypeOff') && 'hidden'}>
									<Row>
										<Col span={6} className="ml-4 pt-3.5 text-sm">
											{tField('paymentAuthorizationFailed')}
										</Col>
										<Col span={2} className="pl-1">
											<Form.Item
												name="paymentDateFailOff"
												className="my-0"
												normalize={(value) => formatNormalizeNumber(value)}
											>
												<Input disabled={!CAN_UPDATE} className="h-8 w-24" />
											</Form.Item>
										</Col>
										<Col className="pt-3.5">
											<span className="ml-1">{tLowerField('day')}</span>
										</Col>
									</Row>
									<Row>
										<Col span={6} className="ml-4 pt-3.5 text-sm">
											{tField('autoUnsubscribe')}
										</Col>
										<Col>
											<Form.Item name="unsubscribeOff" className="my-0">
												<Radio.Group>
													<Radio disabled={!CAN_UPDATE} value="AUTO">
														<span className="text-sm">{tFilterField('value', 'yes')}</span>
													</Radio>
													<Radio disabled={!CAN_UPDATE} value="NOT_AUTO">
														<span className="text-sm">{tFilterField('value', 'no')}</span>
													</Radio>
												</Radio.Group>
											</Form.Item>
										</Col>
									</Row>{' '}
								</div>
							)}
						</Form.Item>
					</div>
				</div>

				<div className="mt-6 border-solid border border-gray-200 rounded-lg">
					<div className="pl-4 py-3 font-bold">{tMenu('reminderDay')}</div>
					<div className="pl-4 pt-5 pr-10 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200">
						<Row>
							<Col span={6} className="text-base pt-3.5">
								{tField('reminderDay')}
							</Col>
							<Col span={6} className="pl-6">
								<Form.Item name="numberOfDayRemind">
									<Input disabled={!CAN_UPDATE} size="small" addonAfter={tLowerField('day')} />
								</Form.Item>
							</Col>
						</Row>
					</div>
				</div>

				{/* <div className="mt-6 border-solid border border-gray-200 rounded-lg">
					<div className="pl-4 py-3 font-bold">{tMenu('timeToChangePackage')}</div>
					<div className="pl-4 pt-5 pr-10 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200">
						<Form.Item name="changePricing" className="my-0">
							<Radio.Group>
								<Radio disabled={!CAN_UPDATE} value="NOW">
									<span className="text-sm">{tFilterField('value', 'now')}</span>
								</Radio>
								<Radio disabled={!CAN_UPDATE} value="END_CYCLE">
									<span className="text-sm">{tFilterField('value', 'endOfCycle')}</span>
								</Radio>
							</Radio.Group>
						</Form.Item>
					</div>
				</div> */}

				{/* <div className="mt-6 border-solid border border-gray-200 rounded-lg">
					<div className="pl-4 py-3 font-bold">{tMenu('editingSubscriberTime')}</div>
					<div className="pl-4 pt-5 pr-10 border-solid border-t border-r-0 border-b-0 border-l-0 border-gray-200">
						<Form.Item name="updateSubscription" className="my-0">
							<Radio.Group>
								<Radio disabled={!CAN_UPDATE} value="NOW">
									<span className="text-sm">{tFilterField('value', 'now')}</span>
								</Radio>
								<Radio disabled={!CAN_UPDATE} value="END_CYCLE">
									<span className="text-sm">{tFilterField('value', 'endOfCycle')}</span>
								</Radio>
							</Radio.Group>
						</Form.Item>
					</div>
				</div> */}

				<div className="mt-6 flex justify-end">
					<Space>
						<Form.Item>
							<Button
								htmlType="button"
								hidden={!CAN_UPDATE}
								className="w-20 h-10 mr-3"
								onClick={() => {
									handleCancel();
								}}
							>
								{tButton('opt_cancel')}
							</Button>

							<Button
								hidden={!CAN_UPDATE}
								className="w-20 h-10"
								type="primary"
								disabled={!isDirty}
								htmlType="submit"
							>
								{tButton('opt_save')}
							</Button>
						</Form.Item>
					</Space>
				</div>
			</Form>
		</div>
	);
};

export default SystemConfiguration;
