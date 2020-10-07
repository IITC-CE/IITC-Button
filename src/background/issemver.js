/*!
 * isSemVer - v0.1 - 9/05/2010
 * http://benalman.com/
 * http://semver.org/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Compare one or more semantic version numbers to a reference version number.
//
// Returns true if all version criteria are met. Comparison operator defaults
// to == if omitted. Valid comparisons are == != < <= > >=.
//
// isSemVer( my.version, '1.2.3' ) // == is assumed if comparison op excluded
// isSemVer( my.version, '>= 1.2.3', '!= 1.2.4alpha' )
// isSemVer( my.version, '< 2.0', '!= 1.2.3', '!= 1.2.4alpha' )
//
export var isSemVer = (function() {
  // This regexp matches an optional comparison operator, followed by optional
  // whitespace and then a valid semantic version per http://semver.org/.
  var re = /^(<|>|[=!<>]=)?\s*(\d+(?:\.\d+){0,2})([a-z][a-z0-9-]*)?$/i;

  // Returns a value that can be used in version comparison. Because a semantic
  // version is comprised of 1 to 3 dot-separated numbers followed by an
  // optional lexicographically-sorted alphanumeric suffix, it is easiest to
  // convert the entire value into a single string that can be compared in a
  // lexicographic fashion. Each dot-separated number is first left-padded by
  // zeroes such that 1.2.3 -> 000000010000000200000003. This allows possible
  // major / minor / patch versions between 0-99999999. The optional suffix is
  // then appended, and if one was not provided, ~ will be used because it will
  // always compare > than any suffix.
  //
  // If the include_cmp flag is set, the result value will be prepended with
  // the specified comparison operator (or == if the operator was omitted).
  function get_val(str, include_cmp) {
    // matches[1] = optional comparison operator.
    // matches[2] = dot-separated major / minor / patch version.
    // matches[3] = alphanumeric "special version" suffix.
    var matches = (str + "").match(re);

    return matches
      ? // Include matched comparison operator, defaulting to == if necessary.
        (include_cmp ? matches[1] || "==" : "") +
          // Since this string is going to be evaled, wrap it in quotes.
          '"' +
          // In case version passed is like 1 or 1.0, right-pad it with extra .0
          (matches[2] + ".0.0")
            // Remove any unnecessary trailing .0
            .match(/\d+(?:\.\d+){0,2}/)[0]
            // Replace each dot-separated number with a 0-padded value.
            .replace(/(?:^|\.)(\d+)/g, function(a, b) {
              return Array(9 - b.length).join(0) + b;
            }) +
          // Append suffix or ~ if suffix was omitted.
          (matches[3] || "~") +
          // Since this string is going to be evaled, wrap it in quotes.
          '"'
      : // Handle an invalid semantic version / comparison.
      include_cmp
      ? "==0"
      : 1;
  }

  return function(base_ver) {
    // Get the comparison value for the base version.
    base_ver = get_val(base_ver);

    // Iterate over all additional function arguments.
    for (var arg, i = 1; (arg = arguments[i++]); ) {
      // If any comparison fails, exit immediately with a false value.
      if (!new Function("return " + base_ver + get_val(arg, 1))()) {
        return false;
      }
    }

    // All comparisons passed, return true!
    return true;
  };
})();
