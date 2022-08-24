

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
	return new Date(to_ms(s)).toLocaleString().replaceAll('/', '-')
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
	let now = Date.now()
	let today = now - now % 86400000

	callbackSetList([
		{
			title: '当前时间：' + to_second(now),
			description: format_datetime(now),
			value: to_second(now)
		},
		{
			title: '今日零点：' + to_second(today),
			description: format_datetime(today),
			value: to_second(today)
		}
	])
}

function on_search(action, searchWord, callbackSetList) {
	if (!searchWord) {
		on_enter(action, callbackSetList)
		return
	}

	let isInt = searchWord.match(/^\d+$/g)
	if (isInt) {
		callbackSetList([
			{
				title: '时间：' + format_datetime(Number(searchWord)),
				description: format_duaration_to_now(to_second(Number(searchWord))),
				value: format_datetime(Number(searchWord))
			}
		])
		return
	}

	let isDatetime = searchWord.match(/^\d{4}.\w+.\w+/g)
	if (isDatetime) {
		let nums = searchWord.match(/\d+/g)
		let year = nums[0]
		let month = nums[1]
		let day = nums[2]
		let hour = nums.length > 3 ? nums[3] : 0
		let minite = nums.length > 4 ? nums[4] : 0
		let second = nums.length > 5 ? nums[5] : 0

		let time = new Date(year, month - 1, day, hour, minite, second).getTime()
		callbackSetList([
			{
				title: '时间戳：' + to_second(time),
				description: format_duaration_to_now(to_second(time)),
				value: to_second(time)
			}
		])

		return
	}

}

function on_select(action, itemData, callbackSetList) {
	utools.copyText(itemData.value)
	utools.showNotification('已复制: ' + itemData.value)
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