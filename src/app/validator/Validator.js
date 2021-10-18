// Validate truong bat buoc nhap
export function validateRequire(message) {
	return {
		required: true,
		message: message || 'Vui lòng không bỏ trống mục này',
	};
}

export const trim = (value) => `${value}`.trim();
export const trimNormalizer = trim;

export function validateRequireCheckbox(message) {
	return {
		validator: (_, value) => {
			if ((!!value && value) || value === 0) {
				return Promise.resolve();
			}
			return Promise.reject(message || 'Vui lòng không bỏ trống mục này');
		},
	};
}

// Validate truong chi nhap khoang trang
export function validateRequireInput(message) {
	return {
		required: true,
		validator: (_, value) => {
			if (!!value && trim(value) !== '') {
				return Promise.resolve();
			}
			return Promise.reject(message || 'Vui lòng không bỏ trống mục này');
		},
	};
}

export function validateRequireApplyService(message) {
	return {
		validator: (_, value) => {
			if (!value || !value.id) {
				return Promise.reject(message || 'Vui lòng không bỏ trống mục này');
			}
			return Promise.resolve();
		},
	};
}

// Validate truong nhap toi da bao nhieu ky tu
export function validateMaxLengthStr(maxLength, message) {
	return {
		max: maxLength,
		message: message || 'Vui lòng nhập tối đa ký tự cho phép',
	};
}

// Validate truong nhap số trong giới hạn min - max cần check
// Nếu cần giới 1 đầu thì nhập giá trị đầu còn lại là null
// export function validateMinMaxInputNumber(min, max, message) {  //sẽ không dùng hàm này nữa mà tách thành 2 hàm riêng
// 	return {
// 		validator: (_, value) => {
// 			const number = parseInt(value, 10);
// 			if (trim(value) && !Number.isNaN(number)) {
// 				if (min && !max) {
// 					if (number >= min) return Promise.resolve();
// 					return Promise.reject(message || `Giá trị nhập tối thiểu là ${min}`);
// 				}
// 				if (!min && max) {
// 					if (number <= max) return Promise.resolve();
// 					return Promise.reject(message || `Giá trị nhập tối đa là ${max}`);
// 				}
// 				if (min && max) {
// 					if (number >= min && number <= max) return Promise.resolve();
// 					return Promise.reject(message || `Giá trị nhập chỉ được trong khoảng từ ${min} đến ${max}`);
// 				}
// 			}
// 			return Promise.resolve();
// 		},
// 	};
// }

export function validateMinInputNumber(min, message) {
	return {
		validator: (_, value) => {
			const number = parseInt(value, 10);
			if (trim(value) && !Number.isNaN(number)) {
				if (number >= min) return Promise.resolve();
				return Promise.reject(message || 'Giá trị nhập vào không hợp lệ');
			}
			return Promise.resolve();
		},
	};
}

export function validateMaxInputNumber(max, message, type) {
	return {
		validator: (_, value) => {
			const number = parseInt(value, 10);
			if (trim(value) && !Number.isNaN(number)) {
				if (type === 'not_equal') {
					if (number < max) return Promise.resolve();
					return Promise.reject(message);
				}
				if (number <= max) return Promise.resolve();
				return Promise.reject(message || 'Giá trị nhập vào không hợp lệ');
			}
			return Promise.resolve();
		},
	};
}

export function validateUrl(message) {
	return {
		validator: (_, url) => {
			if (url && trim(url)) {
				const regexWhitespace = /\s/g;
				// eslint-disable-next-line no-useless-escape
				const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/?.*)?$/gm;
				const haveWhitespace = regexWhitespace.test(url);
				const isURL = regex.test(url);
				const isLocalOrAddress = /^(localhost|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(:([0-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5])))))?(\/?.*)?$/gi.test(
					url,
				);
				if ((!isURL && !isLocalOrAddress) || haveWhitespace) {
					return Promise.reject(new Error(message) || 'Sai định dạng URL. Ví dụ: https://example.com');
				}
				return Promise.resolve();
			}
			return Promise.resolve();
		},
	};
}

// Validate truong nhap so dien thoai
// Mac dinh khong truyen hoac type = normal la chi check so dien thoai di dong
// Truyen param type = office la check ca so di dong va so dien thoai ban
export function validatePhoneNumber(type, message) {
	return {
		validator: (_, number) => {
			if (number && trim(number)) {
				const regex = /^[0-9]{0,14}$/g;
				const regexOffice = /^[+][0-9]{1,13}$/g;
				let isRegex = false;
				let isRegexOffice = false;

				if (regex.test(number) && number.length <= 14 && number.length >= 10) {
					isRegex = true;
				}
				if (type === 'office') {
					if (regexOffice.test(number) && number.length <= 14 && number.length >= 10) {
						isRegexOffice = true;
					}
					if (!isRegex && !isRegexOffice) {
						return Promise.reject(message || 'Giá trị nhập vào không hợp lệ');
					}
				} else {
					if (!isRegex) {
						return Promise.reject(message || 'Giá trị nhập vào không hợp lệ');
					}
					return Promise.resolve();
				}
				return Promise.resolve();
			}
			return Promise.resolve();
		},
	};
}

// Validate truong email
export function validateEmail(message) {
	return {
		validator: (_, value) => {
			if (value && value.length) {
				const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]{2,}(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
				if (re.test(value)) {
					return Promise.resolve();
				}
				return Promise.reject(message || 'Vui lòng nhập đúng định dạng');
			}
			return Promise.resolve();
		},
	};
}

// Validate truong password
export function validatePassword(message) {
	return {
		validator: (_, value) => {
			if (value && value.length) {
				const regex = [];
				regex.push('[A-Z]'); // Uppercase
				regex.push('[a-z]'); // Lowercase
				regex.push('[0-9]'); // Digit
				regex.push(
					"[\\s\\`\\~\\@\\#\\%\\&\\(\\)\\[\\]\\{\\}\\\\^\\$\\:\\;\\'\\/\\,\\|\\?\\*\\+\\.\\<\\>\\-\\=\\!\\_]",
				);

				let passed = 0;
				for (let i = 0; i < regex.length; i++) {
					if (new RegExp(regex[i]).test(value)) {
						passed++;
					}
				}
				if (passed > 3 && value.length >= 8 && value.length <= 16) {
					return Promise.resolve();
				}
				return Promise.reject(message || 'Giá trị nhập vào không hợp lệ');
			}
			return Promise.resolve();
		},
	};
}

// Validate truong nhap number > 0
export function validateNumber(message) {
	return {
		validator: (_, value) => {
			if (trim(value)) {
				value = value.toString().replaceAll(/\D/g, '');
				if (parseInt(value, 10) > 0) {
					return Promise.resolve();
				}
				return Promise.reject(message || 'Vui lòng nhập vào giá trị lớn hơn 0');
			}
			return Promise.resolve();
		},
	};
}

// Validate do dai truong nhap number
export function validateNumberLength(maxLength, message) {
	return {
		validator: (_, value) => {
			if (value) {
				value = value.toString().replaceAll(/\D/g, '');
				if (value.length <= maxLength) {
					return Promise.resolve();
				}
				return Promise.reject(message || 'Nhập vượt quá chữ số cho phép');
			}
			return Promise.resolve();
		},
	};
}

// Validate truong Select duoc chon toi da bao lua chon
export function validateMaxArraySelect(max, message) {
	return {
		validator: (_, values) => {
			if (!values || values.length <= max) {
				return Promise.resolve();
			}
			return Promise.reject(message || `Vượt quá tối đa ${max} lựa chọn!`);
		},
	};
}

// Validate truong Select, moi lua chon nhap toi da bao nhieu ky tu
export function validateMaxLengthSelect(max, message) {
	return {
		validator: (_, values) => {
			if (Array.isArray(values) && values.length) {
				let isError = false;
				values.forEach((e) => {
					e = trim(e);
					if (!trim(e) || e.length > max) {
						isError = true;
					}
				});
				if (!isError) return Promise.resolve();
				return Promise.reject(message || `Mỗi lựa chọn nhập tối đa ${max} ký tự!`);
			}
			return Promise.resolve();
		},
	};
}

// Validate truong Select, 1 ky tu khong duoc phep khi nhap trong select
export function validateRegexCharSelect(charVal, message) {
	return {
		validator: (_, array) => {
			if (array) {
				let isError = false;
				array.forEach((e) => {
					if (e.indexOf(charVal) > -1) {
						isError = true;
					}
				});
				if (!isError) return Promise.resolve();
				return Promise.reject(message || `Ký tự ${charVal} không được phép sử dụng`);
			}
			return Promise.resolve();
		},
	};
}

export function validateCustomPattern(regex, message) {
	return {
		validator: (_, value) => {
			if (value && trim(value) !== '') {
				if (new RegExp(regex).test(value)) {
					Promise.resolve();
				} else return Promise.reject(message || 'Vui lòng nhập đúng định dạng');
				return Promise.resolve();
			}
			return Promise.resolve();
		},
	};
}

// NOTE: param type is string, return null if empty
//							   return 0 if empty
export function formatNormalizeCurrency(value, type, defaultValue) {
	if (trim(value) && value !== null && value !== undefined) {
		value = value.toString().replaceAll(/\D/g, '');
		if (type && value === '0') return defaultValue ?? '';

		if (value !== '') {
			return parseInt(value, 10).toLocaleString('it-IT');
		}
	}
	return typeof type === 'string' ? null : 0;
}

export function formatNormalizeNumber(value) {
	if (trim(value)) {
		value = value.toString().replaceAll(/\D/g, '');
		if (value !== '') {
			return parseInt(value, 10);
		}
	}
	return null;
}

export function formatNormalizeFloatNumber(value, prevValue) {
	if (!!value && trim(value)) {
		value = trim(value.toString()).replaceAll(/[^,\d]/g, '');
		const valueDot = value.replaceAll(',', '.');
		const dot = valueDot.indexOf('.');
		if (dot === valueDot.length - 1) {
			return value;
		}
		if (Number.isNaN(parseFloat(valueDot))) {
			return prevValue || null;
		}
		const str = valueDot.slice(dot + 1);
		if (dot > 0 && str.length > 2) {
			return prevValue;
		}
		if (valueDot === '0.00') return parseFloat(0);
		if (dot > 0 && (str === '0' || str === '00')) {
			return value;
		}
		return valueDot.toString().replaceAll('.', ',');
	}
	return null;
}

export function formatNormalizeNumberOtherZero(value, type) {
	if (trim(value)) {
		value = value.toString().replaceAll(/\D/g, '');
		if (value !== '' && value !== '0') {
			return type === 'normal' ? parseInt(value, 10) : parseInt(value, 10).toLocaleString('fr');
		}
		return '';
	}
	return '';
}

export function formatNormalizeNumberZero(value) {
	if (trim(value)) {
		return value.toString().replaceAll(/\D/g, '');
	}
	return null;
}

export function formatNormalizeTaxCode(value) {
	if (trim(value)) {
		const taxCode = value.toString().replaceAll(/\D/g, '');
		// let taxCode = '';
		// for (let i = 0; i < str.length; i++) {
		// 	if (i === 2 || i === 9 || i === 10) {
		// 		taxCode = taxCode.concat(` ${str.charAt(i)}`);
		// 	} else taxCode = taxCode.concat(str.charAt(i));
		// }
		return taxCode;
	}
	return null;
}

// Validate truong string
export function validateStrLength(max1, max2, message) {
	return {
		validator: (_, value) => {
			value = value || '';
			if ((value && (value.length === max1 || value.length === max2)) || value.length === 0) {
				return Promise.resolve();
			}
			return Promise.reject(message || 'Vui lòng chỉ nhập tối đa số ký tự cho phép');
		},
	};
}

export function validateMaxValue(max1, message) {
	return {
		validator: (_, value) => {
			if (trim(value)) {
				value = value.toString().replaceAll(/\D/g, '');
				if (parseInt(value, 10) >= max1) {
					return Promise.resolve();
				}
				return Promise.reject(message || `Vui lòng nhập vào giá trị lớn hơn ${max1}`);
			}
			return Promise.resolve();
		},
	};
}

export function formatNormalizeStringSelect(values) {
	const check = {};
	const result = [];
	values.forEach((value) => {
		const trimValue = trim(value.toString());
		if (trimValue && !check[trimValue]) {
			check[trimValue] = true;
			result.push(trimValue);
		}
	});
	return result;
}

// Validate truong password
export function validateCompareOldPassword(oldPassword, messageCompare, messagePattern) {
	return {
		validator: (_, value) => {
			if (value && value.length) {
				if (oldPassword === value) {
					return Promise.reject(messageCompare); // Mật khẩu mới không được trùng mật khẩu cũ || newPassCanNotSameAsOldPass
				}
				const regex = [];
				regex.push('[A-Z]'); // Uppercase
				regex.push('[a-z]'); // Lowercase
				regex.push('[0-9]'); // Digit
				regex.push(
					"[\\s\\`\\~\\@\\#\\%\\&\\(\\)\\[\\]\\{\\}\\\\^\\$\\:\\;\\'\\/\\,\\|\\?\\*\\+\\.\\<\\>\\-\\=\\!\\_]",
				);
				let passed = 0;
				for (let i = 0; i < regex.length; i++) {
					if (new RegExp(regex[i]).test(value)) {
						passed++;
					}
				}
				if (passed > 3 && value.length >= 8 && value.length <= 16) {
					return Promise.resolve();
				}
				return Promise.reject(messagePattern); // Mật khẩu phải có từ 8-16 ký tự, bao gồm ít nhất 1 chữ viết hoa, 1 chữ viết thường, 1 chữ số và 1 ký tự đặc biệt || registerPassNotValid
			}
			return Promise.resolve();
		},
	};
}

export function validateCode(message, regex) {
	const rg = regex || /^[a-zA-Z0-9#\-_/:|]+$/;

	return {
		validator: (_, value) => {
			const valueTrim = trim(value);
			if (valueTrim && !rg.test(valueTrim)) {
				return Promise.reject(message || 'Vui lòng nhập đúng định dạng');
			}
			return Promise.resolve();
		},
	};
}

export function validateQuanlitySub(valueQuanlity, message, type) {
	return {
		validator: (_, value) => {
			if (trim(value)) {
				value = value.toString().replaceAll(/\D/g, '');
				if (type === 'INCREASE') {
					if (parseInt(value, 10) > valueQuanlity) {
						return Promise.resolve();
					}
					return Promise.reject(message || `Vui lòng nhập vào giá trị lớn hơn ${valueQuanlity}`);
				}
				if (type === 'DECREASE') {
					if (parseInt(value, 10) < valueQuanlity) {
						return Promise.resolve();
					}
					return Promise.reject(message || `Vui lòng nhập vào giá trị nhỏ hơn ${valueQuanlity}`);
				}
			}
			return Promise.resolve();
		},
	};
}

// Validate truong string
function validateImg(file) {
	const isJpgOrPng =
		file.type === 'image/jpeg' ||
		file.type === 'image/png' ||
		file.type === 'image/jpg' ||
		file.type === 'image/x-icon' ||
		file.type === 'image/jfif';
	if (!isJpgOrPng) {
		return false;
	}

	return true;
}

function validateVideo(file) {
	const isVideo =
		file.type === 'video/quicktime' || // mov
		file.type === 'video/mp4' ||
		file.type === 'video/x-matroska'; // mkv
	if (!isVideo) {
		return false;
	}

	return true;
}

function validateFileUpload(file) {
	const isVideo =
		file.type === 'application/pdf' ||
		file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
		file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
		file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
		file.type === 'application/msword' ||
		file.type === 'application/vnd.ms-excel' ||
		file.type === 'application/vnd.ms-powerpoint';
	if (!isVideo) {
		return false;
	}

	return true;
}

const validateFileType = (value) => {
	let isValidateFile = true;
	for (let i = 0; i < value.length; i++) {
		if (!validateVideo(value[i]) && !validateImg(value[i]) && !validateFileUpload(value[i])) {
			isValidateFile = false;
			break;
		}
	}
	return isValidateFile;
};

const validateFileSize = (value) => {
	for (let i = 0; i < value.length; i++) {
		const isLt2M = value[i].size / 1024 / 1024 < 10;
		if (!isLt2M) {
			return false;
		}
	}
	return true;
};

const isOverLimitSize = (fileList) => {
	// let fileListDataSize = 0;
	let valueDataSize = 0;

	if (valueDataSize === 0) {
		fileList.forEach((item) => {
			valueDataSize += item.fileSize || item.size;
		});
	}

	if (valueDataSize > 100 * 1024 * 1024) {
		return true;
	}
	return false;
};

const isOverFileNumber = (fileList) => {
	if (fileList.length > 20) {
		return true;
	}
	return false;
};

export function validateFile(message) {
	return {
		validator: (_, value) => {
			if (value) {
				if (!validateFileType(value.filter((item) => item.type))) {
					return Promise.reject(message || 'File không hợp lệ');
				}
				if (!validateFileSize(value)) {
					return Promise.reject(message || 'File không được quá 10MB');
				}
				if (isOverLimitSize(value)) {
					return Promise.reject(message || 'Tổng dung lượng các file không được quá 100MB');
				}
				if (isOverFileNumber(value)) {
					return Promise.reject(message || 'Chỉ chọn tối đa 20 files');
				}

				return Promise.resolve();
			}
			return Promise.resolve();
		},
	};
}

export function getFormError(errors, tValidate) {
	if (errors.fields) {
		const objectError = {};
		errors.fields.forEach((error) => {
			if (objectError[error.field]) {
				objectError[error.field].push(tValidate(error.apiErrorCode));
			} else {
				objectError[error.field] = [tValidate(error.apiErrorCode)];
			}
		});
		return Object.keys(objectError).map((key) => ({
			name: key,
			errors: objectError[key],
		}));
	}
	if (errors.field) {
		return [
			{
				name: errors.field,
				errors: [tValidate(errors.errorCode)],
			},
		];
	}
	return null;
}

export function validateRequireSelectItems(message) {
	return {
		validator: (_, value) => {
			if (value) {
				if (value.list.length === 0 && (value.type === 'OPTION' || value.type === 'PRODUCT')) {
					return Promise.reject(message || 'Vui lòng không bỏ trống mục này');
				}
				return Promise.resolve();
			}
			return Promise.resolve();
		},
	};
}

// Validate input chỉ nhập số 0-9 và dấu phẩy
export function validateInputNumAndComma(message) {
	const regexWithNumAndComma = /^[-,0-9]+$/;
	return {
		validator: (_, value) => {
			if (value && !regexWithNumAndComma.test(value)) {
				return Promise.reject(message);
			}
			return Promise.resolve();
		},
	};
}

// Validate input so sánh các giá trị trong mảng với giá trị max

export function validateMaxValueArr(maxLength, message) {
	return {
		validator: (_, value) => {
			if (value && Math.max(...value.split(',').filter((n) => !!n)) > maxLength) {
				return Promise.reject(message);
			}
			return Promise.resolve();
		},
	};
}
