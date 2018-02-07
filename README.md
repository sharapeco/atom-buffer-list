Buffer List
================================================================

Buffer list like Emacs or xyzzy, which can save/close documents.

<img alt="[Screencast]" src="https://raw.githubusercontent.com/sharapeco/github-images/master/buffer-list/buffer-list.gif" width="375">


Features
----------------------------------------------------------------

* Show list of opening documents
* Save and/or close marked documents


Configuration
----------------------------------------------------------------

Add your keymap.cson like this:

```
'atom-workspace':
	'ctrl-x ctrl-b': 'buffer-list:show'
```


Usage
----------------------------------------------------------------

* Up/down to move cursor
* Enter/O to <u>o</u>pen the file
* S key to mark as <u>s</u>ave it
* D key to mark as close (<u>d</u>elete) it
* U key to <u>u</u>nmark
* X key to e<u>x</u>ecute marked operations


### Default keybindings

```
'.buffer-list':
	'j': 'core:move-down'
	'k': 'core:move-up'
	'd': 'buffer-list:mark-as-delete'
	's': 'buffer-list:mark-as-save'
	'u': 'buffer-list:unmark'
	'x': 'buffer-list:execute'
	'o': 'buffer-list:open-selected'
	'enter': 'buffer-list:open-selected'
	'ctrl-v': 'core:page-down'

':not(.platform-darwin) .buffer-list':
	'alt-v': 'core:page-up'

'.platform-darwin .buffer-list':
	'cmd-v': 'core:page-up'
```
