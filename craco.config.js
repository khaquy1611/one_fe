/* eslint-disable global-require */
const CracoLessPlugin = require("craco-less");

module.exports = {
	style: {
		postcss: {
			plugins: [require("tailwindcss"), require("autoprefixer")],
		},
	},
	plugins: [
		{
			plugin: CracoLessPlugin,
			options: {
				lessLoaderOptions: {
					lessOptions: {
						modifyVars: {
							"@border-radius-base": "var(--border-radius-base)",
							"@height-base": "40px",
							"@height-lg": "40px",
							"@height-sm": "32px", // pagination mini effect
							"@table-font-size": "0.875rem",
							"@menu-item-font-size": "1rem",
							"@breadcrumb-font-size": "1rem",
							"@breadcrumb-icon-font-size": "1rem",
							"@form-item-label-font-size": "1rem",
							"@btn-font-size-sm": "@font-size-sm",
							"@btn-font-weight": "500",
							"@btn-padding-horizontal-lg": "1.5rem",
							"@switch-height": "22px",
							"@switch-sm-height": "18px",
							"@switch-min-width": "42px",
							"@switch-sm-min-width": "30px",
							"@primary-color": "#2C3D94",
							"@menu-dark-submenu-bg": "@menu-dark-bg",
							"@disabled-color": "fade(#000, 55%)",
							"@screen-sm": "639px",
							"@screen-md": "767px",
							"@screen-lg": "1023px",
							"@screen-xl": "1279px",
							"@screen-xxl": "1535px",
							"@rate-star-bg": "#cfd8dc",
							"@select-dropdown-height": "var(--select-dropdown-height)",
							"@dropdown-line-height": "28px",
							"@select-item-selected-bg": "#EAECF4",
							"@select-item-active-bg": "#F2F2F2",
							"@border-color-base": "#E6E6E6",
							"@input-placeholder-color": "#999999",
							"@form-error-input-bg": "#FFF1F0",
							"@input-disabled-bg": "#F2F2F2",
							"@input-hover-border-color": "#999999",
							"@btn-shadow": "none",
							"@btn-primary-shadow": "none",
							// "@btn-default-color": "@primary-color",
							// "@btn-default-border": "@primary-color",
							"@btn-disable-bg": "#ffffff",
							"@avatar-size-base": "40px",
							"@avatar-size-lg": "46px",
							"@steps-icon-margin": "4px 8px 0 0",
							"@checkbox-size": "22px",
							"@select-single-item-height-lg": "40px",
							"@select-multiple-item-height-lg": "40px",
							"@table-border-radius-base": "0",
							"@table-header-bg": "#F8F8F8",
							"@table-padding-vertical": "12px",
							// "@component-background": "#fcfcfd"
						},
						javascriptEnabled: true,
					},
				},
			},
		},
	],
};
