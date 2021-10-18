import Base from './Base';

class TicketAdmin extends Base {
	assignTicket = (data) => this.apiPut(`/${data?.idTicket}/assign?assigner=${data?.assigner}`);

	responseTicketsPagination = async (id, query) => {
		const res = await this.apiGet(`/${id}/responses`, query);
		return this.formatResPagination(res);
	};

	resolvedTicket = (id) => this.apiPut(`/${id.idTicket}/resolved`);

	getListCustomerSupport = async (userId, ticketId, query) => {
		const res = await this.apiGet(`/supporters?devId=${userId}&ticketId=${ticketId}`, query);
		return this.formatResPagination(res);
	};

	responseTicket = ({ id, query }) => this.apiPost(`/${id}/response`, query);

	reResponseTicket = ({ id, query }) => this.apiPut(`/responses/${id}`, query);

	deleteTicket = ({ id }) => this.apiDelete(`/responses/${id}`);

	tagStatus = {
		// value
		RESOLVED: {
			color: 'success',
			text: 'processed',
			value: 'RESOLVED',
		},
		IN_PROGRESS: {
			color: 'warning',
			text: 'inProcess',
			value: 'IN_PROGRESS',
		},
		OPEN: {
			color: 'default',
			text: 'waitingProcess',
			value: 'OPEN',
		},
	};
}

export default new TicketAdmin('/admin-portal/tickets');
