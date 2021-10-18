import Base from './Base';

class SMETicket extends Base {
	getAllPagination = async (query) => {
		const res = await this.apiGet('', query);
		return this.formatResPagination(res);
	};

	getAllFeedback = async (id, query) => {
		const res = await this.apiGet(`/${id}/responses`, query);
		return this.formatResPagination(res);
	};

	responseTicketsPagination = async (id, query) => {
		const res = await this.apiGet(`/${id}/responses`, query);
		return this.formatResPagination(res);
	};

	createTicket = (query) => this.apiPost('', query);

	updateTicket = ({ id, query }) => this.apiPut(`/${id}`, query);

	responseTicket = ({ id, query }) => this.apiPost(`/${id}/response`, query);

	closeTicket = (id) => this.apiPut(`/${id}/resolved`, id);

	statusArray = [
		// value
		{
			value: '',
			label: 'all',
			color: '',
		},
		{
			value: 'OPEN',
			label: 'waitingProcess',
			color: '#FFBE5B',
		},
		{
			value: 'IN_PROGRESS',
			label: 'inProcess',
			color: '#6C8EE1',
		},
		{
			value: 'RESOLVED',
			label: 'processed',
			color: '#50B98F',
		},
	];
}

export default new SMETicket('/sme-portal/tickets');
