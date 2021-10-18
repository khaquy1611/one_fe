import { parseQueryStringToObjectStc, parseObjToQueryString, pickObj } from './helpers';

test('should return {} because not have query', () => {
	expect(parseQueryStringToObjectStc('')).toStrictEqual({});
});
test('should return {} because queryString is array', () => {
	expect(parseQueryStringToObjectStc([1, 3])).toStrictEqual({});
});
test('should return {} because queryString is object', () => {
	expect(parseQueryStringToObjectStc({ name: 1, age: 2 })).toStrictEqual({});
});
test('should return {code:"abc" , status:"1"}', () => {
	expect(parseQueryStringToObjectStc('code==abc;status==1')).toStrictEqual({ code: 'abc', status: '1' });
});
test('should return {code:"abc" , status:"1" , coupon}', () => {
	expect(parseQueryStringToObjectStc('status==1;couponId=in=(150)')).toStrictEqual({ code: 'abc', status: '1' });
});
test('should return "name==a;code==b"', () => {
	expect(parseObjToQueryString({ name: 'a', code: 'b' })).toStrictEqual('name==a;code==b');
});
test('should return null string', () => {
	expect(parseObjToQueryString(123)).toStrictEqual('');
});
test('should return name==*ab*;code==0', () => {
	expect(parseObjToQueryString({ name: '*ab*', status: '', code: '0', x: 0, y: null, z: undefined })).toStrictEqual(
		'name==*ab*;code==0',
	);
});
test('should return {name:"sy"}', () => {
	expect(pickObj({ name: 'sy', age: 21, address: { street: 21, home: 'tt' } }, ['name'])).toStrictEqual({
		name: 'sy',
	});
});
test('should return {name:"sy" , home:"tt"}', () => {
	expect(pickObj({ name: 'sy', age: 21, address: { street: 21, home: 'tt' } }, ['name', 'home'])).toStrictEqual({
		home: 'tt',
		name: 'sy',
	});
});
