import Flicking from '@egjs/react-flicking';
import { Button } from 'antd';
import { useFlicking, useLng, useUser } from 'app/hooks';
import { DX } from 'app/models';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import banner0 from 'app/icons/banner_0.png';
import banner0mb from 'app/icons/banner_0_mb.png';
import banner02 from 'app/icons/banner02.png';
import banner02mb from 'app/icons/banner02_mb.png';
import banner03 from 'app/icons/banner03.png';
import banner03mb from 'app/icons/banner03_mb.png';
import { AutoPlay } from '@egjs/flicking-plugins';

import '@egjs/flicking-plugins/dist/flicking-plugins.css';
import { useSelector } from 'react-redux';
import { appSelects } from 'app/appReducer';

const Banner = ({ className }) => {
	const { tButton } = useLng();
	const { user } = useUser();
	const haveUser = user && user.id;
	const { settings, renderPagination } = useFlicking();
	const plugins = useMemo(() => [new AutoPlay({ duration: 3000, direction: 'NEXT', stopOnHover: true })], []);
	const { isMobile } = useSelector(appSelects.selectSetting);
	return (
		<div className={`w-full relative flex items-center  ${className}`}>
			<div className="container mobile:max-w-full mobile:w-full mx-auto  text-primary relative">
				<Flicking {...settings} circular plugins={plugins} duration={700}>
					<div className="w-full" key={1}>
						<div>
							<img
								title="Khai trương nền tảng chuyển đổi số cho doanh nghiệp SME"
								src={isMobile ? banner0mb : banner0}
								alt="bg"
								className="w-full"
							/>
						</div>
					</div>
					<div className="w-full" key={2}>
						<div>
							<img
								title="oneSME - Chia sẻ an toàn Kết nối dữ liệu giữa các Sản phẩm dịch vụ"
								src={isMobile ? banner02mb : banner02}
								alt="bg"
								className="w-full"
							/>
						</div>
					</div>
					<div className="w-full flex justify-end mobile:block" key={3}>
						<div className="w-full flex">
							<img
								title="oneSME - Giải pháp Chuyển  đổi số toàn diện đầu tiên tại Việt Nam"
								src={isMobile ? banner03mb : banner03}
								alt="bg2"
								className="w-full self-center"
							/>
						</div>
					</div>
				</Flicking>
				<div className="text-center">{renderPagination(3)}</div>

				{!haveUser && (
					<div className="pt-6 hidden mobile:block text-center">
						<Link to={DX.sme.createPath('/register')}>
							<Button type="primary" className="py-0">
								{tButton('registerNow')}
							</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default Banner;
