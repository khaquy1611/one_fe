import { trim, isEqual } from 'opLodash';
import FileSaver from 'file-saver';
import moment from 'moment';
import { message } from 'antd';
import Portal from './Portal';

class DX {
	SUPER_ADMIN_ROLE = 1;

	ADMIN_ROLE = 2;

	SME_ROLE = 3;

	DEV_ADMIN_ROLE = 4;

	CSKH_ROLE = 5;

	SME_EMPLOYEE = 6;

	DEVELOPER_OPERATOR = 7;

	DEVELOPER_BUSINESS = 8;

	GUEST_ROLE = 0;

	SYSTEM_ROLES = [
		this.SUPER_ADMIN_ROLE,
		this.ADMIN_ROLE,
		this.SME_ROLE,
		this.DEV_ADMIN_ROLE,
		this.CSKH_ROLE,
		this.SME_EMPLOYEE,
		this.DEVELOPER_OPERATOR,
		this.DEVELOPER_BUSINESS,
	];

	ADMIN_ROLES = [this.SUPER_ADMIN_ROLE, this.ADMIN_ROLE, this.CSKH_ROLE];

	DEV_ROLES = [this.DEV_ADMIN_ROLE, this.DEVELOPER_OPERATOR, this.DEVELOPER_BUSINESS];

	SME_ROLES = [this.SME_ROLE, this.SME_EMPLOYEE];

	app = new Portal(this.GUEST_ROLE, '', 'guest', [this.GUEST_ROLE]);

	sme = new Portal(this.SME_ROLE, '/sme-portal', 'SME', [this.SME_ROLE, 6]);

	dev = new Portal(this.DEV_ADMIN_ROLE, '/dev-portal', 'developer', [
		this.DEV_ADMIN_ROLE,
		this.DEVELOPER_OPERATOR,
		this.DEVELOPER_BUSINESS,
	]);

	admin = new Portal(this.SUPER_ADMIN_ROLE, '/admin-portal', 'admin', [
		this.SUPER_ADMIN_ROLE,
		this.ADMIN_ROLE,
		this.CSKH_ROLE,
	]);

	suggestPass =
		'Mật khẩu phải có từ 8-16 ký tự, bao gồm ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 chữ số và 1 ký tự đặc biệt trong !@#$%^&*+=';

	canAccessPortal = (userData, portal) => {
		switch (portal) {
			case 'sme':
				return this.sme.canAccessPortal(userData);
			case 'dev':
				return this.dev.canAccessPortal(userData);
			case 'admin':
				return this.admin.canAccessPortal(userData);

			default:
				return false;
		}
	};

	getPortalByPath(path) {
		if (path.startsWith(this.sme.path)) {
			return this.sme;
		}
		if (path.startsWith(this.dev.path)) {
			return this.dev;
		}
		if (path.startsWith(this.admin.path)) {
			return this.admin;
		}
		return this.app;
	}

	getPortal(role) {
		if (this.sme.roles.includes(role)) {
			return this.sme;
		}
		if (this.dev.roles.includes(role)) {
			return this.dev;
		}
		if (this.admin.roles.includes(role)) {
			return this.admin;
		}
		return this.app;
	}

	createPath = (role) => (link) => {
		const portal = this.getPortal(role);
		return portal.createPath(link);
	};

	getRoleName = (role) => {
		const portal = this.getPortal(role);
		return portal.roleName;
	};

	formatTime = (timestamp, formatServer = 'DD/MM/YYYY HH:mm:ss', format = 'DD/MM/YYYY HH:mm:ss') =>
		timestamp ? moment(timestamp, formatServer).format(format) : '';

	formatDate = (timestamp, formatServer = 'DD/MM/YYYY', format = 'DD/MM/YYYY') =>
		timestamp ? moment(timestamp, formatServer).format(format) : '';

	formatTimestamp = (timestamp, format = 'DD/MM/YYYY') => (timestamp ? moment(timestamp).format(format) : '');

	getError = (e) => JSON.parse(e.message);

	formatNumberCurrency = (value, type) => {
		if (trim(value)) {
			const str = trim(value.toString());
			if (parseInt(str, 10) < 0) return typeof type === 'string' ? '0' : 0;
			const index = str.indexOf('.');
			if (index > 0) {
				let wholePart = parseInt(str.substring(0, index), 10);
				const decimalPart =
					index + 4 <= str.length
						? parseInt(str.substring(index + 1, index + 3), 10)
						: parseInt(str.substring(index + 1), 10);

				if (decimalPart.toString().length === 1 && decimalPart >= 5) wholePart += 1;
				else if (decimalPart >= 50) wholePart += 1;

				return type === 'int' ? wholePart : wholePart.toLocaleString('it-IT');
			}
			const c = parseInt(str, 10).toLocaleString('it-IT');
			return type === 'int' ? parseInt(str, 10) : c;
		}
		return typeof type === 'string' ? null : 0;
	};

	formatNumber = (value, type) => {
		let valueFormat = null;
		if (type === 'float') {
			valueFormat = parseFloat(trim(value.toString()).replaceAll(',', '.'));
		} else {
			valueFormat = parseInt(trim(value.toString()).replaceAll(/\D/g, ''), 10);
		}
		return valueFormat || 0;
	};

	formatTaxCode = (mainString, insString, pos) => mainString.slice(0, pos) + insString + mainString.slice(pos);

	callFormatTaxCode = (mainString) => mainString;
	//  {
	// 	if (mainString && mainString.charAt(2) !== ' ' && mainString.charAt(10) !== ' ') {
	// 		if (mainString.length === 10) {
	// 			const position = [2, 10];
	// 			position.map((pos) => {
	// 				mainString = this.formatTaxCode(mainString, ' ', pos);
	// 				return mainString;
	// 			});
	// 		}

	// 		if (mainString.length === 13 && mainString.charAt(12) !== ' ') {
	// 			const position = [2, 10, 12];
	// 			position.map((pos) => {
	// 				mainString = this.formatTaxCode(mainString, ' ', pos);
	// 				return mainString;
	// 			});
	// 		}
	// 	}

	// 	return mainString;
	// };

	featureRoles = {
		'sme/show_convert_role': {
			[this.SME_ROLE]: true,
		},
		'dev/show_convert_role': {
			[this.DEV_ADMIN_ROLE]: true,
		},
		// 'admin/show-tag-status': {
		// 	[this.SUPER_ADMIN_ROLE]: true,
		// 	[this.ADMIN_ROLE]: true,
		// 	[this.CSKH_ROLE]: true,
		// },
		// 'dev/fullRole': {
		// 	[this.DEVELOPER_BUSINESS]: true,
		// 	[this.DEVELOPER_OPERATOR]: true,
		// 	[this.DEV_ADMIN_ROLE]: true,
		// },
	};

	canAccessFuture = (featureCode, roles) => {
		const feature = this.featureRoles[featureCode];
		return feature && roles.find((role) => feature[role]);
	};

	// provinceIdUser, provinceIdUser đều null 	=> true là dữ liệu admin tổng
	// provinceIdUser, provinceIdUser cùng id 	=> true là dữ liệu admin cùng tỉnh
	// provinceIdUser, provinceIdUser khác 		=> false là dữ liệu admin không cùng tỉnh / kp của admin tổng
	checkIsOwnerProvince = (provinceIdUser, provinceIdCheck) => {
		const check =
			(!provinceIdUser && !provinceIdCheck) ||
			(typeof provinceIdUser === 'number' && provinceIdUser === provinceIdCheck);
		return check;
	};

	featurePermission = {
		// #region Admin portal
		// #region 1. Quản lý cấu hình
		'admin/view-system-config': {
			name: 'Xem cấu hình hệ thống',
			code: 'XEM_CAU_HINH_HE_THONG_1',
			allowAll: false,
		},
		'admin/update-system-config': {
			name: 'Cập nhật cấu hình hệ thống',
			code: 'CAP_NHAT_CAU_HINH_HE_THONG_1',
			allowAll: false,
		},
		'admin/list-service-category': {
			name: 'Xem danh mục dịch vụ',
			code: 'XEM_DANH_MUC_DICH_VU_1',
			allowAll: false,
		},
		'admin/update-service-category': {
			name: 'Cập nhật danh mục dịch vụ',
			code: 'CAP_NHAT_DANH_MUC_DICH_VU_1',
			allowAll: false,
		},
		'admin/list-currency-category': {
			name: 'Xem danh mục tiền tệ',
			code: 'XEM_DANH_MUC_TIEN_TE_1',
			allowAll: false,
		},
		'admin/update-currency-category': {
			name: 'Cập nhật danh mục tiền tệ',
			code: 'CAP_NHAT_DANH_MUC_TIEN_TE_1',
			allowAll: false,
		},
		'admin/list-tax-category': {
			name: 'Xem danh mục thuế',
			code: 'XEM_DANH_MUC_THUE_1',
			allowAll: false,
		},
		'admin/update-tax-category': {
			name: 'Cập nhật danh mục thuế',
			code: 'CAP_NHAT_DANH_MUC_THUE_1',
			allowAll: false,
		},
		'admin/list-unit-category': {
			name: 'Xem danh mục đơn vị tính',
			code: 'XEM_DANH_MUC_DON_VI_TINH_1',
			allowAll: false,
		},
		'admin/update-unit-category': {
			name: 'Cập nhật danh mục đơn vị tính',
			code: 'CAP_NHAT_DANH_MUC_DON_VI_TINH_1',
			allowAll: false,
		},
		'admin/view-notification-config': {
			name: 'Xem cấu hình thông báo',
			code: 'XEM_CAU_HINH_THONG_BAO_1',
			allowAll: false,
		},
		'admin/update-notification-config': {
			name: 'Cập nhật cấu hình thông báo',
			code: 'CAP_NHAT_CAU_HINH_THONG_BAO_1',
			allowAll: false,
		},
		'admin/view-notification': {
			name: 'Xem danh sách thông báo',
			code: 'XEM_DANH_SACH_THONG_BAO',
			allowAll: false,
		},
		'admin/detail-notification': {
			name: 'Xem chi tiết thông báo',
			code: 'XEM_CHI_TIET_THONG_BAO',
			allowAll: false,
		},
		'admin/view-email-template': {
			name: 'Xem template email',
			code: 'XEM_EMAIL_TEMPLATE',
			allowAll: false,
		},
		'admin/update-email-template': {
			name: 'Cập nhật template email',
			code: 'CAP_NHAT_EMAIL_TEMPLATE',
			allowAll: false,
		},
		// #endregion
		// #region 2. Quản lý vai trò

		'admin/list-admin-role': {
			name: 'Xem danh sách vai trò Admin',
			code: 'XEM_DANH_SACH_VAI_TRO_ADMIN_1',
			allowAll: false,
		},
		'admin/view-admin-role': {
			name: 'Xem chi tiết vai trò Admin',
			code: 'XEM_CHI_TIET_VAI_TRO_ADMIN_1',
			allowAll: false,
		},
		'admin/update-admin-role': {
			name: 'Cập nhật vai trò Admin',
			code: 'CAP_NHAT_VAI_TRO_ADMIN_1',
			allowAll: false,
		},
		'admin/list-dev-role': {
			name: 'Xem danh sách vai trò Developer',
			code: 'XEM_DANH_SACH_VAI_TRO_DEVELOPER_1',
			allowAll: false,
		},
		'admin/view-dev-role': {
			name: 'Xem chi tiết vai trò Developer',
			code: 'XEM_CHI_TIET_VAI_TRO_DEVELOPER_1',
			allowAll: false,
		},
		'admin/update-dev-role': {
			name: 'Cập nhật vai trò Developer',
			code: 'CAP_NHAT_VAI_TRO_DEVELOPER_1',
			allowAll: false,
		},
		'admin/list-sme-role': {
			name: 'Xem danh sách vai trò SME',
			code: 'XEM_DANH_SACH_VAI_TRO_SME_1',
			allowAll: false,
		},
		'admin/view-sme-role': {
			name: 'Xem chi tiết vai trò SME',
			code: 'XEM_CHI_TIET_VAI_TRO_SME_1',
			allowAll: false,
		},
		'admin/update-sme-role': {
			name: 'Cập nhật vai trò SME',
			code: 'CAP_NHAT_VAI_TRO_SME_1',
			allowAll: false,
		},
		// #endregion
		// #region 3. Quản lý tài khoản
		'admin/list-admin-account': {
			name: 'Xem danh sách tài khoản Admin',
			code: 'XEM_DANH_SACH_TAI_KHOAN_ADMIN_1',
			allowAll: false,
		},
		'admin/create-admin-account': {
			name: 'Tạo tài khoản Admin',
			code: 'TAO_TAI_KHOAN_ADMIN_1',
			allowAll: false,
		},
		'admin/update-admin-account': {
			name: 'Cập nhật tài khoản Admin',
			code: 'CAP_NHAT_TAI_KHOAN_ADMIN_1',
			allowAll: false,
		},
		'admin/change-status-admin-account': {
			name: 'Bật/ Tắt tài khoản Admin',
			code: 'BAT_TAT_TAI_KHOAN_ADMIN_1',
			allowAll: false,
		},
		'admin/list-customer-account': {
			name: 'Xem danh sách doanh nghiệp',
			code: 'XEM_DANH_SACH_DOANH_NGHIEP_1',
			allowAll: false,
		},
		'admin/update-customer-account': {
			name: 'Cập nhật thông tin doanh nghiệp',
			code: 'CAP_NHAT_THONG_TIN_DOANH_NGHIEP_1',
			allowAll: false,
		},
		'admin/change-status-customer-account': {
			name: 'Bật/tắt doanh nghiệp',
			code: 'BAT_TAT_DOANH_NGHIEP_1',
			allowAll: false,
		},
		'admin/list-department': {
			name: 'Xem danh sách phòng ban',
			code: 'XEM_DANH_SACH_PHONG_BAN_1',
			allowAll: false,
		},
		'admin/view-department': {
			name: 'Xem chi tiết phòng ban',
			code: 'XEM_CHI_TIET_PHONG_BAN_1',
			allowAll: false,
		},
		'admin/update-department': {
			name: 'Cập nhật phòng ban',
			code: 'CAP_NHAT_PHONG_BAN_1',
			allowAll: false,
		},
		// #endregion
		// #region 4. Quản lý phiếu hỗ trợ
		'admin/list-ticket': {
			name: 'Xem danh sách phiếu hỗ trợ',
			code: 'XEM_DANH_SACH_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'admin/view-ticket': {
			name: 'Xem chi tiết phiếu hỗ trợ',
			code: 'XEM_CHI_TIET_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'admin/close-ticket': {
			name: 'Đóng phiếu hỗ trợ với mọi trạng thái',
			code: 'DONG_PHIEU_HO_TRO_VOI_MOI_TRANG_THAI_1',
			allowAll: false,
		},
		'admin/assign-ticket': {
			name: 'Phân công người xử lý',
			code: 'PHAN_CONG_NGUOI_XU_LY_1',
			allowAll: false,
		},
		'admin/response-ticket': {
			name: 'Tạo phản hồi',
			code: 'TAO_PHAN_HOI_1',
			allowAll: false,
		},
		'admin/edit-own-response-ticket': {
			name: 'Sửa phản hồi tự tạo',
			code: 'SUA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		'admin/delete-own-response-ticket': {
			name: 'Xóa phản hồi tự tạo',
			code: 'XOA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		'admin/delete-other-response-ticket': {
			name: 'Xóa phản hồi của tài khoản khác',
			code: 'XOA_PHAN_HOI_CUA_TAI_KHOAN_KHAC_1',
			allowAll: false,
		},
		// #endregion
		// #region 5. Quản lý dịch vụ
		'admin/list-service': {
			name: 'Xem danh sách dịch vụ',
			code: 'XEM_DANH_SACH_DICH_VU_1',
			allowAll: false,
		},
		'admin/view-service': {
			name: 'Xem chi tiết dịch vụ',
			code: 'XEM_CHI_TIET_DICH_VU_1',
			allowAll: false,
		},
		'admin/approved-service': {
			name: 'Phê duyệt dịch vụ',
			code: 'PHE_DUYET_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 6. Quản lý gói dịch vụ
		'admin/list-service-pack': {
			name: 'Xem danh sách gói dịch vụ',
			code: 'XEM_DANH_SACH_GOI_DICH_VU_1',
			allowAll: false,
		},
		'admin/view-service-pack': {
			name: 'Xem chi tiết gói dịch vụ',
			code: 'XEM_CHI_TIET_GOI_DICH_VU_1',
			allowAll: false,
		},
		'admin/approved-service-pack': {
			name: 'Phê duyệt gói dịch vụ',
			code: 'PHE_DUYET_GOI_DICH_VU_1',
			allowAll: false,
		},
		// 'admin/change-position-service-pack': {
		// 	// TODO: Chức năng chưa có
		// 	name: 'Thay đổi vị trí gói dịch vụ',
		// 	code: 'THAY_DOI_VI_TRI_GOI_DICH_VU_1',
		// 	allowAll: false,
		// },
		// 'admin/set-recommend-service-pack': {
		// 	// TODO Chức năng chưa có
		// 	name: 'Thiết lập gói khuyên dùng',
		// 	code: 'THIET_LAP_GOI_KHUYEN_DUNG_1',
		// 	allowAll: false,
		// },
		// #endregion
		// #region 7. Quản lý dịch vụ bổ sung
		'admin/list-addon': {
			name: 'Xem danh sách dịch vụ bổ sung',
			code: 'XEM_DANH_SACH_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		'admin/delete-addon': {
			name: 'Xóa dịch vụ bổ sung',
			code: 'XOA_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		'admin/change-status-addon-by-admin': {
			name: 'Bật/tắt trạng thái hoạt động của dịch vụ bổ sung do nhà quản trị tạo',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_DICH_VU_BO_SUNG_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/create-addon': {
			name: 'Tạo dịch vụ bổ sung',
			code: 'TAO_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		'admin/request-approved-addon-by-admin': {
			name: 'Yêu cầu phê duyệt dịch vụ bổ sung do nhà quản trị tạo',
			code: 'YEU_CAU_PHE_DUYET_DICH_VU_BO_SUNG_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/update-addon-by-admin': {
			name: 'Cập nhật dịch vụ bổ sung do nhà quản trị tạo',
			code: 'CAP_NHAT_DICH_VU_BO_SUNG_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/view-addon': {
			name: 'Xem chi tiết dịch vụ bổ sung',
			code: 'XEM_CHI_TIET_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		'admin/approved-addon': {
			name: 'Phê duyệt dịch vụ bổ sung',
			code: 'PHE_DUYET_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		// #endregion
		// #region 8. Quản lý chương trình khuyến mại
		'admin/list-coupon': {
			name: 'Xem danh sách chương trình khuyến mại',
			code: 'XEM_DANH_SACH_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		'admin/delete-coupon': {
			name: 'Xóa chương trình khuyến mại',
			code: 'XOA_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		'admin/change-status-coupon-by-admin': {
			name: 'Bật/tắt trạng thái hoạt động của chương trình khuyến mại do nhà quản trị tạo',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/create-coupon': {
			name: 'Tạo chương trình khuyến mại',
			code: 'TAO_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		'admin/request-approved-coupon-by-admin': {
			name: 'Yêu cầu phê duyệt chương trình khuyến mại do nhà quản trị tạo',
			code: 'YEU_CAU_PHE_DUYET_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/update-coupon-by-admin': {
			name: 'Cập nhật chương trình khuyến mại do nhà quản trị tạo',
			code: 'CAP_NHAT_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_QUAN_TRI_TAO_1',
			allowAll: false,
		},
		'admin/view-coupon': {
			name: 'Xem chi tiết chương trình khuyến mại',
			code: 'XEM_CHI_TIET_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		'admin/approved-coupon': {
			name: 'Phê duyệt chương trình khuyến mại',
			code: 'PHE_DUYET_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		// #endregion
		// #region 9. Quản lý hóa đơn
		'admin/list-invoice': {
			name: 'Xem danh sách hóa đơn',
			code: 'XEM_DANH_SACH_HOA_DON_1',
			allowAll: false,
		},
		'admin/view-invoice': {
			name: 'Xem chi tiết hóa đơn',
			code: 'XEM_CHI_TIET_HOA_DON_1',
			allowAll: false,
		},
		'admin/confirm-payment': {
			name: 'Xác nhận thanh toán',
			code: 'XAC_NHAN_THANH_TOAN_1',
			allowAll: false,
		},
		'admin/export-einvoice': {
			name: 'Xuất Hóa đơn điện tử',
			code: 'XUAT_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		'admin/view-einvoice': {
			name: 'Xem hóa đơn điện tử',
			code: 'XEM_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		'admin/download-einvoice': {
			name: 'Tải hóa đơn điện tử',
			code: 'TAI_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		// #endregion
		// #region 10. Quản lý combo dịch vụ
		'admin/list-combo': {
			name: 'Xem danh sách combo dịch vụ',
			code: 'XEM_DANH_SACH_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/view-combo': {
			name: 'Xem chi tiết combo dịch vụ',
			code: 'XEM_CHI_TIET_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/create-combo': {
			name: 'Tạo combo dịch vụ',
			code: 'TAO_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/update-combo': {
			name: 'Cập nhật combo dịch vụ',
			code: 'CAP_NHAT_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/request-approved-combo': {
			name: 'Yêu cầu phê duyệt',
			code: 'YEU_CAU_PHE_DUYET_1',
			allowAll: false,
		},
		'admin/delete-combo': {
			name: 'Xóa combo dịch vụ',
			code: 'XOA_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/change-status-combo': {
			name: 'Bật/tắt trạng thái hoạt động của combo dịch vụ',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/approved-combo': {
			name: 'Phê duyệt combo dịch vụ',
			code: 'PHE_DUYET_COMBO_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 11. Quản lý gói combo dịch vụ
		'admin/list-combo-pack': {
			name: 'Xem danh sách gói combo dịch vụ',
			code: 'XEM_DANH_SACH_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/view-combo-pack': {
			name: 'Xem chi tiết gói combo dịch vụ',
			code: 'XEM_CHI_TIET_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/create-combo-pack': {
			name: 'Tạo gói combo dịch vụ',
			code: 'TAO_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/update-combo-pack': {
			name: 'Cập nhật gói combo dịch vụ',
			code: 'CAP_NHAT_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/request-approved-combo-pack': {
			name: 'Yêu cầu phê duyệt gói combo dịch vụ',
			code: 'YEU_CAU_PHE_DUYET_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/delete-combo-pack': {
			name: 'Xóa gói combo dịch vụ',
			code: 'XOA_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/change-status-combo-pack': {
			name: 'Bật/tắt trạng thái hoạt động của gói combo dịch vụ',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/change-position-combo-pack': {
			name: 'Thay đổi vị trí các gói combo dịch vụ',
			code: 'THAY_DOI_VI_TRI_CAC_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'admin/set-recommend-combo-pack': {
			name: 'Chỉ định gói khuyên dùng',
			code: 'CHI_DINH_GOI_KHUYEN_DUNG_1',
			allowAll: false,
		},
		'admin/approved-combo-pack': {
			name: 'Phê duyệt gói combo dịch vụ',
			code: 'PHE_DUYET_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 12. Thuê bao combo dịch vụ
		'admin/list-subscription': {
			name: 'Xem danh sách thuê bao',
			code: 'XEM_DANH_SACH_THUE_BAO_1',
			allowAll: false,
		},
		'admin/view-subscription': {
			name: 'Xem chi tiết thuê bao',
			code: 'XEM_CHI_TIET_THUE_BAO_1',
			allowAll: false,
		},
		'admin/register-trial-subscription-combo': {
			name: 'Đăng ký thuê bao combo thử',
			code: 'DANG_KY_THUE_BAO_COMBO_THU_1',
			allowAll: false,
		},
		'admin/register-subscription-combo': {
			name: 'Đăng ký thuê bao combo chính thức',
			code: 'DANG_KY_THUE_BAO_COMBO_CHINH_THUC_1',
			allowAll: false,
		},
		'admin/update-subscription': {
			name: 'Cập nhật thuê bao',
			code: 'CAP_NHAT_THUE_BAO_1',
			allowAll: false,
		},
		'admin/cancel-subscription': {
			name: 'Hủy thuê bao',
			code: 'HUY_THUE_BAO_1',
			allowAll: false,
		},
		'admin/change-combo-pack': {
			name: 'Đổi gói combo',
			code: 'DOI_GOI_COMBO_1',
			allowAll: false,
		},
		'admin/delete-register-subscription': {
			name: 'Xóa đăng ký',
			code: 'XOA_DANG_KY_1',
			allowAll: false,
		},
		'admin/active-subscription': {
			name: 'Kích hoạt sử dụng thuê bao',
			code: 'KICH_HOAT_SU_DUNG_THUE_BAO_1',
			allowAll: false,
		},
		'admin/extension-subscription': {
			name: 'Gia hạn thuê bao',
			code: 'GIA_HAN_THUE_BAO_1',
			allowAll: false,
		},
		// 'admin/change-employee-subscription': {
		// 	// TODO: chưa có chức năng trên admin
		// 	name: 'Thêm/bớt nhân sự sử dụng sản phẩm dịch vụ',
		// 	code: 'THEM_BOT_NHAN_SU_SU_DUNG_SAN_PHAM_DICH_VU_1',
		// 	allowAll: false,
		// },
		// #endregion
		// #region 13. Đánh giá dịch vụ
		'admin/delete-comment-service': {
			// TODO: Không thấy vị trí chức năng
			name: 'Xóa nhận xét dịch vụ',
			code: 'XOA_NHAN_XET_DICH_VU_1',
			allowAll: false,
		},
		'admin/delete-response-service': {
			// TODO: Không thấy vị trí chức năng
			name: 'Xóa phản hồi',
			code: 'XOA_PHAN_HOI_1',
			allowAll: false,
		},
		// #endregion
		// #region 14. Đánh giá combo dịch vụ
		'admin/delete-comment-combo': {
			// TODO: Không thấy vị trí chức năng
			name: 'Xóa nhận xét combo',
			code: 'XOA_NHAN_XET_COMBO_1',
			allowAll: false,
		},
		'admin/delete-response-combo': {
			// TODO: Không thấy vị trí chức năng
			name: 'Xóa phản hồi combo',
			code: 'XOA_PHAN_HOI_COMBO_1',
			allowAll: false,
		},
		// #endregion
		// #region 15. Quản lý hợp đồng
		'admin/request-econtract': {
			// TODO: chưa có chức năng trên admin
			name: 'Yêu cầu tạo hợp đồng',
			code: 'YEU_CAU_TAO_HOP_DONG_1',
			allowAll: false,
		},
		'admin/list-econtract': {
			// TODO: chưa có chức năng trên admin
			name: 'Xem danh sách hợp đồng',
			code: 'XEM_DANH_SACH_HOP_DONG_1',
			allowAll: false,
		},
		'admin/view-econtract': {
			name: 'Xem chi tiết hợp đồng',
			code: 'XEM_CHI_TIET_HOP_DONG_1',
			allowAll: false,
		},
		// #endregion
		// #region Báo cáo thống kê
		'admin/report-subscription-detail': {
			name: 'Xem chi tiết hợp đồng',
			code: 'BAO_CAO_CHI_TIET_THUE_BAO',
			allowAll: false,
		},
		// #endregion
		// #region Quyền cũ
		// #endregion
		// #endregion
		// #region Dev portal
		// #region 1. Quản lý cấu hình

		'dev/view-notification': {
			name: 'Xem danh sách thông báo',
			code: 'XEM_DANH_SACH_THONG_BAO',
			allowAll: false,
		},
		'dev/detail-notification': {
			name: 'Xem chi tiết thông báo',
			code: 'XEM_CHI_TIET_THONG_BAO',
			allowAll: false,
		},
		// #endregion
		// #region 2. Quản lý vai trò
		// #endregion
		// #region 3. Quản lý tài khoản
		'dev/update-enterprise-info': {
			name: 'Cập nhật thông tin doanh nghiệp',
			code: 'CAP_NHAT_THONG_TIN_DOANH_NGHIEP_1',
			allowAll: false,
		},
		'dev/list-sub-dev-account': {
			name: 'Xem danh sách tài khoản nhân viên Developer',
			code: 'XEM_DANH_SACH_TAI_KHOAN_NHAN_VIEN_DEVELOPER_1',
			allowAll: false,
		},
		'dev/update-sub-dev-account': {
			name: 'Cập nhật tài khoản nhân viên Developer',
			code: 'CAP_NHAT_TAI_KHOAN_NHAN_VIEN_DEVELOPER_1',
			allowAll: false,
		},
		'dev/create-sub-dev-account': {
			name: 'Tạo tài khoản nhân viên Developer',
			code: 'TAO_TAI_KHOAN_NHAN_VIEN_DEVELOPER_1',
			allowAll: false,
		},
		'dev/change-status-sub-dev-account': {
			name: 'Bật/ tắt tài khoản nhân viên Developer',
			code: 'BAT_TAT_TAI_KHOAN_NHAN_VIEN_DEVELOPER_1',
			allowAll: false,
		},
		'dev/import-customer': {
			// TODO: Không thấy vị trí chức năng
			name: 'Import danh sách nhân viên',
			code: 'IMPORT_DANH_SACH_NHAN_VIEN_1',
			allowAll: false,
		},
		'dev/list-department': {
			name: 'Xem danh sách phòng ban',
			code: 'XEM_DANH_SACH_PHONG_BAN_1',
			allowAll: false,
		},
		'dev/view-department': {
			name: 'Xem chi tiết phòng ban',
			code: 'XEM_CHI_TIET_PHONG_BAN_1',
			allowAll: false,
		},
		'dev/update-department': {
			name: 'Cập nhật phòng ban',
			code: 'CAP_NHAT_PHONG_BAN_1',
			allowAll: false,
		},
		// #endregion
		// #region 4. Quản lý phiếu hỗ trợ
		'dev/list-ticket': {
			name: 'Xem danh sách phiếu hỗ trợ',
			code: 'XEM_DANH_SACH_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'dev/view-ticket': {
			name: 'Xem chi tiết phiếu hỗ trợ',
			code: 'XEM_CHI_TIET_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'dev/close-ticket': {
			name: 'Đóng phiếu hỗ trợ với mọi trạng thái',
			code: 'DONG_PHIEU_HO_TRO_VOI_MOI_TRANG_THAI_1',
			allowAll: false,
		},
		'dev/response-ticket': {
			name: 'Tạo phản hồi',
			code: 'TAO_PHAN_HOI_1',
			allowAll: false,
		},
		'dev/edit-own-response-ticket': {
			name: 'Sửa phản hồi tự tạo',
			code: 'SUA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		'dev/delete-own-response-ticket': {
			name: 'Xóa phản hồi tự tạo',
			code: 'XOA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		// #endregion
		// #region 5. Quản lý dịch vụ
		'dev/list-service': {
			name: 'Xem danh sách dịch vụ',
			code: 'XEM_DANH_SACH_DICH_VU_1',
			allowAll: false,
		},
		'dev/view-service': {
			name: 'Xem chi tiết dịch vụ',
			code: 'XEM_CHI_TIET_DICH_VU_1',
			allowAll: false,
		},
		'dev/create-service': {
			name: 'Tạo dịch vụ',
			code: 'TAO_DICH_VU_1',
			allowAll: false,
		},
		'dev/update-service': {
			name: 'Sửa dịch vụ',
			code: 'SUA_DICH_VU_1',
			allowAll: false,
		},
		'dev/request-approved-service': {
			name: 'Yêu cầu phê duyệt dịch vụ',
			code: 'YEU_CAU_PHE_DUYET_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-status-service': {
			name: 'Ẩn hiện dịch vụ',
			code: 'AN_HIEN_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 6. Quản gói dịch vụ
		'dev/list-service-pack': {
			name: 'Xem danh sách gói dịch vụ',
			code: 'XEM_DANH_SACH_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/view-service-pack': {
			name: 'Xem chi tiết gói dịch vụ',
			code: 'XEM_CHI_TIET_GOI_DICH_VU_1',
			allowAll: false,
		},

		'dev/create-service-pack': {
			name: 'Tạo gói dịch vụ',
			code: 'TAO_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/update-service-pack': {
			name: 'Sửa gói dịch vụ',
			code: 'SUA_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/request-approved-service-pack': {
			name: 'Yêu cầu duyệt gói dịch vụ',
			code: 'YEU_CAU_DUYET_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-status-service-pack': {
			name: 'Ẩn hiện gói dịch vụ',
			code: 'AN_HIEN_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/delete-service-pack': {
			name: 'Xóa gói dịch vụ',
			code: 'XOA_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-position-service-pack': {
			name: 'Thay đổi vị trí gói dịch vụ',
			code: 'THAY_DOI_VI_TRI_GOI_DICH_VU_1',
			allowAll: false,
		},
		'dev/set-recommend-service-pack': {
			name: 'Thiết lập gói khuyên dùng',
			code: 'THIET_LAP_GOI_KHUYEN_DUNG_1',
			allowAll: false,
		},
		// #endregion
		// #region 7. Quản lý dịch vụ bổ sung

		'dev/list-addon-by-dev': {
			name: 'Xem danh sách dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'XEM_DANH_SACH_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/delete-addon-by-dev': {
			name: 'Xóa dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'XOA_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/change-status-addon-by-dev': {
			name: 'Bật/tắt trạng thái hoạt động của dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/create-addon': {
			name: 'Tạo dịch vụ bổ sung',
			code: 'TAO_DICH_VU_BO_SUNG_1',
			allowAll: false,
		},
		'dev/request-approved-addon-by-dev': {
			name: 'Yêu cầu phê duyệt dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'YEU_CAU_PHE_DUYET_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/update-addon-by-dev': {
			name: 'Cập nhật dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'CAP_NHAT_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/view-addon-by-dev': {
			name: 'Xem chi tiết dịch vụ bổ sung do nhà cung cấp tạo',
			code: 'XEM_CHI_TIET_DICH_VU_BO_SUNG_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		// #endregion
		// #region 8. Quản lý chương trình khuyến mại
		'dev/list-coupon-by-dev': {
			name: 'Xem danh sách chương trình khuyến mại do nhà cung cấp tạo',
			code: 'XEM_DANH_SACH_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/delete-coupon-by-dev': {
			name: 'Xóa chương trình khuyến mại do nhà cung cấp tạo',
			code: 'XOA_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/change-status-coupon-by-dev': {
			name: 'Bật/tắt trạng thái hoạt động của chương trình khuyến mại do nhà cung cấp tạo',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/create-coupon': {
			name: 'Tạo chương trình khuyến mại',
			code: 'TAO_CHUONG_TRINH_KHUYEN_MAI_1',
			allowAll: false,
		},
		'dev/request-approved-coupon-by-dev': {
			name: 'Yêu cầu phê duyệt chương trình khuyến mại do nhà cung cấp tạo',
			code: 'YEU_CAU_PHE_DUYET_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/request-approved-service-by-dev': {
			name: 'Yêu cầu phê duyệt dịch vụ',
			code: 'YEU_CAU_PHE_DUYET_DICH_VU_1',
			allowAll: false,
		},
		'dev/update-coupon-by-dev': {
			name: 'Cập nhật chương trình khuyến mại do nhà cung cấp tạo',
			code: 'CAP_NHAT_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		'dev/view-coupon-by-dev': {
			name: 'Xem chi tiết chương trình khuyến mại do nhà cung cấp tạo',
			code: 'XEM_CHI_TIET_CHUONG_TRINH_KHUYEN_MAI_DO_NHA_CUNG_CAP_TAO_1',
			allowAll: false,
		},
		// #endregion
		// #region 9. Quản lý hóa đơn
		'dev/list-invoice': {
			name: 'Xem danh sách hóa đơn',
			code: 'XEM_DANH_SACH_HOA_DON_1',
			allowAll: false,
		},
		'dev/view-invoice': {
			name: 'Xem chi tiết hóa đơn',
			code: 'XEM_CHI_TIET_HOA_DON_1',
			allowAll: false,
		},
		'dev/view-einvoice': {
			name: 'Xem hóa đơn điện tử',
			code: 'XEM_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		'dev/download-einvoice': {
			name: 'Tải hóa đơn điện tử',
			code: 'TAI_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		// #endregion
		// #region 10. Quản lý combo dịch vụ
		'dev/list-combo': {
			name: 'Xem danh sách combo dịch vụ',
			code: 'XEM_DANH_SACH_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/view-combo': {
			name: 'Xem chi tiết combo dịch vụ',
			code: 'XEM_CHI_TIET_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/create-combo': {
			name: 'Tạo combo dịch vụ',
			code: 'TAO_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/update-combo': {
			name: 'Cập nhật combo dịch vụ',
			code: 'CAP_NHAT_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/request-approved-combo': {
			name: 'Yêu cầu phê duyệt',
			code: 'YEU_CAU_PHE_DUYET_1',
			allowAll: false,
		},
		'dev/delete-combo': {
			name: 'Xóa combo dịch vụ',
			code: 'XOA_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-status-combo': {
			name: 'Bật/tắt trạng thái hoạt động của combo dịch vụ',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_COMBO_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 11. Quản lý gói combo dịch vụ
		'dev/list-combo-pack': {
			name: 'Xem danh sách gói combo dịch vụ',
			code: 'XEM_DANH_SACH_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/view-combo-pack': {
			name: 'Xem chi tiết gói combo dịch vụ',
			code: 'XEM_CHI_TIET_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/create-combo-pack': {
			name: 'Tạo gói combo dịch vụ',
			code: 'TAO_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/update-combo-pack': {
			name: 'Cập nhật gói combo dịch vụ',
			code: 'CAP_NHAT_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/request-approved-combo-pack': {
			name: 'Yêu cầu phê duyệt gói combo dịch vụ',
			code: 'YEU_CAU_PHE_DUYET_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/delete-combo-pack': {
			name: 'Xóa gói combo dịch vụ',
			code: 'XOA_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-status-combo-pack': {
			name: 'Bật/tắt trạng thái hoạt động của gói combo dịch vụ',
			code: 'BAT_TAT_TRANG_THAI_HOAT_DONG_CUA_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/change-position-combo-pack': {
			name: 'Thay đổi vị trí các gói combo dịch vụ',
			code: 'THAY_DOI_VI_TRI_CAC_GOI_COMBO_DICH_VU_1',
			allowAll: false,
		},
		'dev/set-recommend-combo-pack': {
			name: 'Chỉ định gói khuyên dùng',
			code: 'CHI_DINH_GOI_KHUYEN_DUNG_1',
			allowAll: false,
		},
		// #endregion
		// #region 12. Thuê bao combo dịch vụ
		'dev/list-subscription': {
			name: 'Xem danh sách thuê bao',
			code: 'XEM_DANH_SACH_THUE_BAO_1',
			allowAll: false,
		},
		'dev/view-subscription': {
			name: 'Xem chi tiết thuê bao',
			code: 'XEM_CHI_TIET_THUE_BAO_1',
			allowAll: false,
		},
		'dev/register-trial-subscription-combo': {
			name: 'Đăng ký thuê bao combo thử',
			code: 'DANG_KY_THUE_BAO_COMBO_THU_1',
			allowAll: false,
		},
		'dev/register-subscription-combo': {
			name: 'Đăng ký thuê bao combo chính thức',
			code: 'DANG_KY_THUE_BAO_COMBO_CHINH_THUC_1',
			allowAll: false,
		},
		'dev/update-subscription': {
			name: 'Cập nhật thuê bao',
			code: 'CAP_NHAT_THUE_BAO_1',
			allowAll: false,
		},
		'dev/cancel-subscription': {
			name: 'Hủy thuê bao',
			code: 'HUY_THUE_BAO_1',
			allowAll: false,
		},
		'dev/change-combo-pack': {
			name: 'Đổi gói combo',
			code: 'DOI_GOI_COMBO_1',
			allowAll: false,
		},
		'dev/delete-register-subscription': {
			name: 'Xóa đăng ký',
			code: 'XOA_DANG_KY_1',
			allowAll: false,
		},
		'dev/active-subscription': {
			name: 'Kích hoạt sử dụng thuê bao',
			code: 'KICH_HOAT_SU_DUNG_THUE_BAO_1',
			allowAll: false,
		},
		'dev/extension-subscription': {
			name: 'Gia hạn thuê bao',
			code: 'GIA_HAN_THUE_BAO_1',
			allowAll: false,
		},
		// 'dev/change-employee-subscription': {
		// 	// TODO: chức năng chưa có
		// 	name: 'Thêm/bớt nhân sự sử dụng sản phẩm dịch vụ',
		// 	code: 'THEM_BOT_NHAN_SU_SU_DUNG_SAN_PHAM_DICH_VU_1',
		// 	allowAll: false,
		// },
		// #endregion
		// #region 13. Đánh giá dịch vụ
		'dev/list-evaluate': {
			name: 'Xem danh sách tổng quát đánh giá',
			code: 'XEM_DANH_SACH_TONG_QUAT_DANH_GIA_1',
			allowAll: false,
		},
		'dev/view-evaluate': {
			name: 'Xem chi tiết đánh giá, nhận xét',
			code: 'XEM_CHI_TIET_DANH_GIA,_NHAN_XET_1',
			allowAll: false,
		},
		'dev/response-service': {
			name: 'Phản hồi nhận xét',
			code: 'PHAN_HOI_NHAN_XET_1',
			allowAll: false,
		},
		'dev/update-response-service': {
			name: 'Cập nhật phản hồi',
			code: 'CAP_NHAT_PHAN_HOI_1',
			allowAll: false,
		},
		'dev/delete-response': {
			name: 'Xóa phản hồi',
			code: 'XOA_PHAN_HOI_1',
			allowAll: false,
		},
		// #endregion
		// #region 14. Đánh giá combo dịch vụ
		'dev/list-evaluate-combo': {
			name: 'Xem danh sách tổng quát đánh giá combo',
			code: 'XEM_DANH_SACH_TONG_QUAT_DANH_GIA_COMBO_1',
			allowAll: false,
		},
		'dev/view-evaluate-combo': {
			name: 'Xem chi tiết đánh giá, nhận xét combo',
			code: 'XEM_CHI_TIET_DANH_GIA_NHAN_XET_COMBO_1',
			allowAll: false,
		},
		'dev/response-combo': {
			name: 'Phản hồi nhận xét combo',
			code: 'PHAN_HOI_NHAN_XET_COMBO_1',
			allowAll: false,
		},
		'dev/update-response-combo': {
			name: 'Cập nhật phản hồi combo',
			code: 'CAP_NHAT_PHAN_HOI_COMBO_1',
			allowAll: false,
		},
		'dev/delete-response-combo': {
			name: 'Xóa phản hồi combo',
			code: 'XOA_PHAN_HOI_COMBO_1',
			allowAll: false,
		},
		// #endregion
		// #region 15. Quản lý hợp đồng
		'dev/list-econtract': {
			name: 'Xem danh sách hợp đồng',
			code: 'XEM_DANH_SACH_HOP_DONG_1',
			allowAll: false,
		},
		'dev/view-econtract': {
			name: 'Xem chi tiết hợp đồng',
			code: 'XEM_CHI_TIET_HOP_DONG_1',
			allowAll: false,
		},
		// #endregion
		// #region Quyền cũ
		// #endregion
		// #endregion
		// #region Sme portal
		// #region 1. Quản lý cấu hình
		'sme/view-notification': {
			name: 'Xem danh sách thông báo',
			code: 'XEM_DANH_SACH_THONG_BAO',
			allowAll: false,
		},
		'sme/detail-notification': {
			name: 'Xem chi tiết thông báo',
			code: 'XEM_CHI_TIET_THONG_BAO',
			allowAll: false,
		},
		// #endregion
		// #region 2. Quản lý vai trò

		// #endregion
		// #region 3. Quản lý tài khoản
		'sme/import-customer': {
			name: 'Import danh sách nhân viên',
			code: 'IMPORT_DANH_SACH_NHAN_VIEN_1',
			allowAll: false,
		},
		'sme/list-department': {
			name: 'Xem danh sách phòng ban',
			code: 'XEM_DANH_SACH_PHONG_BAN_1',
			allowAll: false,
		},
		'sme/view-department': {
			name: 'Xem chi tiết phòng ban',
			code: 'XEM_CHI_TIET_PHONG_BAN_1',
			allowAll: false,
		},
		'sme/update-department': {
			name: 'Cập nhật phòng ban',
			code: 'CAP_NHAT_PHONG_BAN_1',
			allowAll: false,
		},
		'sme/update-enterprise-info': {
			name: 'Cập nhật thông tin doanh nghiệp',
			code: 'CAP_NHAT_THONG_TIN_DOANH_NGHIEP_1',
			allowAll: false,
		},
		'sme/list-sub-sme-account': {
			name: 'Xem danh sách tài khoản nhân viên SME',
			code: 'XEM_DANH_SACH_TAI_KHOAN_NHAN_VIEN_SME_1',
			allowAll: false,
		},
		'sme/update-sub-sme-account': {
			name: 'Cập nhật tài khoản nhân viên SME',
			code: 'CAP_NHAT_TAI_KHOAN_NHAN_VIEN_SME_1',
			allowAll: false,
		},
		'sme/create-sub-sme-account': {
			name: 'Tạo tài khoản nhân viên SME',
			code: 'TAO_TAI_KHOAN_NHAN_VIEN_SME_1',
			allowAll: false,
		},
		'sme/change-status-sub-sme-account': {
			name: 'Bật/ tắt tài khoản nhân viên SME',
			code: 'BAT_TAT_TAI_KHOAN_NHAN_VIEN_SME_1',
			allowAll: false,
		},
		// #endregion
		// #region 4. Quản lý phiếu hỗ trợ
		'sme/list-ticket': {
			name: 'Xem danh sách phiếu hỗ trợ',
			code: 'XEM_DANH_SACH_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'sme/view-ticket': {
			name: 'Xem chi tiết phiếu hỗ trợ',
			code: 'XEM_CHI_TIET_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'sme/create-ticket': {
			name: 'Tạo phiếu hỗ trợ',
			code: 'TAO_PHIEU_HO_TRO_1',
			allowAll: false,
		},
		'sme/edit-ticket-pending': {
			name: 'Sửa nội dung phiếu hỗ trợ khi trạng thái là Chờ xử lý',
			code: 'SUA_NOI_DUNG_PHIEU_HO_TRO_KHI_TRANG_THAI_LA_CHO_XU_LY_1',
			allowAll: false,
		},
		'sme/close-ticket-pending': {
			name: 'Đóng phiếu hỗ trợ khi trạng thái là Chờ xử lý',
			code: 'DONG_PHIEU_HO_TRO_KHI_TRANG_THAI_LA_CHO_XU_LY_1',
			allowAll: false,
		},
		'sme/edit-ticket-all': {
			name: 'Sửa nội dung phiếu hỗ trợ với mọi trạng thái',
			code: 'SUA_NOI_DUNG_PHIEU_HO_TRO_VOI_MOI_TRANG_THAI_1',
			allowAll: false,
		},
		'sme/close-ticket-all': {
			name: 'Đóng phiếu hỗ trợ với mọi trạng thái',
			code: 'DONG_PHIEU_HO_TRO_VOI_MOI_TRANG_THAI_1',
			allowAll: false,
		},
		'sme/response-ticket': {
			name: 'Tạo phản hồi',
			code: 'TAO_PHAN_HOI_1',
			allowAll: false,
		},
		'sme/edit-own-response-ticket': {
			name: 'Sửa phản hồi tự tạo',
			code: 'SUA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		'sme/delete-own-response-ticket': {
			name: 'Xóa phản hồi tự tạo',
			code: 'XOA_PHAN_HOI_TU_TAO_1',
			allowAll: false,
		},
		// #endregion
		// #region 5. Quản lý dịch vụ

		// #endregion
		// #region 6. Quản gói dịch vụ
		// #endregion
		// #region 7. Quản lý dịch vụ bổ sung

		// #endregion
		// #region 8. Quản lý chương trình khuyến mại

		// #endregion
		// #region 9. Quản lý hóa đơn
		'sme/list-invoice': {
			name: 'Xem danh sách hóa đơn',
			code: 'XEM_DANH_SACH_HOA_DON_1',
			allowAll: false,
		},
		'sme/view-invoice': {
			name: 'Xem chi tiết hóa đơn',
			code: 'XEM_CHI_TIET_HOA_DON_1',
			allowAll: false,
		},
		'sme/payment': {
			name: 'Thanh toán',
			code: 'THANH_TOAN_1',
			allowAll: false,
		},
		'sme/export-einvoice': {
			name: 'Xuất Hóa đơn điện tử',
			code: 'XUAT_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		'sme/view-einvoice': {
			name: 'Xem hóa đơn điện tử',
			code: 'XEM_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		'sme/download-einvoice': {
			name: 'Tải hóa đơn điện tử',
			code: 'TAI_HOA_DON_DIEN_TU_1',
			allowAll: false,
		},
		// #endregion
		// #region 10. Quản lý combo dịch vụ

		// #endregion
		// #region 11. Quản lý gói combo dịch vụ

		// #endregion
		// #region 12. Thuê bao combo dịch vụ

		'sme/list-subscription': {
			name: 'Xem danh sách thuê bao',
			code: 'XEM_DANH_SACH_THUE_BAO_1',
			allowAll: false,
		},
		'sme/view-subscription': {
			name: 'Xem chi tiết thuê bao',
			code: 'XEM_CHI_TIET_THUE_BAO_1',
			allowAll: false,
		},
		'sme/register-trial-subscription-combo': {
			name: 'Đăng ký thuê bao combo thử',
			code: 'DANG_KY_THUE_BAO_COMBO_THU_1',
			allowAll: false,
		},
		'sme/register-subscription-combo': {
			name: 'Đăng ký thuê bao combo chính thức',
			code: 'DANG_KY_THUE_BAO_COMBO_CHINH_THUC_1',
			allowAll: false,
		},
		'sme/update-subscription': {
			name: 'Cập nhật thuê bao',
			code: 'CAP_NHAT_THUE_BAO_1',
			allowAll: false,
		},
		'sme/cancel-subscription': {
			name: 'Hủy thuê bao',
			code: 'HUY_THUE_BAO_1',
			allowAll: false,
		},
		'sme/change-combo-pack': {
			name: 'Đổi gói combo',
			code: 'DOI_GOI_COMBO_1',
			allowAll: false,
		},
		'sme/delete-register-subscription': {
			name: 'Xóa đăng ký',
			code: 'XOA_DANG_KY_1',
			allowAll: false,
		},
		'sme/active-subscription': {
			name: 'Kích hoạt sử dụng thuê bao',
			code: 'KICH_HOAT_SU_DUNG_THUE_BAO_1',
			allowAll: false,
		},
		'sme/extension-subscription': {
			name: 'Gia hạn thuê bao',
			code: 'GIA_HAN_THUE_BAO_1',
			allowAll: false,
		},
		'sme/change-employee-subscription': {
			name: 'Thêm/bớt nhân sự sử dụng sản phẩm dịch vụ',
			code: 'THEM_BOT_NHAN_SU_SU_DUNG_SAN_PHAM_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 13. Đánh giá dịch vụ
		'sme/evaluate-service': {
			name: 'Đánh giá dịch vụ',
			code: 'DANH_GIA_DICH_VU_1',
			allowAll: false,
		},
		'sme/update-evaluate-service': {
			name: 'Sửa đánh giá dịch vụ',
			code: 'SUA_DANH_GIA_DICH_VU_1',
			allowAll: false,
		},
		'sme/comment-service': {
			name: 'Nhận xét dịch vụ',
			code: 'NHAN_XET_DICH_VU_1',
			allowAll: false,
		},
		'sme/update-comment-service': {
			name: 'Sửa nhận xét dịch vụ',
			code: 'SUA_NHAN_XET_DICH_VU_1',
			allowAll: false,
		},
		'sme/delete-comment-service': {
			name: 'Xóa nhận xét dịch vụ',
			code: 'XOA_NHAN_XET_DICH_VU_1',
			allowAll: false,
		},
		// #endregion
		// #region 14. Đánh giá combo dịch vụ
		'sme/evaluate-combo': {
			name: 'Đánh giá combo',
			code: 'DANH_GIA_COMBO_1',
			allowAll: false,
		},
		'sme/update-evaluate-combo': {
			name: 'Sửa đánh giá combo',
			code: 'SUA_DANH_GIA_COMBO_1',
			allowAll: false,
		},
		'sme/comment-combo': {
			name: 'Nhận xét combo',
			code: 'NHAN_XET_COMBO_1',
			allowAll: false,
		},
		'sme/update-comment-combo': {
			name: 'Sửa nhận xét combo',
			code: 'SUA_NHAN_XET_COMBO_1',
			allowAll: false,
		},
		'sme/delete-comment-combo': {
			name: 'Xóa nhận xét combo',
			code: 'XOA_NHAN_XET_COMBO_1',
			allowAll: false,
		},
		// #endregion
		// #region 15. Quản lý hợp đồng
		'sme/request-econtract': {
			name: 'Yêu cầu tạo hợp đồng',
			code: 'YEU_CAU_TAO_HOP_DONG_1',
			allowAll: false,
		},
		'sme/list-econtract': {
			name: 'Xem danh sách hợp đồng',
			code: 'XEM_DANH_SACH_HOP_DONG_1',
			allowAll: false,
		},
		'sme/view-econtract': {
			name: 'Xem chi tiết hợp đồng',
			code: 'XEM_CHI_TIET_HOP_DONG_1',
			allowAll: false,
		},
		// #endregion
		// #region Quyền cũ

		// #endregion
		// #endregion
	};

	canAccessFuture2 = (featureCode, permissions) => {
		const code = this.featurePermission[featureCode]?.code;
		const allowAll = this.featurePermission[featureCode]?.allowAll;
		let collection = permissions?.permissionData;
		if (featureCode.includes('amin/')) {
			collection = permissions?.adminPermission;
		}
		if (featureCode.includes('dev/')) {
			collection = permissions?.devPermission;
		}
		if (featureCode.includes('sme/')) {
			collection = permissions?.smePermission;
		}
		const result = (collection || []).find((role) => code === role) || allowAll;
		return result;
	};

	// Mac dinh khong truyen fileType se xuat file .xlsx
	exportFile = (bytes, fileName, fileType) => {
		const file = new Blob([bytes], {
			type: fileType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		FileSaver.saveAs(file, fileName);
	};

	checkObjectTypeFile = (fileName) => {
		const name = trim(fileName).toString();
		const fileType = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
		let typeNumber;
		switch (fileType) {
			case 'jpeg':
			case 'jpg':
			case 'png':
			case 'ico':
			case 'tiff':
			case 'jfif':
				typeNumber = 1;
				break;
			case 'mp4':
			case 'mkv':
			case 'mov':
				typeNumber = 2;
				break;
			case 'pdf':
				typeNumber = 6;
				break;
			case 'doc':
				typeNumber = 7;
				break;
			case 'docx':
				typeNumber = 8;
				break;
			case 'xls':
				typeNumber = 9;
				break;
			case 'xlsx':
				typeNumber = 10;
				break;
			case 'ppt':
				typeNumber = 11;
				break;
			case 'pptx':
				typeNumber = 12;
				break;
			default:
				typeNumber = null;
		}
		return typeNumber;
	};

	checkEqualsObject = (obj1, obj2) => {
		if (isEqual(obj1, obj2)) {
			return true;
		}
		return false;
	};

	exportFileByBlob = (blob, fileName) => {
		FileSaver.saveAs(blob, fileName);
	};

	checkApplyTaxList = (options, valueChecks = []) => {
		if (valueChecks?.length === 0) return true;
		const es = {};
		let idFail = 0;
		valueChecks.forEach((e) => {
			if (es[e.taxId]) {
				idFail = e.taxId;
			} else {
				es[e.taxId] = { e };
			}
		});
		if (idFail > 0) {
			const i = options.findIndex((e) => e.value === idFail);
			message.error(`${options[i].label} đang được áp dụng nhiều lần.`);
			return false;
		}
		return true;
	};
}

export default new DX();
