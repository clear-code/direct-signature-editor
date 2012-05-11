/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is "Direct Signature Editor".
 *
 * The Initial Developer of the Original Code is ClearCode Inc.
 * Portions created by the Initial Developer are Copyright (C) 2012
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): ClearCode Inc. <info@clear-code.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("resource://direct-signature-editor-modules/prefs.js");
Components.utils.import("resource://direct-signature-editor-modules/textIO.jsm");

var DirectSignatureEditor = {
	domain : 'extensions.direct-signature-editor@clear-code.com.',

	get AccountManager()
	{
		return this._AccountManager ||
			(this._AccountManager = Components.classes['@mozilla.org/messenger/account-manager;1']
										.getService(Components.interfaces.nsIMsgAccountManager));
	},
	_AccountManager : null,

	get allIdentities()
	{
		var returnValue = [];
		var identities = this.AccountManager.allIdentities;
		for (var i = 0, maxi = identities.Count(), identity; i < maxi; i++)
		{
			identity = identities.QueryElementAt(i, Components.interfaces.nsIMsgIdentity);
			returnValue.push(identity);
		}
		return returnValue;
	},

	get identity()
	{
		if (!this._identity && this.id) {
			this._identity = this.AccountManager.getIdentity(this.id);
		}
		return this._identity;
	},
	_identity : null,

	get HTMLCheck()
	{
		return document.getElementById('html-type-checkbox');
	},

	get field()
	{
		return document.getElementById('editor-field');
	},

	get id()
	{
		return prefs.getPref(this.domain + 'identity') ||
				this.AccountManager.defaultAccount.defaultIdentity.key;
	},

	init : function()
	{
		window.removeEventListener('DOMContentLoaded', this, false);
		window.addEventListener('unload', this, false);

		this.load();
		this.field.focus();
	},

	save : function()
	{
		this.identity.htmlSigFormat = this.HTMLCheck.checked;

		var value = this.field.value || '';
		if (value != this.initialState) {
			if (this.identity.attachSignature) {
				textIO.writeTo(value, this.identity.signature, 'UTF-8');
			}
			else {
				this.identity.htmlSigText = value;
			}
		}
	},

	load : function()
	{
		this.HTMLCheck.checked = this.identity.htmlSigFormat;

		if (this.identity.attachSignature) {
			this.initialState = textIO.readFrom(this.identity.signature, 'UTF-8');
			this.HTMLCheck.hidden = true;
		}
		else {
			this.initialState = this.identity.htmlSigText;
			this.HTMLCheck.hidden = false;
		}
		this.field.value = this.initialState;
	},


	handleEvent : function(aEvent)
	{
		switch (aEvent.type)
		{
			case 'DOMContentLoaded':
				return this.init();
			case 'unload':
				return this.onUnload();
		}
	},

	onUnload : function()
	{
		window.removeEventListener('unload', this, false);
	},

	onAccept : function()
	{
		this.save();
		window.close();
	},

	onCancel : function()
	{
		window.close();
	}
};

window.addEventListener('DOMContentLoaded', DirectSignatureEditor, false);
