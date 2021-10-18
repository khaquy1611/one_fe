import { Avatar, Card } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useLng } from 'app/hooks';
import { DX } from 'app/models';
import { getAccessToken } from 'app/models/Base';
import classNames from 'classnames';
import clsx from 'clsx';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const CustomCard = styled(Card)`
	background: #ffffff;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
	border-radius: 16px;

	&:hover {
		cursor: pointer;
		.ant-card-cover {
			img {
				transform: scale(1.2);
			}
		}
	}

	.ant-card-body {
		padding: 0;
		.service-item-wraper {
			min-height: 6em;
			.service-item {
				position: absolute;
				left: 0;
				right: 0;
				padding: 0.75rem 1rem 1.5rem 1rem;
				.service-text {
					width: calc(100% - 50px);
					.service-name {
						font-weight: bold;
						font-size: 16px;
						line-height: 22px;
						color: #333333;
						/* min-height: 2.5em; */
						margin: 0;
					}
					.company-name {
						font-size: 12px;
						line-height: 20px;
						color: #999999;
						margin: 0;
					}
				}
			}
		}
	}
	.ant-card-cover {
		position: relative;
		width: 100%;
		padding-top: 100%; /* 1:1 Aspect Ratio */
		object-fit: cover;
		.ant-avatar {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-bottom: 1px solid #f4f5fa;
			img {
				transition-duration: 0.4s;
				background: #f4f5fa;
				border-radius: 16px;
			}
		}
	}
`;

const INSTALL_STATUS = {
	YES: 'YES',
	NO: 'NO',
	FAIL: 'FAIL',
};

export default function ServiceItem({ ...props }) {
	const { tFilterField } = useLng();
	const { banner, icon, key, serviceName, companyName, urlService, installed, subscriptionId, tab, extLink } = {
		...props,
	};

	const installing = installed === INSTALL_STATUS.NO;
	const history = useHistory();

	function goToApp() {
		if (installing) {
			return;
		}
		if (tab === 'orderService') {
			history.push(DX.sme.createPath(`/account/subscription/${subscriptionId}/detail?tab=2.1`));
			return;
		}
		const accessToken = getAccessToken();
		const character = urlService.indexOf('?') === -1 ? '?' : '&';
		window.open(`${urlService}${character}token=${accessToken}`);
	}
	return (
		<CustomCard
			key={key}
			cover={
				<Avatar
					className={classNames('w-full h-full overflow-hidden rounded-2xl ', { 'opacity-40': installing })}
					src={banner || '/images/NoImageNew.svg'}
					alt={serviceName}
					onClick={goToApp}
				>
					no image
				</Avatar>
			}
			className="text-center border-transparent flex flex-col items-center "
		>
			{installed && (
				<span
					className={clsx('text-white absolute left-4 text-sm top-4 px-2 py-1 rounded-lg', {
						'bg-red-400': installed === INSTALL_STATUS.FAIL,
						'bg-yellow-400': installed === INSTALL_STATUS.NO,
						'bg-green-400': installed === INSTALL_STATUS.YES,
					})}
					type="default"
				>
					{tFilterField('serviceStatus', installed)}
				</span>
			)}
			<div className="service-item-wraper">
				<div className="service-item flex w-full pt-2 text-left gap-4 mb-4 ">
					<Avatar
						className="service-avatar"
						shape="square"
						size={40}
						src={icon || extLink || '/images/NoImageNew.svg'}
						alt={serviceName}
						title={serviceName}
					>
						no image
					</Avatar>
					<div className="flex-1 service-text">
						<Paragraph
							className="service-name"
							ellipsis={{ tooltip: serviceName, rows: 2, expandable: false }}
						>
							{serviceName}
						</Paragraph>
						<Paragraph className="company-name" ellipsis={{ tooltip: companyName, expandable: false }}>
							{companyName}
						</Paragraph>
					</div>
				</div>
			</div>
		</CustomCard>
	);
}
