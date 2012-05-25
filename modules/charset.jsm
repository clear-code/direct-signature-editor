/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// http://mxr.mozilla.org/comm-central/source/mozilla/xpcom/string/src/nsReadableUtils.cpp#441

var EXPORTED_SYMBOLS = ['isUTF8', 'isUTF16'];

Components.utils.import('resource://direct-signature-editor-modules/UTF8traits.jsm');

function isUTF8(aString, aRejectNonChar)
{
	var state = 0;
	var overlong = false;
	var surrogate = false;
	var nonchar = false;
	var olupper = 0; // overlong byte upper bound.
	var slower = 0;  // surrogate byte lower bound.

	var pos = 0;
	var end = aString.length - 1;
	while (pos < end)
	{
		let c;
		if (0 == state) {
			c = aString.charCodeAt(pos++);
			if (isASCII(c))
				continue;

			if ( c <= 0xC1 ) { // [80-BF] where not expected, [C0-C1] for overlong.
				return false;
			}
			else if (is2byte(c)) {
				state = 1;
			}
			else if (is3byte(c)) {
				state = 2;
				if (c == 0xE0) { // to exclude E0[80-9F][80-BF]
					overlong = true;
					olupper = 0x9F;
				}
				else if (c == 0xED) { // ED[A0-BF][80-BF] : surrogate codepoint
					surrogate = true;
					slower = 0xA0;
				}
				else if (c == 0xEF) { // EF BF [BE-BF] : non-character
					nonchar = true;
				}
			}
			else if (c <= 0xF4) { // XXX replace /w UTF8traits::is4byte when it's updated to exclude [F5-F7].(bug 199090)
				state = 3;
				nonchar = true;
				if (c == 0xF0) { // to exclude F0[80-8F][80-BF]{2}
					overlong = true;
					olupper = 0x8F;
				}
				else if (c == 0xF4) { // to exclude F4[90-BF][80-BF] 
					// actually not surrogates but codepoints beyond 0x10FFFF
					surrogate = true;
					slower = 0x90;
				}
			}
			else {
				return false; // Not UTF-8 string
			}
		}

		if (nonchar && !aRejectNonChar)
			nonchar = false;

		while (pos < end && state)
		{
			c = aString.charCodeAt(pos++);
			--state;

			// non-character : EF BF [BE-BF] or F[0-7] [89AB]F BF [BE-BF]
			if (nonchar &&
				((!state && c < 0xBE) ||
				 (state == 1 && c != 0xBF) ||
				 (state == 2 && 0x0F != (0x0F & c))))
				nonchar = false;

			if (!isInSeq(c) || (overlong && c <= olupper ) ||
				(surrogate && slower <= c) || (nonchar && !state))
				return false; // Not UTF-8 string

			overlong = surrogate = false;
		}
	}
	return !state; // state != 0 at the end indicate
}

// http://mxr.mozilla.org/comm-central/source/mailnews/compose/src/nsMsgCompose.cpp#4139
function isUTF16(aString)
{
	return (aString.length % 2 == 0 && aString.length >= 2 &&
			((aString.charCodeAt(0) == 0xFE && aString.charCodeAt(1) == 0xFF) ||
			 (aString.charCodeAt(0) == 0xFF && aString.charCodeAt(1) == 0xFE)));
}
