import { message, Spin, Tabs } from 'antd';
import { useLng, useQueryUrl } from 'app/hooks';
import { DX, Pricing } from 'app/models';
import { servicePricingActions } from 'app/redux/servicePricingReducer';
import { isEmpty, isEqual } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import PricingApproved from './components/PricingApproved';
import PricingHistory from './components/PricingHistory';
import PricingInProcess from './components/PricingInProcess';

const { TabPane } = Tabs;

export default function CommonPricingDetail({ portal, setPricingName, setPricingInfo }) {
	const { id, pricingId } = useParams();
	const { pathname } = useLocation();
	const history = useHistory();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const [active, setActive] = useState('1');
	const [objectCheck, setObjectCheck] = useState({});
	const [disableTab, setDisableTab] = useState();
	const { tMessage, tMenu, tOthers } = useLng();

	const dispatch = useDispatch();

	useEffect(() => {
		if (disableTab === true) {
			history.replace(`${pathname}?tab=1`);
			setActive('1');
		} else if (disableTab === false) setActive(getTab);
	}, [disableTab]);

	const { data: pricingInfo, isFetching } = useQuery(
		['getPricingInfo', id],
		async () => {
			try {
				const res = await Pricing.getDetailCommonPortal(portal, pricingId, 'PROCESSING');
				setPricingName(res.pricingName);
				setDisableTab(res.hasApproved === 'NO');
				setPricingInfo && setPricingInfo(res);
				const resTrans = Pricing.transformData(res);
				if (portal === 'dev') delete resTrans.updateReason;
				dispatch(servicePricingActions.initPricingInfo(res));
				return { ...resTrans };
			} catch (e) {
				console.log('e', e);
				message.error(tMessage('err_notFoundServicePackage'));

				if (portal === 'admin') return history.push(DX.admin.createPath(`/saas/list/${id}?tab=3`));

				return history.push(DX.dev.createPath(`/service/list/${id}?tab=3`));
			}
		},
		{
			initialData: { featureList: [] },
			enabled: !!pricingId,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: oldPricingInfo, isFetching: loadingApproved } = useQuery(
		['getOldPricingInfo', id, pricingInfo],
		async () => {
			try {
				const res = await Pricing.getDetailCommonPortal(portal, pricingId, 'APPROVED');
				const resTrans = Pricing.transformData(res);
				const checkKeys = {};
				if (pricingInfo.approveStatus !== 'APPROVED' && !isEmpty(pricingInfo)) {
					Object.keys(pricingInfo).forEach((key) => {
						if (
							key === 'pricingStrategies' &&
							!isEmpty(pricingInfo.pricingStrategies) &&
							!isEmpty(resTrans.pricingStrategies)
						) {
							const tempOut = [];
							pricingInfo[key].forEach((el, index) => {
								const tempIn = {};
								Object.keys(el).forEach((elKey) => {
									if (!isEmpty(el) && !isEmpty(resTrans[key][index])) {
										if (elKey === 'unitLimitedList') {
											const maxEle = !isEmpty(resTrans[key][index][elKey])
												? resTrans[key][index][elKey].length
												: 0;
											const tempUnitLimitedList = [];
											if (el[elKey].length > 0) {
												el[elKey].forEach((e, i) => {
													const tempE = {};
													if (i <= maxEle - 1) {
														if (e.unitTo !== resTrans[key][index][elKey][i].unitTo) {
															tempE.unitTo = resTrans[key][index][elKey][i].unitTo
																? `${tOthers('oldValue')}: ${
																		resTrans[key][index][elKey][i].unitTo
																  }`
																: tOthers('newlyAdded');
														}
														if (e.price !== resTrans[key][index][elKey][i].price) {
															tempE.price = `${tOthers('oldValue')}: ${
																resTrans[key][index][elKey][i].price
															}`;
														}
													} else {
														tempE.unitTo = tOthers('newlyAdded');
														tempE.price = tOthers('newlyAdded');
													}
													if (!isEmpty(tempE)) tempUnitLimitedList.push({ ...tempE });
												});
											}
											tempIn[elKey] = { ...tempUnitLimitedList };
											if (isEmpty(tempIn[elKey])) delete tempIn[elKey];
										} else if (elKey !== 'id' && !isEqual(el[elKey], resTrans[key][index][elKey])) {
											tempIn[elKey] = resTrans[key][index][elKey]
												? `${tOthers('oldValue')}: ${resTrans[key][index][elKey]}`
												: tOthers('newlyAdded');
										}
									}
								});
								tempOut.push({ ...tempIn });
							});
							checkKeys.pricingStrategies = { ...tempOut };
						} else if (!isEqual(pricingInfo[key], resTrans[key])) {
							checkKeys[key] = resTrans[key]
								? `${tOthers('oldValue')}: ${resTrans[key]}`
								: tOthers('newlyAdded');
						}
					});
				}

				setObjectCheck(checkKeys);
				return { ...resTrans };
			} catch (e) {
				return e;
			}
		},
		{
			initialData: {},
			enabled: !!pricingId && pricingInfo.hasApproved === 'YES',
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	if (isFetching || loadingApproved)
		return (
			<div className="text-center mt-28">
				<Spin spinning />
			</div>
		);

	return (
		<Tabs
			activeKey={active || '1'}
			onChange={(activeTab) => {
				if (disableTab === false) {
					history.replace(`${pathname}?tab=${activeTab}`);
					setActive(activeTab);
				}
			}}
		>
			<TabPane tab={tMenu('infoBeingProcessed')} key="1">
				<PricingInProcess portal={portal} pricingInfo={pricingInfo} objectCheck={objectCheck} />
			</TabPane>
			<TabPane tab={tMenu('infoIsApproved')} key="2" forceRender disabled={disableTab}>
				<PricingApproved portal={portal} oldPricingInfo={oldPricingInfo} />
			</TabPane>
			<TabPane tab={tMenu('history')} key="3" forceRender disabled={disableTab}>
				<PricingHistory portal={portal} tabNumber={active} setActive={setActive} />
			</TabPane>
		</Tabs>
	);
}
