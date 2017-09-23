// Return array of index
export function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

export function getIndicesOfRegex(searchStr, str, caseSensitive) {
  var searchStrLen  = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }

  var indices = [];
  var result;
  var regex = new RegExp(searchStr, "g");

  if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
  }
  while (result = regex.exec(str)) {
    indices.push(result.index);
  }
  return indices;
}
