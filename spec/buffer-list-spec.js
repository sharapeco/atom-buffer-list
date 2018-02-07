'use babel';

import BufferList from '../lib/buffer-list';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('BufferList', () => {
	let workspaceElement, activationPromise;

	beforeEach(() => {
		workspaceElement = atom.views.getView(atom.workspace);
		activationPromise = atom.packages.activatePackage('buffer-list');
	});

	describe('when the buffer-list:open event is triggered', () => {
		it('open the modal list', () => {
			// Before the activation event the view is not on the DOM, and no panel
			// has been created
			expect(workspaceElement.querySelector('.buffer-list')).not.toExist();

			// This is an activation event, triggering it will cause the package to be
			// activated.
			atom.commands.dispatch(workspaceElement, 'buffer-list:open');

			waitsForPromise(() => {
				return activationPromise;
			});

			runs(() => {
				expect(workspaceElement.querySelector('.buffer-list')).toExist();

				let atomBufferListElement = workspaceElement.querySelector('.buffer-list');
				expect(atomBufferListElement).toExist();

				let atomBufferListPanel = atom.workspace.panelForItem(atomBufferListElement);
				expect(atomBufferListPanel.isVisible()).toBe(true);
			});
		});
	});
});
