import { message, Spin, Tabs, Tag } from 'antd';
import { useLng, useQueryUrl, useUser } from 'app/hooks';
import { ComboPricing, DX, SaasAdmin } from 'app/models';
import { comboPricingActions } from 'app/redux/comboPricingReducer';
import { isEmpty, isEqual } from 'opLodash';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import ComboPricingApproved from './components/ComboPricingApproved';
import ComboPricingHistory from './components/ComboPricingHistory';
import ComboPricingInprocess from './components/ComboPricingInprocess';

const { TabPane } = Tabs;

export default function CommonComboPricingDetail({ portal, setPricingName, setPricingInfo, isOwnerProvince }) {
	const { user } = useUser();
	const CAN_VIEW =
		(portal === 'admin' && DX.canAccessFuture2('admin/view-combo-pack', user.permissions)) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/view-combo-pack', user.permissions));
	const CAN_UPDATE =
		(portal === 'admin' && DX.canAccessFuture2('admin/update-combo-pack', user.permissions)) ||
		(portal === 'dev' && DX.canAccessFuture2('dev/update-combo-pack', user.permissions));
	const dispatch = useDispatch();
	const { id, pricingId } = useParams();
	const { pathname } = useLocation();
	const history = useHistory();
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');
	const [active, setActive] = useState('1');
	const [disableTab, setDisableTab] = useState();
	const [disabled, setDisabled] = useState(false);
	const [objectCheck, setObjectCheck] = useState({});
	const { tMenu, tFilterField } = useLng();

	useEffect(() => {
		if (disableTab === true) {
			history.replace(`${pathname}?tab=1`);
			setActive('1');
		} else if (disableTab === false) setActive(getTab);
	}, [disableTab]);

	const { data: pricingInfo, isFetching } = useQuery(
		['getComboPlanInfo', id],
		async () => {
			try {
				if (!CAN_VIEW) {
					if (portal === 'admin') history.push(DX.admin.createPath('/page-not-found'));
					else history.push(DX.dev.createPath('/page-not-found'));
					return null;
				}
				const res = await ComboPricing.getDetailComboPlanByPricingId(pricingId, 'PROCESSING');
				setDisableTab(res.hasApproved === 'NO');
				setPricingName && setPricingName(res.name);
				setPricingInfo && setPricingInfo(res);
				const resTrans = ComboPricing.transformData(res);

				if (resTrans.approve === 'APPROVED' || resTrans.approve === 'REJECTED') delete resTrans.updateReason;
				if ((portal === 'admin' && res.createdBy === '') || resTrans?.approve === 'AWAITING_APPROVAL')
					setDisabled(true);
				if (!CAN_UPDATE) setDisabled(true);
				return resTrans;
			} catch (e) {
				// if (e.errorCode === 'error.object.not.found' && e.field === 'id') {
				message.error('Không tìm thấy gói Combo dịch vụ này');
				setTimeout(() => {
					if (portal === 'admin') history.push(DX.admin.createPath(`/combo/${id}?tab=3`));
					else history.push(DX.dev.createPath(`/combo/${id}?tab=3`));
				}, 500);
				// }
				return e;
			}
		},
		{
			initialData: {},
			enabled: !!pricingId,
			cacheTime: 0,
			staleTime: 0,
			keepPreviousData: false,
		},
	);

	const { data: oldPricingInfo, isFetching: loadingApproved } = useQuery(
		['getOldComboPlanInfo', id, pricingInfo],
		async () => {
			try {
				const res = await ComboPricing.getDetailComboPlanByPricingId(pricingId, 'APPROVED');
				const resTrans = ComboPricing.transformData(res);
				const checkKeys = {};
				if (pricingInfo.approve !== 'APPROVED') {
					Object.keys(pricingInfo).forEach((key) => {
						if (!isEqual(pricingInfo[key], resTrans[key])) {
							checkKeys[key] = true;
						}
					});
				}

				setObjectCheck(checkKeys);
				return resTrans;
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

	const onChangeTabPage = (tab) => {
		let data = {};
		if (tab === '1') data = pricingInfo;
		else if (tab === '2') data = oldPricingInfo;
		else return;
		const { periodValue, periodType, pricingCombo } = data;
		dispatch(
			comboPricingActions.initComboPricing({
				pricingCombo,
				totalPrice: 0,
				amount: data.amount,
			}),
		);
		dispatch(
			comboPricingActions.calculateChangeAllPricing({
				periodValue,
				periodType,
			}),
		);
	};
	const [isFirst, setIsFirst] = useState(true);
	useEffect(() => {
		if (isFirst && (!active || active === '1') && !isEmpty(pricingInfo)) {
			onChangeTabPage('1');
			setIsFirst(false);
		} else if (isFirst && active === '2' && !isEmpty(oldPricingInfo)) {
			onChangeTabPage('2');
			setIsFirst(false);
		}
	}, [active, pricingInfo, oldPricingInfo]);

	const tagStatus = SaasAdmin.tagStatus[pricingInfo.approve];

	return (
		<>
			{isFetching || loadingApproved ? (
				<div className="text-center">
					<Spin spinning />
				</div>
			) : (
				<>
					<div className="font-semibold mt-5 mb-7 flex justify-between">
						<div>
							<span className="text-xl font-semibold">{pricingInfo.name}</span>
							<span className="font-medium ml-3">
								<Tag color={tagStatus?.color}>
									{tFilterField('approvalStatusOptions', tagStatus?.text)}
								</Tag>
							</span>
						</div>
					</div>
					<Tabs
						activeKey={active || '1'}
						onChange={(activeTab) => {
							history.replace(`${pathname}?tab=${activeTab}`);
							setActive(activeTab);
							onChangeTabPage(activeTab);
						}}
					>
						<TabPane tab={tMenu('infoBeingProcessed')} key="1">
							<ComboPricingInprocess
								portal={portal}
								disabled={disabled || (portal === 'admin' && !isOwnerProvince)}
								pricingInfo={pricingInfo}
								objectCheck={objectCheck}
							/>
						</TabPane>
						{pricingInfo.hasApproved === 'YES' && (
							<>
								<TabPane tab={tMenu('infoIsApproved')} key="2" forceRender>
									<ComboPricingApproved portal={portal} oldPricingInfo={oldPricingInfo} />
								</TabPane>
								<TabPane tab={tMenu('history')} key="3" forceRender>
									<ComboPricingHistory portal={portal} tabNumber={active} setActive={setActive} />
								</TabPane>
							</>
						)}
					</Tabs>
				</>
			)}
		</>
	);
}
