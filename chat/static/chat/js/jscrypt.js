
//	    	JavaScrypt  --  Main page support functions

//	    For details, see http://www.fourmilab.ch/javascrypt/

var loadTime = (new Date()).getTime();  // Save time page was loaded
var key;	    	    	    	    // Key (byte array)
var prng;	    	    	    	    // Pseudorandom number generator
    
//	setKey  --  Set key from string or hexadecimal specification

function setKey(keystr) {
    var s = keystr;
    var hexDigits = "0123456789abcdefABCDEF";
    var hs = "", i, bogus = false;

    for (i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (hexDigits.indexOf(c) >= 0) {
                hs += c;
        } else {
            bogus = true;
        }
    }
    if (bogus) {
        alert("Error: Non-Hexadecimal character(s) found in Hexadecimal key.");
    }
    if (hs.length > (keySizeInBits / 4)) {
        alert("Warning: hexadecimal key exceeds " +
        (keySizeInBits / 4) + " digit maximum; truncated.");
        hs = hs.slice(0, 64);
    } else {
        //  If key is fewer than 64 hex digits, fill it with zeroes
        while (hs.length < (keySizeInBits / 4)) {
            hs += "0";
        }
    }
    key =  hexToByteArray(hs);
}

/*	Generate a key from the pseudorandom number generator
    and stuff it in the key field.  The kind of key generated
(text or hexadecimal) is determined by which box is checked
below the key field.
Returns a 256 bit / 32 Byte key.
*/

function Generate_key() {
    var i, j, k = "";
    addEntropyTime();
    var seed = keyFromEntropy();
    
    var prng = new AESprng(seed);
    // Hexadecimal key
    var hexDigits = "0123456789abcdef";
    
    for (i = 0; i < 64; i++) {
        k += hexDigits.charAt(prng.nextInt(15));
    }
    return k;
}

//takes plaintext and a hex key, returns a hex string ciphertext
function Encrypt_Text(plaintext, keystr) {
    if (keystr.length == 0) {
        alert("Please specify a key.");
        return "";
    }
    if (plaintext.length == 0) {
        alert("Nothing to encrypt!");
        return "";
    }
    setKey(keystr);
    addEntropyTime();
    prng = new AESprng(keyFromEntropy());
    var v = "";
    
	for(var i=0; i<plaintext.length % 16; i++) //pad with null to blocks of 16bytes
        plaintext += '\0';
    
    var ct = rijndaelEncrypt(plaintext, key, "CBC");
    var hex_str = byteArrayToHex(ct);
    var out_str = "";
    hex_str = hex_str.split('');
    for(var i=0; i<hex_str.length; i++) {
		if(i % 64 == 0 && i > 0) out_str += '\n';
		out_str += hex_str[i];
    }
    
    delete prng;
    return out_str;
}

//takes a hex string ciphertext and hex key and returns string plaintext
function Decrypt_Text(ciphertext, keystr) {
    if (keystr.length == 0) {
        alert("Please specify a key with which to decrypt the message.");
        return "";
    }
    if (ciphertext.length == 0) {
        alert("Nothing to decrypt!");
        return "";
    }
    setKey(keystr);
    
    var array = hexToByteArray(ciphertext);
    var result = rijndaelDecrypt(array, key, "CBC");
    
    var char_str = "";
    for(var i=0; i<result.length; i++) {
        char_str += String.fromCharCode(result[i])+" ";
    }
    
    var plaintext = "";
    
    for (var i = 0; i < result.length; i++) {
        plaintext += String.fromCharCode(result[i]);
    }
    //remove all null chars from end of output
    plaintext = plaintext.replace(/\0*$/g, "");
    
    if(!plaintext) return "";
    return plaintext;
}
