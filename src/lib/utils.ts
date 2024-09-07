// Date: 2021/09/06
type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];

// 日付をフォーマットする
export function formatDate(date: string, dateStyle: DateStyle = 'medium', locales = 'ja-JP') {
	const dateToFormat = new Date(date.replaceAll('-', '/'));
	const dateFormatter = new Intl.DateTimeFormat(locales, { dateStyle });
	return dateFormatter.format(dateToFormat);
}
