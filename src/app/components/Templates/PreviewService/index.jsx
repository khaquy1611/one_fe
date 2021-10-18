/* eslint-disable react/forbid-prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-danger */
import { LinkOutlined } from '@ant-design/icons';
import { appSelects } from 'actions';
import { Button, Tabs } from 'antd';
import { useQueryUrl } from 'app/hooks';
import { EmailIcon, LocationIcon, PhoneIcon, UserGroupIcon } from 'app/icons';
import { DX } from 'app/models';
import clsx from 'clsx';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation, useParams, Link } from 'react-router-dom';
import CarouselPreview from './CarouselPreview';
import EvaluateService from './EvaluateService';
import HeaderPreviewService from './HeaderPreviewService';
import ServicePack from './ServicePack';

const SupplyInfo = ({ className, provider, name, icon }) => (
	<div className={`${className}`}>
		<div className="mr-2.5">{icon}</div>
		<div>
			{provider}: <span className="ml-2 font-bold">{name}</span>
		</div>
	</div>
);

export default function PreviewService({
	onRegister,
	onBuyNow,
	className,
	dataService,
	bought,
	dataEvaluate,
	refreshDataEvaluate,
	type,
	funcTrialNow,
	typeScreen = 'SERVICE',
	idPreUrl,
}) {
	const {
		id,
		name,
		category,
		developerName,
		url,
		email,
		phoneNumber,
		description,
		icon,
		video,
		embedIconUrl,
		shortDescription,
		externalLinkIcon,
		externalLinkVideo,
		embedUrl,
		location,
		serviceOwner,
		plans = [],
	} = { ...dataService };
	const isOrderService =
		dataService.serviceOwner === 'OTHER' ||
		dataService.comboOwner === 'OTHER' ||
		dataService.serviceOwner === 'NONE' ||
		dataService.comboOwner === 'NONE';
	const [toggle, setToggle] = useState(false);
	const newPlan = plans.slice();
	const { pathname } = useLocation();
	const history = useHistory();
	const { isMobile } = useSelector(appSelects.selectSetting);
	const queryUrl = useQueryUrl();
	const getTab = queryUrl.get('tab');

	const planSort = newPlan?.sort((a, b) => a.price - b.price);

	const toggleButton = () => setToggle(!toggle);
	const params = useParams();
	const idURL = idPreUrl || parseInt(params.id, 10) || 0;

	useEffect(() => {
		if (description && description?.length < (isMobile ? 400 : 800)) {
			toggleButton();
		}
	}, [description, isMobile]);

	const getIcon = () => {
		if (icon && icon.length > 0 && icon[0].url) {
			return icon[0].url;
		}

		if (typeof icon === 'string') {
			return icon;
		}
		if (externalLinkIcon) {
			return externalLinkIcon;
		}
		return '/images/NoImageNew.svg';
	};
	const InfoApp = {
		id,
		embedIconUrl,
		icon: getIcon(),
		altAvatar: `Avatar service detail ${id}`,
		name,
		developerName,
		shortDescription,
		category,
		location,
		serviceOwner,
		planId: planSort[0]?.id,
		price: planSort && planSort.length > 0 ? DX.formatNumberCurrency(planSort[0]?.price) : '',
		type: planSort && planSort.length > 0 ? planSort[0]?.type : '',
		rate: planSort && planSort.length > 0 ? planSort[0]?.rate : '',
	};

	const ImageArray = (dataService?.snapshots || []).map((item, index) => ({
		urlImg: item.filePath || item.url || item.externalLink || item.embedUrl,
		alt: `This is image ${index + 1} slider`,
	}));

	const InfoSupply = [
		{
			id: 1,
			icon: <UserGroupIcon width="w-4" className="inline-block" />,
			provider: 'Nhà phát hành',
			name: developerName,
		},
		{
			id: 2,
			icon: <EmailIcon width="w-4" className="inline-block" />,
			provider: 'Email hỗ trợ',
			name: email,
		},
		{
			id: 3,
			icon: <PhoneIcon width="w-4" className="inline-block" />,
			provider: 'Số điện thoại hỗ trợ',
			name: phoneNumber,
		},
		{
			id: 4,
			icon: <LocationIcon width="w-4" className="inline-block" />,
			provider: 'Địa chỉ',
			name: location,
		},
	];

	function getVideoUrl() {
		if (isArray(video)) {
			return video[0]?.url;
		}
		if (typeof video === 'string') {
			return video;
		}
		if (video?.filePath) {
			return video?.filePath;
		}
		if (externalLinkVideo) {
			return externalLinkVideo;
		}
		if (embedUrl) {
			return embedUrl;
		}
		return null;
	}
	const { TabPane } = Tabs;

	const videoUrl = getVideoUrl();

	return (
		<div className={`w-full ${className}`}>
			<HeaderPreviewService
				className="mb-12 mt-4 tablet:mb-8"
				info={InfoApp}
				bought={bought}
				category={category}
				onClick={onRegister}
				dataEvaluate={dataEvaluate}
			/>

			<div className="flex -mx-4">
				<div className="px-4 w-full">
					<Tabs
						activeKey={getTab || '1'}
						onChange={(activeTab) => {
							history.replace(`${pathname}?tab=${activeTab}`);
						}}
						className="custom-tab"
					>
						<TabPane tab="Tổng quan" key="1">
							<div className="mx-auto" style={{ width: 770 }}>
								{ImageArray?.length > 0 || videoUrl ? (
									<CarouselPreview
										className="tablet:col-span-2 w-full mb-4 tablet:mb-0"
										imageArray={ImageArray}
										videoUrl={videoUrl}
										name={name}
									/>
								) : (
									<div className="tablet:col-span-2 w-full mb-4 tablet:mb-0" />
								)}

								{url && (
									<div className="mt-10 mobile:mt-16">
										<LinkOutlined />
										<span className="mx-2">URL dịch vụ: </span>
										<a
											title={url}
											href={url}
											target="_blank"
											className="font-bold"
											rel="noreferrer"
										>
											{url}
										</a>
									</div>
								)}
							</div>

							<div className="">
								<h3 className="my-8 font-bold text-xl uppercase text-primary ">Mô tả dịch vụ</h3>
								<div className={clsx('relative', !toggle && 'max-h-72 overflow-hidden ')}>
									<div
										className="font-medium relative"
										dangerouslySetInnerHTML={{
											__html: description,
										}}
									/>
									{!toggle && (
										<div
											style={{
												background:
													'linear-gradient(rgba(252, 252, 253, 0), rgba(252, 252, 253, 0.4), rgba(252, 252, 253, 1))',
											}}
											className="h-16 -mt-16 absolute bottom-0 w-full"
										/>
									)}
								</div>

								{!toggle && (
									<div className="text-center block mt-4">
										<Button type="default" size="small" onClick={toggleButton}>
											Xem thêm
										</Button>
									</div>
								)}
							</div>
						</TabPane>
						{typeScreen === 'SERVICE' && (
							<TabPane tab="Đánh giá" key="2">
								{dataEvaluate && id && (
									<EvaluateService
										dataEvaluate={dataEvaluate}
										allowRating={dataEvaluate?.allowRating}
										serviceId={id}
										refreshDataEvaluate={refreshDataEvaluate}
										type={type}
									/>
								)}
							</TabPane>
						)}
						<TabPane tab="Gói dịch vụ" key="3">
							<ServicePack
								onBuyNow={onBuyNow}
								funcTrialNow={funcTrialNow}
								bought={bought}
								// stopBuying={stopBuying}
								idURL={idURL}
								isOrderService={isOrderService}
								typeScreen={typeScreen}
							/>
						</TabPane>
						<TabPane tab="Hỗ trợ" key="4">
							{InfoSupply?.map((item) => (
								<SupplyInfo
									key={item.id}
									icon={item.icon}
									name={item.name}
									provider={item.provider}
									className="flex mb-4"
								/>
							))}
							<div className="mt-10">
								<Link target="_blank" to className="text-primary font-bold  underline">
									Tài liệu hướng dẫn sử dụng dịch vụ
								</Link>
							</div>
						</TabPane>
						<TabPane tab="Phiên bản" key="5" />
					</Tabs>
				</div>
			</div>
		</div>
	);
}
PreviewService.propTypes = {
	className: PropTypes.string,
	bought: PropTypes.bool.isRequired,
	onBuyNow: PropTypes.func,
	funcTrialNow: PropTypes.func,
	onRegister: PropTypes.func,
	dataService: PropTypes.object,
};
PreviewService.defaultProps = {
	className: '',
	onBuyNow: noop,
	funcTrialNow: noop,
	onRegister: noop,
	dataService: {},
};
