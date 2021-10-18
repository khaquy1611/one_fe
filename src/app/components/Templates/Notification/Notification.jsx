/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import PropTypes from 'prop-types';
import { useLng } from 'app/hooks';
import { Avatar, Modal, Skeleton, Switch } from 'antd';
import { BellIcon } from 'app/icons';
import styled from 'styled-components';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import { noop } from 'opLodash';
import { LockOutlined } from '@ant-design/icons';

const Div = styled.div``;
function Notification({
	isFetching,
	page,
	setPage,
	noticeData,
	hasMore,
	canReceiveNotify,
	changeNotice,
	getIconNotify,
}) {
	const { tMenu, tMessage, tLowerField } = useLng();
	return (
		<div className="py-0 absolute -right-4 flex flex-col rounded-lg bg-white shadow-card pb-5" mode="horizontal">
			<div className="border-b px-4 bg-white z-10 rounded-t-lg">
				<p className="font-semibold py-4 text-base">{tMenu('notification')}</p>
			</div>

			<div
				id="notify-scrollableTarget"
				className="beauty-scroll overflow-y-auto mr-1 w-98 pl-2 pr-2"
				style={{
					height: '50vh',
					overflow: 'auto',
				}}
			>
				<InfiniteScroll
					dataLength={noticeData.length}
					next={() => setPage(page + 1)}
					hasMore={!isFetching && hasMore}
					scrollableTarget="notify-scrollableTarget"
				>
					{noticeData.map((item) => (
						<div
							key={item.id}
							className="w-full mb-2"
							onClickCapture={() => {
								changeNotice(item);
							}}
						>
							<span
								className={classNames(
									'font-semibold  flex text-sm pb-2 px-4 pt-3 cursor-pointer rounded-md hover:bg-gray-250 transition duration-300 ease-in-out',
									{
										'bg-blue-250': !parseInt(item.status, 10),
									},
								)}
							>
								<div className="flex-none ">{getIconNotify(item.screenId)}</div>

								<div
									// item.status = true <=> chưa đọc
									className="flex-1 ml-2"
								>
									<p className="truncate  mb-2">{item.title}</p>
									<p className="font-normal line-clamp-1 w-full  text-sm mb-2">{item.content}</p>
									<p className=" font-normal text-xs mb-1">{item.timeNotif}</p>
								</div>
							</span>
						</div>
					))}

					{noticeData.length === 0 && (
						<div className="flex items-center justify-center" style={{ height: '50vh' }}>
							<p className="text-base">{tMenu('none_notification')}</p>
						</div>
					)}

					{isFetching && (
						<Div className="w-full">
							<Skeleton className="px-4 pb-2 pt-3" avatar active />
							<Skeleton className="px-4 pb-2 pt-3" avatar active />
						</Div>
					)}
				</InfiniteScroll>
			</div>
			{!canReceiveNotify && (
				<div className="flex mx-4 mt-4 justify-between">
					<span className="font-semibold">{tMenu('on_browser_notification')}</span>
					<Switch
						checked={canReceiveNotify}
						onClick={() => {
							Modal.info({
								title: tMessage('onNotificationDX'),
								width: 500,
								content: (
									<div className="mt-4">
										<div className="flex mb-2 items-center">
											<Avatar className="w-6 h-6 flex items-center justify-center mr-2">1</Avatar>
											<p>
												{tMenu('select')} <LockOutlined className="mx-1 text-black" />{' '}
												{tLowerField('inBrowserAddress')}
											</p>
										</div>
										<div className="flex items-center">
											<Avatar className="w-6 h-6 flex items-center justify-center mr-2">2</Avatar>
											<p className="flex">
												{tMenu('find')} <BellIcon width="w-4" className="mx-1 text-black" />
												<span className="font-semibold text-gray-900 mr-1">
													{tMenu('notification')}
												</span>
												{tLowerField('and')}
												<span className="italic mx-1">{tMenu('allow')}</span>
											</p>
										</div>
									</div>
								),
							});
						}}
					/>
				</div>
			)}
		</div>
	);
}
Notification.propTypes = {
	isFetching: PropTypes.bool.isRequired,
	page: PropTypes.number.isRequired,
	setPage: PropTypes.func,
	noticeData: PropTypes.arrayOf(PropTypes.object),
	hasMore: PropTypes.bool.isRequired,
	canReceiveNotify: PropTypes.bool,
	changeNotice: PropTypes.func,
	getIconNotify: PropTypes.func,
};
Notification.defaultProps = {
	setPage: noop,
	noticeData: [],
	canReceiveNotify: false,
	changeNotice: noop,
	getIconNotify: noop,
};
export default Notification;
