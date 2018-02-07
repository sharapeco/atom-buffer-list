/** @babel */

import BufferListView from './buffer-list-view'
import { CompositeDisposable } from 'atom'

const BufferListURI = "atom://buffer-list"

export default {

	subscriptions: null,

	activate (state) {
		atom.workspace.addOpener((URI) => {
			if (URI === BufferListURI) {
				const bufferListView = new BufferListView({URI: BufferListURI})
				console.log("addOpener callback called")
				return bufferListView;
			}
		})

		this.subscriptions = new CompositeDisposable()
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			"buffer-list:show": () => this.show()
		}))
	},

	deactivate () {
	},

	serialize () {
		return {}
	},

	show () {
		atom.workspace.open(BufferListURI)
		.done((view) => view.initialize() )
	}

};
