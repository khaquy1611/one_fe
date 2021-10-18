import firebase from 'firebase/app';
import 'firebase/messaging';

export const initFirebase = () => {
	const firebaseConfig = Object.freeze({
		apiKey: 'AIzaSyCebv7dZsR2mAOnJhse5UzrURi9cfrt9-o',
		authDomain: 'vnpt-aee37.firebaseapp.com',
		projectId: 'vnpt-aee37',
		storageBucket: 'vnpt-aee37.appspot.com',
		messagingSenderId: '918870854326',
		appId: '1:918870854326:web:03dfdd2ba72820df3eb417',
		measurementId: 'G-EWF5RBG44F',
	});
	if (firebase.apps.length === 0) {
		firebase.initializeApp(firebaseConfig);
	}
	return firebase.messaging();
};

export const getToken = (messaging, cb) => {
	messaging
		.getToken({
			vapidKey: 'BAJaUAnOZfkhODTp3EhUeMkeyq1_K5m-08n-ZFkciUkIxZWPNG_2SEJv_sPy1kr3wKWB6pVxnCh_M1LvYEQs3KU',
		})
		.then((token) => {
			cb(token);
		})
		.catch((e) => {
			// chặn thông báo ra trình duyệt
			cb(false);
			// up date UI
		});
};

export const onMessageListener = (messaging, cb) =>
	messaging.onMessage((payload) => {
		cb(payload);
	});
