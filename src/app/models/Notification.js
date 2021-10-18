import Base from './Base';
import DX from './DX';

const pathRole = {
	[DX.admin.role]: 'admin',
	[DX.dev.role]: 'dev',
	[DX.sme.role]: 'sme',
};

class Notice extends Base {
	getNoticeToAdmin = (role, { page = 0, size = 10 }) =>
		this.apiGet(`/${pathRole[role]}-portal/notif`, {
			page,
			size,
		});

	getCountNoticeToAdmin = (role) => this.apiGet(`/${pathRole[role]}-portal/notif/count`);

	getConfigNoticeToAdmin = (role, { page = 0, size = 10 }) =>
		this.apiGet(`/${pathRole[role]}-portal/notif/config?`, {
			page,
			size,
		});

	reqToken = (deviceToken) => this.apiPost(`/portal/notif/register-device`, { deviceToken });

	updateConfigNoticeToAdmin = (id, config) => this.apiPut(`/admin-portal/notif/config/${id}`, config);

	updatePortalTypeNotice = (portalType) => this.apiPut(`/portal/notif/status/${portalType}`);

	updateUnreadStatus = (id) => this.apiPut(`/portal/notif/${id}`);

	getEmailConfig = async (code) => {
		const res = await this.apiGetWithoutPrefix(`/api/admin-portal/email-template/find-by-code/${code}`);
		// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// await timeout(3000);
		// const res = {
		// 	data: [
		// 		{
		// 			id: 1,
		// 			code: 'AC-01',
		// 			name: 'Admin tạo tài khoản nhóm Admin',
		// 			title: 'Tạo tài khoản thành công',
		// 			status: 1,
		// 			contentHtml: `
		// 						<!DOCTYPE html>
		// 						<html>
		// 						<head>
		// 							<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
		// 							<link rel="preconnect" href="https://fonts.googleapis.com">
		// 							<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

		// 						</head>
		// 						<body style="padding: 40px;margin: 0 auto;max-width: 600px;background-color: #F8F8F8;font-family: &quot;Montserrat&quot;, Helvetica, sans-serif;">
		// 							<div class="container" style="background-color: #FFFFFF;">
		// 								<div class="logo-container" style="height: 80px;display: flex;justify-content: center;align-items: center;box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.1);">
		// 									<div class="logo" style="flex-basis: 50%;text-align: left;margin-left: 40px;">
		// 										<img src="$IMG_PATH/resources/upload/file/mail/images/oneSME_Logo.png" alt="OneSME Logo">
		// 									</div>
		// 									<div class="homepage" style="flex-basis: 50%;text-align: right;margin-right: 40px;">
		// 										<span style="font-size: 14px;font-weight: 500;"><a href="https://www.onesme.vn/" target="_blank" style="text-decoration: none;color: #1B74E8;">www.onesme.vn</a></span>
		// 									</div>
		// 								</div>
		// 								<div class="content-container" style="padding: 40px;">

		// 									<div class="title-container" style="text-align: center;padding: 40px 0 60px;">
		// 										<img class="title-icon" src="$IMG_PATH/resources/upload/file/mail/images/icon_ac.png" alt="Tài khoản">
		// 										<p class="main-title" style="margin: 0;line-height: 28px;font-size: 20px;font-weight: 700;color: #2C3D94;text-transform: uppercase;margin-top: 30px;">Tạo tài khoản thành công</p>
		// 									</div>
		// 									<div class="main-content" style="line-height: 22px;font-size: 14px;letter-spacing: .3px;">
		// 										<p class="mb-m" style="margin: 0;margin-bottom: 20px;">Xin chào <span>$USER</span>,</p>
		// 										<p style="margin: 0;">Cám ơn <span>$USER</span> đã đăng ký tài khoản nền tảng oneSME.</p>
		// 										<p style="margin: 0;">Chúc mừng bạn đã đăng ký thành công!</p>
		// 										<p style="margin: 0;">Mật khẩu đăng nhập của bạn là: <span>$USER_PWD</span></p>
		// 										<p class="mt-m" style="margin: 0;margin-top: 20px;">Trân trọng,</p>
		// 										<p style="margin: 0;">Đội ngũ phát triển nền tảng oneSME</p>
		// 									</div>
		// 								</div>
		// 								<div class="footer-container" style="padding: 40px;">
		// 								${Math.random()}<br/>
		// 									<div class="social-links" style="text-align: center;">
		// 										<a class="social-item" href="https://www.google.com.vn/" target="_blank" style="text-decoration: none;margin-right: 5px;"><img src="$IMG_PATH/resources/upload/file/mail/images/Facebook_white.png"></a>
		// 										<a class="social-item" href="https://www.google.com.vn/" target="_blank" style="text-decoration: none;margin-right: 5px;margin: 0;"><img src="$IMG_PATH/resources/upload/file/mail/images/Youtube_white.png"></a>
		// 									</div>
		// 									<div class="company-name" style="text-align: center;color: #2C3D94;font-weight: 700;font-size: 14px;margin: 10px 0 20px;">
		// 										Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)
		// 									</div>
		// 									<div class="company-info">
		// 										<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">Hotline: $HOTLINE</p>
		// 										<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">Tòa nhà VNPT, số 57 Huỳnh Thúc Kháng, Phường Láng Hạ, Quận Đống Đa, Thành phố Hà Nội, Việt Nam</p>
		// 										<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">© Bản Quyền thuộc Tập đoàn Bưu chính Viễn thông Việt Nam</p>
		// 									</div>
		// 								</div>
		// 							</div>
		// 						</body>
		// 						</html>
		// 			`,
		// 			contentHtmlDefault: `
		// 								<!DOCTYPE html>
		// 								<html>
		// 								<head>
		// 									<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
		// 									<link rel="preconnect" href="https://fonts.googleapis.com">
		// 									<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

		// 								</head>
		// 								<body style="padding: 40px;margin: 0 auto;max-width: 600px;background-color: #F8F8F8;font-family: &quot;Montserrat&quot;, Helvetica, sans-serif;">
		// 									<div class="container" style="background-color: #FFFFFF;">
		// 										<div class="logo-container" style="height: 80px;display: flex;justify-content: center;align-items: center;box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.1);">
		// 											<div class="logo" style="flex-basis: 50%;text-align: left;margin-left: 40px;">
		// 												<img src="$IMG_PATH/resources/upload/file/mail/images/oneSME_Logo.png" alt="OneSME Logo">
		// 											</div>
		// 											<div class="homepage" style="flex-basis: 50%;text-align: right;margin-right: 40px;">
		// 												<span style="font-size: 14px;font-weight: 500;"><a href="https://www.onesme.vn/" target="_blank" style="text-decoration: none;color: #1B74E8;">www.onesme.vn</a></span>
		// 											</div>
		// 										</div>
		// 										<div class="content-container" style="padding: 40px;">
		// 											HIHI
		// 										</div>
		// 										<div class="footer-container" style="padding: 40px;">
		// 											<div class="social-links" style="text-align: center;">
		// 												<a class="social-item" href="https://www.google.com.vn/" target="_blank" style="text-decoration: none;margin-right: 5px;"><img src="$IMG_PATH/resources/upload/file/mail/images/Facebook_white.png"></a>
		// 												<a class="social-item" href="https://www.google.com.vn/" target="_blank" style="text-decoration: none;margin-right: 5px;margin: 0;"><img src="$IMG_PATH/resources/upload/file/mail/images/Youtube_white.png"></a>
		// 											</div>
		// 											<div class="company-name" style="text-align: center;color: #2C3D94;font-weight: 700;font-size: 14px;margin: 10px 0 20px;">
		// 												Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)
		// 											</div>
		// 											<div class="company-info">
		// 												<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">Hotline: $HOTLINE</p>
		// 												<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">Tòa nhà VNPT, số 57 Huỳnh Thúc Kháng, Phường Láng Hạ, Quận Đống Đa, Thành phố Hà Nội, Việt Nam</p>
		// 												<p style="margin: 10px 0;line-height: 16px;font-size: 10px;text-align: center;">© Bản Quyền thuộc Tập đoàn Bưu chính Viễn thông Việt Nam</p>
		// 											</div>
		// 										</div>
		// 									</div>
		// 								</body>
		// 								</html>

		// 			`,
		// 			contentText: '',
		// 			parentCode: 'AC',
		// 		},
		// 	],
		// };
		// return res.data?.length > 0 ? res.data[0] : null;
		return res;
	};

	getEmailParameter = async (code) => {
		// const res = await this.apiGetWithoutPrefix(`/api/admin-portal/param-email/all?mailTemplateCode=${code}`);
		const res = await this.apiGetWithoutPrefix(`/api/admin-portal/param-email/find-by-code/${code}`);

		// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// await timeout(3000);
		// const res = {
		// 	content: [
		// 		{
		// 			name: 'Quản lý tài khoản',
		// 			description: '',
		// 			datas: [
		// 				{
		// 					name: '$USER',
		// 					description: 'Thông tin người dùng',
		// 					default: ` `,
		// 				},
		// 				{
		// 					name: '$USERNAME',
		// 					description: 'Tài khoản đăng nhâp người dùng',
		// 					default: ` 	`,
		// 				},
		// 				{
		// 					name: '$PASSWORD',
		// 					description: 'Mật khẩu',
		// 					default: '',
		// 				},
		// 			],
		// 		},
		// 		{
		// 			name: 'Quản lý phiếu hỗ trợ',
		// 			description: '',
		// 			datas: [
		// 				{
		// 					name: '$TICKETNAME',
		// 					description: 'Tên phiếu hỗ trợ',
		// 					default: '',
		// 				},
		// 				{
		// 					name: '$SERVICENAME',
		// 					description: 'Tên dịch vụ',
		// 					default: '',
		// 				},
		// 			],
		// 		},
		// 	],
		// };
		return res;
	};

	fillEmailParam = async (data) => {
		const res = await this.apiPostWithoutPrefix(`/api/admin-portal/email-template/fill-param`, data);
		// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// await timeout(3000);
		// const res = {
		// 	data: {
		// 		content: contentHtml,
		// 	},
		// };
		return res;
	};

	updateEmail = async (data) => {
		const res = await this.apiPutWithoutPrefix(`/api/admin-portal/email-template`, data);
		// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// await timeout(3000);
		// const res = {
		// 	...data,
		// };
		return res;
	};

	sendTestEmail = async (data) => {
		const res = await this.apiPostWithoutPrefix(`/api/admin-portal/email-template/mail-simulator`, data);
		// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// await timeout(3000);
		// const res = {
		// 	...data,
		// };
		return res;
	};
}
export default new Notice('');
