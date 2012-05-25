/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// http://mxr.mozilla.org/comm-central/source/mozilla/xpcom/string/public/nsUTF8Utils.h#17

var EXPORTED_SYMBOLS = ['isASCII', 'isInSeq', 'is2byte', 'is3byte'];

function isASCII(aCharCode)
{
	return (aCharCode & 0x80) == 0x00;
}

function isInSeq(aCharCode)
{
	return (aCharCode & 0xC0) == 0x80;
}

function is2byte(aCharCode)
{
	return (aCharCode & 0xE0) == 0xC0;
}

function is3byte(aCharCode)
{
	return (aCharCode & 0xF0) == 0xE0;
}
