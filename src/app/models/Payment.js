import superagent from 'superagent';
import Base from './Base';

export const SLEEP = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class Payment extends Base {
	// Verify payment
	verifyPayment = async ({ orderId }) => {
		const res = await this.apiPost(`/verify`, {
			MERCHANT_ORDER_ID: orderId,
		});
		return res;
	};

	// repay payment
	rePay = async ({ orderId }) => {
		const ipAddress = await this.getClientIp();
		const res = await this.apiPost(`/repay?ipAddress=${ipAddress}`, {
			MERCHANT_ORDER_ID: orderId,
		});
		return res;
	};
}

export default new Payment('/portal/payment');
