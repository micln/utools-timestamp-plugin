
function is_timestamp(s) {
	return s.match(/^\d+$/g)
}

function is_datetime(s) {
	return s.match(/^\d{4}.\d+.\d+/g)
}

function to_second(s) {
	return Math.floor(to_ms(s) / 1000)
}

function to_ms(s) {
	if (s < 10000000000) {
		s *= 1000
	}
	return s
}

function format_datetime(s) {
	return new Date(to_ms(s)).toLocaleString().replaceAll('/', '-').replaceAll(/\b\d{1}\b/g, '0$&')
}

function format_date(s) {
	return new Date(to_ms(s)).toLocaleDateString().replaceAll('/', '-').replaceAll(/\b\d{1}\b/g, '0$&')
}

// second
function format_duaration(s) {
	s = Math.abs(s)
	let dur_mod = [60, 60, 24, 1 << 50]
	let dur_txt = ['秒', '分', '小时', '天']
	let texts = []
	for (let i = 0; i < dur_mod.length; i++) {
		let dur = s % dur_mod[i];
		s = Math.floor(s / dur_mod[i]);
		if (dur > 0) {
			texts.push(dur + dur_txt[i])
		}
	}
	return texts.reverse().join('')
}

function format_duaration_to_now(s) {
	s = to_second(s)
	let now = to_second(Date.now())
	if (s < now) {
		return '已经过去了：' + format_duaration(now - s)
	} else {
		return '离现在还有：' + format_duaration(s - now)
	}
}

function on_enter(action, callbackSetList) {
	let input = ''
	if (action.payload) {
		input = action.payload
		action.payload = ''
	}

	if (input && (is_timestamp(input) || is_datetime(input))) {
		setTimeout(() => { utools.setSubInputValue(input) }, 0)
		on_search(action, input, callbackSetList)
		return
	}

	let datetime = new Date();
	let ts_now = datetime.getTime();

	datetime.setHours(0);
	datetime.setMinutes(0);
	datetime.setSeconds(0);
	datetime.setMilliseconds(0);
	let ts_today = datetime.getTime();

	callbackSetList([
		{
			title: '此刻：' + to_second(ts_now),
			description: format_datetime(ts_now),
			value: to_second(ts_now)
		},
		{
			title: '零点：' + to_second(ts_today),
			description: format_datetime(ts_today),
			value: to_second(ts_today)
		},
		{
			title: '复制时间',
			description: format_datetime(ts_now),
			value: format_datetime(ts_now)
		},
		{
			title: '复制零点',
			description: format_datetime(ts_today),
			value: format_datetime(ts_today)
		},
		{
			title: '复制日期',
			description: format_date(ts_today),
			value: format_date(ts_today)
		}
	])
}

function on_search(action, searchWord, callbackSetList) {
	if (!searchWord) {
		on_enter(action, callbackSetList)
		return
	}

	if (is_timestamp(searchWord)) {
		callbackSetList([
			{
				title: '时间：' + format_datetime(Number(searchWord)),
				description: format_duaration_to_now(to_second(Number(searchWord))),
				value: format_datetime(Number(searchWord))
			}
		])
		return
	}

	if (is_datetime(searchWord)) {
		let nums = searchWord.match(/\d+/g)
		let year = nums[0]
		let month = nums[1]
		let day = nums[2]
		let hour = nums.length > 3 ? nums[3] : 0
		let minite = nums.length > 4 ? nums[4] : 0
		let second = nums.length > 5 ? nums[5] : 0

		let ts_now = new Date(year, month - 1, day, hour, minite, second).getTime()
		callbackSetList([
			{
				title: '时间戳：' + to_second(ts_now),
				description: format_duaration_to_now(to_second(ts_now)),
				value: to_second(ts_now)
			}
		])

		return
	}

	callbackSetList([
		{
			title: '暂不支持的格式',
			description: '欢迎评论或反馈到 github.com/micln/utools-timestamp-plugin （点击复制）',
			value: 'github.com/micln/utools-timestamp-plugin'
		}
	])
}

function on_select(action, itemData, callbackSetList) {
	utools.copyText(itemData.value)
	utools.showNotification('已复制: ' + itemData.value)
	utools.hideMainWindow()
}

window.exports = {
	"time": {
		mode: "list",
		args: {
			// 进入插件应用时调用（可选）
			enter: on_enter,
			// 子输入框内容变化时被调用 可选 (未设置则无搜索)
			search: on_search,
			// 用户选择列表中某个条目时被调用
			select: on_select,
			// 子输入框为空时的占位符，默认为字符串"搜索"
			placeholder: "输入日期（时间戳 " + to_second(Date.now()) + "  或 日期 " + format_datetime(to_second(Date.now())) + '）'
		}
	}
}