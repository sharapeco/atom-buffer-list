/** @babel */
/** @jsx etch.dom */

const etch = require("etch")

export default class BufferListView {

	// ----------------------------------------------------------------
	// Lifecycle methods:

	constructor (props) {
		this.destroyed = false
		this.cursor = -1
		this.items = []

		props = props || {}
		Object.keys(props).forEach((key) => {
			this[key] = props[key]
		})

		etch.initialize(this)

		const {Disposable, CompositeDisposable} = require("atom")
		this.disposables = new CompositeDisposable()
		this.disposables.add(atom.commands.add(this.element, {
			"core:move-up": () => this.selectPrevious(),
			"core:move-down": () => this.selectNext(),
			"core:page-up": () => this.pageUp(),
			"core:page-down": () => this.pageDown(),
			"core:move-to-top": () => this.selectFirst(),
			"core:move-to-bottom": () => this.selectLast(),
			"buffer-list:mark-as-save": () => this.markAsSave(),
			"buffer-list:mark-as-delete": () => this.markAsDelete(),
			"buffer-list:unmark": () => this.unmark(),
			"buffer-list:execute": () => this.execute(),
			"buffer-list:open-selected": () => this.openItem()
		}))

		const clickHandler = (event) => {
			const target = event.target.closest(".buffer-list-item")
			if (target) {
				this.setCursor(target.index)
			}
		}
		this.element.addEventListener("click", clickHandler)
		this.disposables.add(new Disposable(() => this.element.removeEventListener("click", clickHandler)))
	}

	render () {
		let itemNodes = this.items.map((item, index) => {
			return (
				<div className={"buffer-list-item" + (item.selected ? " selected" : "") + (item.modified ? " modified" : "")} index={index}>
					<div className="buffer-list-marker">
						<span className={"save-mark icon icon-move-down text-info " + (item.saveMark ? "" : "hide")}></span>
						<span className={"delete-mark icon icon-remove-close text-warning " + (item.deleteMark ? "" : "hide")}></span>
					</div>
					<div className="buffer-list-name">{item.name}</div>
					<div className="buffer-list-path">{item.path}</div>
				</div>
			)
		})
		return (
			<div className="buffer-list pane-item" tabIndex="-1">
				<div className="buffer-list-content">
					<div className="buffer-list-items">
						{itemNodes}
					</div>
				</div>
				<div className="buffer-list-legend">
					<div className="buffer-list-legend-header">
						Marks:
					</div>
					<div className="buffer-list-legend-item">
						<span className="icon icon-move-down text-info"></span>
						<span>Save</span>
					</div>
					<div className="buffer-list-legend-item">
						<span className="icon icon-remove-close text-warning"></span>
						<span>Close buffer</span>
					</div>
				</div>
			</div>
		)
	}

	serialize() {
		return {}
	}

	async update () {
		await etch.update(this)
	}

	async destroy () {
		this.destroyed = true
		this.disposables.dispose()

		await etch.destroy(this)
	}

	getTitle () {
		return "Buffer List"
	}

	getIconName () {
		return "list-unordered"
		// return "book"
	}

	getURI () {
		return this.URI
	}

	getElement() {
		return this.element
	}

	// ----------------------------------------------------------------
	// Application methods:

	initialize () {
		this.cursor = -1
		this.items = atom.workspace.getTextEditors().map((editor) => {
			return {
				selected: false,
				deleteMark: false,
				saveMark: false,
				name: editor.getTitle(),
				path: this.prettyPath(editor.getPath() || ""),
				modified: editor.isModified(),
				editor: editor
			}
		})
		this.items.sort((x, y) => {
			if (x.path === y.path) {
				if (x.path === "") {
					if (x.name === y.name) return 0
					return (x.name < y.name) ? -1 : 1
				}
				return 0
			}
			return (x.path < y.path) ? -1 : 1
		})
		this.update().done(() => {
			this.setCursor(0)
		})
	}

	prettyPath (path) {
		let homeDir = process.env.HOME
		if (homeDir && path.indexOf(homeDir) === 0) {
			path = "~" + path.substr(homeDir.length)
		}
		return path
	}

	setCursor (point) {
		if (point < 0 || point >= this.items.length) {
			return
		}
		if (this.cursor === point) {
			return
		}

		let prevItem = this.items[this.cursor]
		if (prevItem) {
			prevItem.selected = false
		}

		this.items[point].selected = true
		this.cursor = point

		this.update().done(() => this.fixCursorPosition(this.cursor))
	}

	fixCursorPosition (point) {
		const contentEl = this.element.querySelector(".buffer-list-content")
		const style = document.defaultView.getComputedStyle(contentEl, null)
		const paddingTop = parseInt(style.paddingTop, 10)
		const window = {
			top: contentEl.scrollTop,
			bottom: contentEl.scrollTop + contentEl.clientHeight,
		}
		const itemHeight = contentEl.querySelector(".buffer-list-item").clientHeight
		const item = {
			top: point * itemHeight + paddingTop,
			bottom: (point + 1) * itemHeight + paddingTop,
		}
		if (item.bottom > window.bottom) {
			let offset = item.bottom - window.bottom
			window.top += offset
			window.bottom += offset
		}
		if (item.top < window.top) {
			let offset = item.top - window.top
			window.top += offset
			// window.bottom -= offset
		}
		contentEl.scrollTop = window.top
	}

	selectPrevious () {
		if (this.cursor > 0) {
			this.setCursor(this.cursor - 1)
		}
	}

	selectNext () {
		if (this.cursor < this.items.length - 1) {
			this.setCursor(this.cursor + 1)
		}
	}

	selectFirst () {
		this.setCursor(0)
	}

	selectLast () {
		this.setCursor(this.items.length - 1)
	}

	getBoxHeight (el) {
		const style = document.defaultView.getComputedStyle(el, null)
		return el.clientHeight + parseInt(style.paddingTop, 10) + parseInt(style.paddingBottom, 10)
	}

	pageUp () {
		const contentEl = this.element.querySelector(".buffer-list-content")
		const contentHeight = this.getBoxHeight(contentEl)
		const itemHeight = contentEl.querySelector(".buffer-list-item").clientHeight
		const linesPerWindow = ~~(contentHeight / itemHeight)

		contentEl.scrollTop = Math.max(contentEl.scrollTop - contentHeight, 0)
		this.setCursor(Math.max(this.cursor - linesPerWindow, 0))
	}

	pageDown () {
		const contentEl = this.element.querySelector(".buffer-list-content")
		const contentHeight = this.getBoxHeight(contentEl)
		const verticalPadding = contentHeight - contentEl.clientHeight
		const scrollHeight = Math.max(contentEl.querySelector(".buffer-list-items").clientHeight - contentEl.clientHeight + verticalPadding, 0)
		const itemHeight = contentEl.querySelector(".buffer-list-item").clientHeight
		const linesPerWindow = ~~(contentHeight / itemHeight)

		contentEl.scrollTop = Math.min(contentEl.scrollTop + contentHeight, scrollHeight)
		this.setCursor(Math.min(this.cursor + linesPerWindow, this.items.length - 1))
	}

	markAsSave () {
		const point = this.cursor
		if (point < 0 || point >= this.items.length) {
			return
		}

		const item = this.items[point]
		item.saveMark = true

		this.selectNext()
		this.update()
	}

	markAsDelete () {
		const point = this.cursor
		if (point < 0 || point >= this.items.length) {
			return
		}

		const item = this.items[point]
		item.deleteMark = true

		this.selectNext()
		this.update()
	}

	unmark () {
		const point = this.cursor
		if (point < 0 || point >= this.items.length) {
			return
		}

		const item = this.items[point]
		item.saveMark = false
		item.deleteMark = false

		this.selectNext()
		this.update()
	}

	execute () {
		const saveItems = this.items.filter((item) => item.saveMark)
		const deleteItems = this.items.filter((item) => item.deleteMark)

		saveItems.forEach((item) => {
			item.editor.save()
		})

		deleteItems.forEach((item) => {
			item.editor.destroy()
		})

		if (saveItems.length + deleteItems.length > 0) {
			this.initialize()
		}
	}

	openItem () {
		let item = this.items[this.cursor]
		if (!item) {
			return
		}
		atom.workspace.open(item.editor.getPath())
	}
}
