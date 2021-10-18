import React, { useEffect, useMemo } from 'react';
import { Switch, useRouteMatch, useLocation } from 'react-router-dom';
import { useUser } from 'app/hooks';
import { SMERoute } from 'app/permissions/PrivateRoute';
import { CategoryPortal, DX } from 'app/models';
import { useQuery } from 'react-query';
import { appActions } from 'actions';
import { useDispatch } from 'react-redux';

import routers from './routers';
import { Header } from './layout';
import { Banner } from './components';
import Footer from './layout/Footer';
import Contact from './HomePage/Contact';

function SMEPortal() {
	const { path } = useRouteMatch();
	const { pathname } = useLocation();
	const { user } = useUser();
	const dispatch = useDispatch();

	useEffect(() => {
		// document.getElementById('massoffer-script-1')?.remove();
		document.getElementById('massoffer-script-2')?.remove();
		// const script = document.createElement('script');
		// script.setAttribute('data-skip-moving', true);
		// script.setAttribute('src', 'http://static-vnpt.dev.masoffer.tech/tracking.js');
		// script.setAttribute('id', 'massoffer-script-1');
		// document.body.appendChild(script);
		const script2 = document.createElement('script');
		script2.setAttribute('data-skip-moving', true);
		script2.innerText =
			'  var AFF_VNPT = {  ' +
			'      tracking: function() {  ' +
			'          var trafficIdUrl = this.getFromUrl("aff_content");  ' +
			'          var sourceUrl = this.getFromUrl("aff_source");  ' +
			'          if (sourceUrl == "affiliates" && trafficIdUrl) {  ' +
			'              this.setCookie("aff_content", trafficIdUrl, 30);  ' +
			'              this.setCookie("aff_source", sourceUrl, 30, true);  ' +
			'              return true;  ' +
			'          }  ' +
			'          return false;  ' +
			'      },  ' +
			'      setCookie: function(key, value, e, subdomain) {  ' +
			'          var d = new Date();  ' +
			'          d.setTime(d.getTime() + (e * 24 * 60 * 60 * 1000));  ' +
			'          var ee = "expires=" + d.toUTCString();  ' +
			'          if (subdomain) {  ' +
			'              document.cookie = key + "=" + value + "; " + ee + "; path=/";  ' +
			'          }  ' +
			'          else {  ' +
			'              document.cookie = key + "=" + value + "; " + ee + "; domain=" + window.location.hostname + "; path=/";  ' +
			'          }  ' +
			'      },   ' +
			'      getFromUrl: function(name, url) {  ' +
			'          if (!url) url = location.href;  ' +
			'          name = name.replace(/[[]/, "\\[").replace(/[]]/, "\\]");  ' +
			'          var regexS = "[\\?&]" + name + "=([^&#]*)";  ' +
			'          var regex = new RegExp(regexS);  ' +
			'          var results = regex.exec(url);  ' +
			'          return results == null ? null : results[1];  ' +
			'      },   ' +
			'      removeCookie: function (){  ' +
			'          this.setCookie("aff_content", "", 0);  ' +
			'          this.setCookie("aff_source", "", 0, true);  ' +
			'      }  ' +
			'  };  ' +
			' AFF_VNPT.tracking(); ';
		document.body.appendChild(script2);
		script2.setAttribute('id', 'massoffer-script-2');
	}, []);

	useQuery(
		['getAllCategory'],
		async () => {
			const res = await CategoryPortal.getAll();
			dispatch(
				appActions.initCategoryList(
					res.map((item) => ({
						...item,
						label: item.name,
						value: item.id,
						to: DX.sme.createPath(`/products?category=${item.id}`),
					})),
				),
			);
			return [];
		},
		{
			initialData: [],
			retry: 3,
		},
	);
	const displayContact = useMemo(() => {
		if (pathname === DX.sme.path) {
			return true;
		}
		if (pathname.startsWith(DX.sme.createPath('/products'))) {
			return true;
		}
		if (pathname.startsWith(DX.sme.createPath('/combos'))) {
			return true;
		}
		if (
			pathname.startsWith(DX.sme.createPath('/service')) &&
			!pathname.startsWith(DX.sme.createPath('/service/pay'))
		) {
			return true;
		}
		if (pathname.startsWith(DX.sme.createPath('/combo')) && !pathname.startsWith(DX.sme.createPath('/combo/pay'))) {
			return true;
		}
		return false;
	}, [pathname]);
	return (
		<section className="flex flex-col bg-main">
			<Header />
			<main
				className={`min-h-screen container mx-auto flex pb-16 ${
					pathname !== DX.sme.path && 'mt-40 mobile:mt-24'
				}`}
			>
				<div className="w-full">
					<Switch>
						{routers(user)
							.filter((el) => !el.hide)
							.map(({ Child, ...router }, i) => (
								<SMERoute key={router.path || i} {...router} path={path + router.path} />
							))}
					</Switch>
				</div>
			</main>
			{displayContact && <Contact />}
			<Footer />
		</section>
	);
}

export default SMEPortal;
