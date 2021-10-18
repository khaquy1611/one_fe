import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
	:root {
		--border-radius-base: 0.75rem;
		--select-dropdown-height: 2.5rem;
	}
	body {
		color: #333333;
		font-family: "Montserrat";
	}
	.ant-select-item-option-content {
		line-height: 2;
	}
	.ant-form label {
		font-weight: 500;
	}

	.ant-pagination-item {
		border-color: var(--color-primary) !important;
		/* margin: 0 .25rem !important; */
		a {
			color: var(--color-primary) !important;
		}
	}
	.ant-pagination-item-active {
		background-color: var(--color-primary);
		a {
			color: #ffffff !important;
		}
	}

	.ant-table-thead > tr > th {
		font-weight: 500;
		color: #666666;
	}
	.ant-breadcrumb a {
		font-weight: bold;
		color: var(--color-primary) !important;
	}
	.ant-btn:not(.ant-btn-primary, .ant-btn-text, .ant-btn-icon-only, .ant-btn-link) {
		color: var(--color-primary);
		border-color: var(--color-primary);
	}
	.ant-btn:hover,
	.ant-btn:focus {
		&:not(.ant-btn-text, .ant-btn-icon-only) {
			box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
		}
		&.ant-btn-text {
			background: none;
			color: var(--color-primary) !important;
			/* * {
				color: var(--color-primary) !important;
			} */
		}
	}
	.ant-btn-primary:hover,
	.ant-btn-primary:focus {
		background-color: #212d6e;
	}
	.ant-btn:disabled {
		border-color: #abb1d4 !important;
		color: #abb1d4 !important;
	}
	.ant-btn-primary:disabled {
		background-color: #808bbf !important;
		color: #ffffff !important;
	}
	.ant-input-search .ant-btn {
		box-shadow: none;
		/* color: #78909c; */
		border-color: #E6E6E6;
		border-left: none;
		&:focus, &:hover{
			border-left: 1px solid;
			border-color: #999999;
			transition: 0.4s ease-in;
		}
	}

`;
export default GlobalStyle;
