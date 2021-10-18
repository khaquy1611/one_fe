/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// // Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = Object.freeze({
	apiKey: "AIzaSyCebv7dZsR2mAOnJhse5UzrURi9cfrt9-o",
	authDomain: "vnpt-aee37.firebaseapp.com",
	projectId: "vnpt-aee37",
	storageBucket: "vnpt-aee37.appspot.com",
	messagingSenderId: "918870854326",
	appId: "1:918870854326:web:03dfdd2ba72820df3eb417",
	measurementId: "G-EWF5RBG44F",
});
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const notificationTitle = payload.data.title;
	const notificationOptions = {
		body: payload.data.body,
		// icon: payload.data.image,
	};

	self.registration.showNotification(notificationTitle, notificationOptions);
});
self.onnotificationclick = (event) => {
	event.notification.close();
	event.waitUntil(
		(async function () {
			const allClients = await clients.matchAll({
				includeUncontrolled: true,
			});

			let chatClient;

			// Let's see if we already have a chat window open:
			for (const client of allClients) {
				client.focus();
				chatClient = client;
				break;
			}

			// If we didn't find an existing chat window,
			// open a new one:
			if (!chatClient) {
				chatClient = await clients.openWindow("/");
			}
		})()
	);
};
