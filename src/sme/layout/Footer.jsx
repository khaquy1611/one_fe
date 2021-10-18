import React from 'react';
import { useLng } from 'app/hooks';
import { FacebookIcon, YoutubeIcon, SMEPortalLogo, PlaceIcon, FooterPhoneIcon } from 'app/icons';
import { Link } from 'react-router-dom';
import { DX } from 'app/models';

export default function Footer() {
	const { tOthers, tMenu } = useLng();
	return (
		<footer className="text-white bg-primary pt-12">
			<div className="flex justify-between items-center mb-8 container mx-auto">
				<SMEPortalLogo width="w-10" />
			</div>
				
			<div className="mb-8 container mx-auto" />

			<div className="flex gap-x-4 mobile:flex-wrap container mx-auto">
				<div className="w-6/12 mobile:w-full">
					<h3 className="text-white font-bold mb-4">{tOthers('footer_authorName')}</h3>

					<p className="mb-2">{tOthers('footer_responsibleForContent')}</p>
					<p className="mb-2">{tOthers('footer_businessRegistrationCertificate')}</p>
					<p className="mb-2">{tOthers('footer_businessRegistrationCertificate_2')}</p>
					<div className="flex mb-4">
						<p className="pt-1">
							<PlaceIcon className="flex-1" />
						</p>
						<p className="mb-0 ml-4">{tOthers('footer_address')}</p>
					</div>
					<div className="flex mb-8">
						<p className="pt-0.5 mb-0">
							<FooterPhoneIcon />
						</p>
						<p className="mb-0 ml-4">{tOthers('footer_callCenter')}</p>
					</div>
				</div>
				<div className="w-1/12"></div>
				<div className="w-2/12 mobile:w-full">
					<h3 className="text-white font-bold mb-4 uppercase">Menu</h3>
					<Link
						title="Trang chủ"
						to={DX.sme.createPath('')}
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						{tMenu('homePage')}
					</Link>
					<br />
					<a
						href="https://onesme.vn/blog/about/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Về chúng tôi
					</a>
					<br />
					<a
						href="https://onesme.vn/blog/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Tin tức - khuyến mại
					</a>
					<br />
					<p className="mb-8">
						<a
							href={`${process.env.REACT_APP_DOCS}/docs/sme/gioi-thieu`}
							target="_blank"
							rel="noreferrer"
							className="text-white"
						>
							Hỗ trợ
						</a>
					</p>
				</div>
				<div className="w-3/12  mobile:w-full">
					<h3 className="text-white font-bold mb-4 uppercase">Điều khoản chung</h3>

					<a
						href="https://onesme.vn/blog/dieu-khoan-dang-ky-dich-vu/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Điều khoản đăng ký dịch vụ
					</a>
					<br />
					<a
						href="https://onesme.vn/blog/chinh-sach-van-chuyen-va-giao-nhan/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Chính sách vận chuyển và giao nhận
					</a>
					<br />
					<a
						href="https://onesme.vn/blog/chinh-sach-bao-mat/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Chính sách bảo mật
					</a>
					<br />
					<a
						href="https://onesme.vn/blog/quy-dinh-thanh-toan/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Quy định thanh toán
					</a>
					<br />
					<a
						href="https://onesme.vn/blog/dieu-khoan-dang-ky-tai-khoan/"
						target="_blank"
						rel="noreferrer"
						className="text-white mb-6 mobile:mb-3 inline-block"
					>
						Điều khoản đăng ký tài khoản
					</a>
				</div>
			</div>

			<div style={{ backgroundColor: 'rgba(30, 45, 120)' }}>
				<div className="container mx-auto flex  justify-between py-4 items-center">
					<p className="mb-0 flex-1">{tOthers('footer_madeByVNPT')}</p>
					<div className="mb-0">
						<a
							title="facebook"
							href="https://www.facebook.com/vinaphonefan"
							target="_blank"
							rel="noreferrer"
						>
							<FacebookIcon className="w-8 inline-block" />
						</a>
						<a
							title="youtube"
							href="https://www.youtube.com/channel/UCCrkSbaFcot6hcLOuNADX8Q"
							target="_blank"
							rel="noreferrer"
						>
							<YoutubeIcon className="w-8 inline-block ml-3" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
