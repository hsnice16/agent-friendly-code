#!/usr/bin/env node
require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 298:
/***/ ((module) => {

// A simple implementation of make-array
function makeArray (subject) {
  return Array.isArray(subject)
    ? subject
    : [subject]
}

const UNDEFINED = undefined
const EMPTY = ''
const SPACE = ' '
const ESCAPE = '\\'
const REGEX_TEST_BLANK_LINE = /^\s+$/
const REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/
const REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/
const REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/
const REGEX_SPLITALL_CRLF = /\r?\n/g

// Invalid:
// - /foo,
// - ./foo,
// - ../foo,
// - .
// - ..
// Valid:
// - .foo
const REGEX_TEST_INVALID_PATH = /^\.{0,2}\/|^\.{1,2}$/

const REGEX_TEST_TRAILING_SLASH = /\/$/

const SLASH = '/'

// Do not use ternary expression here, since "istanbul ignore next" is buggy
let TMP_KEY_IGNORE = 'node-ignore'
/* istanbul ignore else */
if (typeof Symbol !== 'undefined') {
  TMP_KEY_IGNORE = Symbol.for('node-ignore')
}
const KEY_IGNORE = TMP_KEY_IGNORE

const define = (object, key, value) => {
  Object.defineProperty(object, key, {value})
  return value
}

const REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g

const RETURN_FALSE = () => false

// Sanitize the range of a regular expression
// The cases are complicated, see test cases for details
const sanitizeRange = range => range.replace(
  REGEX_REGEXP_RANGE,
  (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0)
    ? match
    // Invalid range (out of order) which is ok for gitignore rules but
    //   fatal for JavaScript regular expression, so eliminate it.
    : EMPTY
)

// See fixtures #59
const cleanRangeBackSlash = slashes => {
  const {length} = slashes
  return slashes.slice(0, length - length % 2)
}

// > If the pattern ends with a slash,
// > it is removed for the purpose of the following description,
// > but it would only find a match with a directory.
// > In other words, foo/ will match a directory foo and paths underneath it,
// > but will not match a regular file or a symbolic link foo
// >  (this is consistent with the way how pathspec works in general in Git).
// '`foo/`' will not match regular file '`foo`' or symbolic link '`foo`'
// -> ignore-rules will not deal with it, because it costs extra `fs.stat` call
//      you could use option `mark: true` with `glob`

// '`foo/`' should not continue with the '`..`'
const REPLACERS = [

  [
    // Remove BOM
    // TODO:
    // Other similar zero-width characters?
    /^\uFEFF/,
    () => EMPTY
  ],

  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a ) -> (a)
    // (a \ ) -> (a  )
    /((?:\\\\)*?)(\\?\s+)$/,
    (_, m1, m2) => m1 + (
      m2.indexOf('\\') === 0
        ? SPACE
        : EMPTY
    )
  ],

  // Replace (\ ) with ' '
  // (\ ) -> ' '
  // (\\ ) -> '\\ '
  // (\\\ ) -> '\\ '
  [
    /(\\+?)\s/g,
    (_, m1) => {
      const {length} = m1
      return m1.slice(0, length - length % 2) + SPACE
    }
  ],

  // Escape metacharacters
  // which is written down by users but means special for regular expressions.

  // > There are 12 characters with special meanings:
  // > - the backslash \,
  // > - the caret ^,
  // > - the dollar sign $,
  // > - the period or dot .,
  // > - the vertical bar or pipe symbol |,
  // > - the question mark ?,
  // > - the asterisk or star *,
  // > - the plus sign +,
  // > - the opening parenthesis (,
  // > - the closing parenthesis ),
  // > - and the opening square bracket [,
  // > - the opening curly brace {,
  // > These special characters are often called "metacharacters".
  [
    /[\\$.|*+(){^]/g,
    match => `\\${match}`
  ],

  [
    // > a question mark (?) matches a single character
    /(?!\\)\?/g,
    () => '[^/]'
  ],

  // leading slash
  [

    // > A leading slash matches the beginning of the pathname.
    // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
    // A leading slash matches the beginning of the pathname
    /^\//,
    () => '^'
  ],

  // replace special metacharacter slash after the leading slash
  [
    /\//g,
    () => '\\/'
  ],

  [
    // > A leading "**" followed by a slash means match in all directories.
    // > For example, "**/foo" matches file or directory "foo" anywhere,
    // > the same as pattern "foo".
    // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
    // >   under directory "foo".
    // Notice that the '*'s have been replaced as '\\*'
    /^\^*\\\*\\\*\\\//,

    // '**/foo' <-> 'foo'
    () => '^(?:.*\\/)?'
  ],

  // starting
  [
    // there will be no leading '/'
    //   (which has been replaced by section "leading slash")
    // If starts with '**', adding a '^' to the regular expression also works
    /^(?=[^^])/,
    function startingReplacer () {
      // If has a slash `/` at the beginning or middle
      return !/\/(?!$)/.test(this)
        // > Prior to 2.22.1
        // > If the pattern does not contain a slash /,
        // >   Git treats it as a shell glob pattern
        // Actually, if there is only a trailing slash,
        //   git also treats it as a shell glob pattern

        // After 2.22.1 (compatible but clearer)
        // > If there is a separator at the beginning or middle (or both)
        // > of the pattern, then the pattern is relative to the directory
        // > level of the particular .gitignore file itself.
        // > Otherwise the pattern may also match at any level below
        // > the .gitignore level.
        ? '(?:^|\\/)'

        // > Otherwise, Git treats the pattern as a shell glob suitable for
        // >   consumption by fnmatch(3)
        : '^'
    }
  ],

  // two globstars
  [
    // Use lookahead assertions so that we could match more than one `'/**'`
    /\\\/\\\*\\\*(?=\\\/|$)/g,

    // Zero, one or several directories
    // should not use '*', or it will be replaced by the next replacer

    // Check if it is not the last `'/**'`
    (_, index, str) => index + 6 < str.length

      // case: /**/
      // > A slash followed by two consecutive asterisks then a slash matches
      // >   zero or more directories.
      // > For example, "a/**/b" matches "a/b", "a/x/b", "a/x/y/b" and so on.
      // '/**/'
      ? '(?:\\/[^\\/]+)*'

      // case: /**
      // > A trailing `"/**"` matches everything inside.

      // #21: everything inside but it should not include the current folder
      : '\\/.+'
  ],

  // normal intermediate wildcards
  [
    // Never replace escaped '*'
    // ignore rule '\*' will match the path '*'

    // 'abc.*/' -> go
    // 'abc.*'  -> skip this rule,
    //    coz trailing single wildcard will be handed by [trailing wildcard]
    /(^|[^\\]+)(\\\*)+(?=.+)/g,

    // '*.js' matches '.js'
    // '*.js' doesn't match 'abc'
    (_, p1, p2) => {
      // 1.
      // > An asterisk "*" matches anything except a slash.
      // 2.
      // > Other consecutive asterisks are considered regular asterisks
      // > and will match according to the previous rules.
      const unescaped = p2.replace(/\\\*/g, '[^\\/]*')
      return p1 + unescaped
    }
  ],

  [
    // unescape, revert step 3 except for back slash
    // For example, if a user escape a '\\*',
    // after step 3, the result will be '\\\\\\*'
    /\\\\\\(?=[$.|*+(){^])/g,
    () => ESCAPE
  ],

  [
    // '\\\\' -> '\\'
    /\\\\/g,
    () => ESCAPE
  ],

  [
    // > The range notation, e.g. [a-zA-Z],
    // > can be used to match one of the characters in a range.

    // `\` is escaped by step 3
    /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
    (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE
      // '\\[bar]' -> '\\\\[bar\\]'
      ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}`
      : close === ']'
        ? endEscape.length % 2 === 0
          // A normal case, and it is a range notation
          // '[bar]'
          // '[bar\\\\]'
          ? `[${sanitizeRange(range)}${endEscape}]`
          // Invalid range notaton
          // '[bar\\]' -> '[bar\\\\]'
          : '[]'
        : '[]'
  ],

  // ending
  [
    // 'js' will not match 'js.'
    // 'ab' will not match 'abc'
    /(?:[^*])$/,

    // WTF!
    // https://git-scm.com/docs/gitignore
    // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
    // which re-fixes #24, #38

    // > If there is a separator at the end of the pattern then the pattern
    // > will only match directories, otherwise the pattern can match both
    // > files and directories.

    // 'js*' will not match 'a.js'
    // 'js/' will not match 'a.js'
    // 'js' will match 'a.js' and 'a.js/'
    match => /\/$/.test(match)
      // foo/ will not match 'foo'
      ? `${match}$`
      // foo matches 'foo' and 'foo/'
      : `${match}(?=$|\\/$)`
  ]
]

const REGEX_REPLACE_TRAILING_WILDCARD = /(^|\\\/)?\\\*$/
const MODE_IGNORE = 'regex'
const MODE_CHECK_IGNORE = 'checkRegex'
const UNDERSCORE = '_'

const TRAILING_WILD_CARD_REPLACERS = {
  [MODE_IGNORE] (_, p1) {
    const prefix = p1
      // '\^':
      // '/*' does not match EMPTY
      // '/*' does not match everything

      // '\\\/':
      // 'abc/*' does not match 'abc/'
      ? `${p1}[^/]+`

      // 'a*' matches 'a'
      // 'a*' matches 'aa'
      : '[^/]*'

    return `${prefix}(?=$|\\/$)`
  },

  [MODE_CHECK_IGNORE] (_, p1) {
    // When doing `git check-ignore`
    const prefix = p1
      // '\\\/':
      // 'abc/*' DOES match 'abc/' !
      ? `${p1}[^/]*`

      // 'a*' matches 'a'
      // 'a*' matches 'aa'
      : '[^/]*'

    return `${prefix}(?=$|\\/$)`
  }
}

// @param {pattern}
const makeRegexPrefix = pattern => REPLACERS.reduce(
  (prev, [matcher, replacer]) =>
    prev.replace(matcher, replacer.bind(pattern)),
  pattern
)

const isString = subject => typeof subject === 'string'

// > A blank line matches no files, so it can serve as a separator for readability.
const checkPattern = pattern => pattern
  && isString(pattern)
  && !REGEX_TEST_BLANK_LINE.test(pattern)
  && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern)

  // > A line starting with # serves as a comment.
  && pattern.indexOf('#') !== 0

const splitPattern = pattern => pattern
.split(REGEX_SPLITALL_CRLF)
.filter(Boolean)

class IgnoreRule {
  constructor (
    pattern,
    mark,
    body,
    ignoreCase,
    negative,
    prefix
  ) {
    this.pattern = pattern
    this.mark = mark
    this.negative = negative

    define(this, 'body', body)
    define(this, 'ignoreCase', ignoreCase)
    define(this, 'regexPrefix', prefix)
  }

  get regex () {
    const key = UNDERSCORE + MODE_IGNORE

    if (this[key]) {
      return this[key]
    }

    return this._make(MODE_IGNORE, key)
  }

  get checkRegex () {
    const key = UNDERSCORE + MODE_CHECK_IGNORE

    if (this[key]) {
      return this[key]
    }

    return this._make(MODE_CHECK_IGNORE, key)
  }

  _make (mode, key) {
    const str = this.regexPrefix.replace(
      REGEX_REPLACE_TRAILING_WILDCARD,

      // It does not need to bind pattern
      TRAILING_WILD_CARD_REPLACERS[mode]
    )

    const regex = this.ignoreCase
      ? new RegExp(str, 'i')
      : new RegExp(str)

    return define(this, key, regex)
  }
}

const createRule = ({
  pattern,
  mark
}, ignoreCase) => {
  let negative = false
  let body = pattern

  // > An optional prefix "!" which negates the pattern;
  if (body.indexOf('!') === 0) {
    negative = true
    body = body.substr(1)
  }

  body = body
  // > Put a backslash ("\") in front of the first "!" for patterns that
  // >   begin with a literal "!", for example, `"\!important!.txt"`.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, '!')
  // > Put a backslash ("\") in front of the first hash for patterns that
  // >   begin with a hash.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, '#')

  const regexPrefix = makeRegexPrefix(body)

  return new IgnoreRule(
    pattern,
    mark,
    body,
    ignoreCase,
    negative,
    regexPrefix
  )
}

class RuleManager {
  constructor (ignoreCase) {
    this._ignoreCase = ignoreCase
    this._rules = []
  }

  _add (pattern) {
    // #32
    if (pattern && pattern[KEY_IGNORE]) {
      this._rules = this._rules.concat(pattern._rules._rules)
      this._added = true
      return
    }

    if (isString(pattern)) {
      pattern = {
        pattern
      }
    }

    if (checkPattern(pattern.pattern)) {
      const rule = createRule(pattern, this._ignoreCase)
      this._added = true
      this._rules.push(rule)
    }
  }

  // @param {Array<string> | string | Ignore} pattern
  add (pattern) {
    this._added = false

    makeArray(
      isString(pattern)
        ? splitPattern(pattern)
        : pattern
    ).forEach(this._add, this)

    return this._added
  }

  // Test one single path without recursively checking parent directories
  //
  // - checkUnignored `boolean` whether should check if the path is unignored,
  //   setting `checkUnignored` to `false` could reduce additional
  //   path matching.
  // - check `string` either `MODE_IGNORE` or `MODE_CHECK_IGNORE`

  // @returns {TestResult} true if a file is ignored
  test (path, checkUnignored, mode) {
    let ignored = false
    let unignored = false
    let matchedRule

    this._rules.forEach(rule => {
      const {negative} = rule

      //          |           ignored : unignored
      // -------- | ---------------------------------------
      // negative |   0:0   |   0:1   |   1:0   |   1:1
      // -------- | ------- | ------- | ------- | --------
      //     0    |  TEST   |  TEST   |  SKIP   |    X
      //     1    |  TESTIF |  SKIP   |  TEST   |    X

      // - SKIP: always skip
      // - TEST: always test
      // - TESTIF: only test if checkUnignored
      // - X: that never happen
      if (
        unignored === negative && ignored !== unignored
        || negative && !ignored && !unignored && !checkUnignored
      ) {
        return
      }

      const matched = rule[mode].test(path)

      if (!matched) {
        return
      }

      ignored = !negative
      unignored = negative

      matchedRule = negative
        ? UNDEFINED
        : rule
    })

    const ret = {
      ignored,
      unignored
    }

    if (matchedRule) {
      ret.rule = matchedRule
    }

    return ret
  }
}

const throwError = (message, Ctor) => {
  throw new Ctor(message)
}

const checkPath = (path, originalPath, doThrow) => {
  if (!isString(path)) {
    return doThrow(
      `path must be a string, but got \`${originalPath}\``,
      TypeError
    )
  }

  // We don't know if we should ignore EMPTY, so throw
  if (!path) {
    return doThrow(`path must not be empty`, TypeError)
  }

  // Check if it is a relative path
  if (checkPath.isNotRelative(path)) {
    const r = '`path.relative()`d'
    return doThrow(
      `path should be a ${r} string, but got "${originalPath}"`,
      RangeError
    )
  }

  return true
}

const isNotRelative = path => REGEX_TEST_INVALID_PATH.test(path)

checkPath.isNotRelative = isNotRelative

// On windows, the following function will be replaced
/* istanbul ignore next */
checkPath.convert = p => p


class Ignore {
  constructor ({
    ignorecase = true,
    ignoreCase = ignorecase,
    allowRelativePaths = false
  } = {}) {
    define(this, KEY_IGNORE, true)

    this._rules = new RuleManager(ignoreCase)
    this._strictPathCheck = !allowRelativePaths
    this._initCache()
  }

  _initCache () {
    // A cache for the result of `.ignores()`
    this._ignoreCache = Object.create(null)

    // A cache for the result of `.test()`
    this._testCache = Object.create(null)
  }

  add (pattern) {
    if (this._rules.add(pattern)) {
      // Some rules have just added to the ignore,
      //   making the behavior changed,
      //   so we need to re-initialize the result cache
      this._initCache()
    }

    return this
  }

  // legacy
  addPattern (pattern) {
    return this.add(pattern)
  }

  // @returns {TestResult}
  _test (originalPath, cache, checkUnignored, slices) {
    const path = originalPath
      // Supports nullable path
      && checkPath.convert(originalPath)

    checkPath(
      path,
      originalPath,
      this._strictPathCheck
        ? throwError
        : RETURN_FALSE
    )

    return this._t(path, cache, checkUnignored, slices)
  }

  checkIgnore (path) {
    // If the path doest not end with a slash, `.ignores()` is much equivalent
    //   to `git check-ignore`
    if (!REGEX_TEST_TRAILING_SLASH.test(path)) {
      return this.test(path)
    }

    const slices = path.split(SLASH).filter(Boolean)
    slices.pop()

    if (slices.length) {
      const parent = this._t(
        slices.join(SLASH) + SLASH,
        this._testCache,
        true,
        slices
      )

      if (parent.ignored) {
        return parent
      }
    }

    return this._rules.test(path, false, MODE_CHECK_IGNORE)
  }

  _t (
    // The path to be tested
    path,

    // The cache for the result of a certain checking
    cache,

    // Whether should check if the path is unignored
    checkUnignored,

    // The path slices
    slices
  ) {
    if (path in cache) {
      return cache[path]
    }

    if (!slices) {
      // path/to/a.js
      // ['path', 'to', 'a.js']
      slices = path.split(SLASH).filter(Boolean)
    }

    slices.pop()

    // If the path has no parent directory, just test it
    if (!slices.length) {
      return cache[path] = this._rules.test(path, checkUnignored, MODE_IGNORE)
    }

    const parent = this._t(
      slices.join(SLASH) + SLASH,
      cache,
      checkUnignored,
      slices
    )

    // If the path contains a parent directory, check the parent first
    return cache[path] = parent.ignored
      // > It is not possible to re-include a file if a parent directory of
      // >   that file is excluded.
      ? parent
      : this._rules.test(path, checkUnignored, MODE_IGNORE)
  }

  ignores (path) {
    return this._test(path, this._ignoreCache, false).ignored
  }

  createFilter () {
    return path => !this.ignores(path)
  }

  filter (paths) {
    return makeArray(paths).filter(this.createFilter())
  }

  // @returns {TestResult}
  test (path) {
    return this._test(path, this._testCache, true)
  }
}

const factory = options => new Ignore(options)

const isPathValid = path =>
  checkPath(path && checkPath.convert(path), path, RETURN_FALSE)

/* istanbul ignore next */
const setupWindows = () => {
  /* eslint no-control-regex: "off" */
  const makePosix = str => /^\\\\\?\\/.test(str)
  || /["<>|\u0000-\u001F]+/u.test(str)
    ? str
    : str.replace(/\\/g, '/')

  checkPath.convert = makePosix

  // 'C:\\foo'     <- 'C:\\foo' has been converted to 'C:/'
  // 'd:\\foo'
  const REGEX_TEST_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i
  checkPath.isNotRelative = path =>
    REGEX_TEST_WINDOWS_PATH_ABSOLUTE.test(path)
    || isNotRelative(path)
}


// Windows
// --------------------------------------------------------------
/* istanbul ignore next */
if (
  // Detect `process` so that it can run in browsers.
  typeof process !== 'undefined'
  && process.platform === 'win32'
) {
  setupWindows()
}

// COMMONJS_EXPORTS ////////////////////////////////////////////////////////////

module.exports = factory

// Although it is an anti-pattern,
//   it is still widely misused by a lot of libraries in github
// Ref: https://github.com/search?q=ignore.default%28%29&type=code
factory.default = factory

module.exports.isPathValid = isPathValid

// For testing purposes
define(module.exports, Symbol.for('setupWindows'), setupWindows)


/***/ }),

/***/ 970:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseArgs = parseArgs;
// One dash, not two: `-h` must reach the help check, not be scored as a path.
function parseArgs(args) {
    const flags = new Set();
    const positional = [];
    for (const a of args) {
        if (a.startsWith("-")) {
            flags.add(a);
        }
        else {
            positional.push(a);
        }
    }
    return { flags, positional };
}


/***/ }),

/***/ 792:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_SUGGESTION_LIMIT = exports.SCORE_THRESHOLD_GOOD = exports.SCORE_THRESHOLD_MID = void 0;
exports.SCORE_THRESHOLD_MID = 60;
exports.SCORE_THRESHOLD_GOOD = 80;
exports.DEFAULT_SUGGESTION_LIMIT = 3;


/***/ }),

/***/ 264:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bandFor = bandFor;
exports.formatSummary = formatSummary;
const scoring_1 = __nccwpck_require__(792);
function bandFor(overall) {
    if (overall >= scoring_1.SCORE_THRESHOLD_GOOD) {
        return "high";
    }
    if (overall >= scoring_1.SCORE_THRESHOLD_MID) {
        return "mid";
    }
    return "low";
}
function formatSummary(score) {
    const band = bandFor(score.overall);
    const sorted = score.modelScores.slice().sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const head = `agent-friendly: ${score.overall} (${band})`;
    const tail = best ? ` · best: ${best.modelLabel} ${best.score}` : "";
    return `${head}${tail}\n`;
}


/***/ }),

/***/ 789:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.scoreRepo = scoreRepo;
exports.topImprovements = topImprovements;
const node_path_1 = __nccwpck_require__(760);
const scoring_1 = __nccwpck_require__(792);
const signals_1 = __nccwpck_require__(607);
const weights_1 = __nccwpck_require__(300);
function scoreOneModel(profile, signals) {
    let earned = 0;
    const contributions = [];
    const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0);
    for (const s of signals) {
        const w = profile.weights[s.id] ?? 0;
        const contribution = s.pass * w;
        earned += contribution;
        contributions.push({
            weight: w,
            contribution,
            pass: s.pass,
            signalId: s.id,
        });
    }
    const score = weightSum === 0 ? 0 : (earned / weightSum) * 100;
    return {
        contributions,
        modelId: profile.id,
        modelLabel: profile.label,
        score: Math.round(score * 10) / 10,
    };
}
// Some signals return absolute paths. Relativised once here so no stored or
// rendered path carries the scanner's filesystem layout.
function toRelative(repoPath, p) {
    if (!p) {
        return p;
    }
    const rel = (0, node_path_1.relative)(repoPath, p);
    return rel.startsWith("..") ? p : rel || ".";
}
function scoreRepo(repoPath, models = weights_1.MODELS) {
    const rawSignals = (0, signals_1.runAllSignals)(repoPath);
    const signals = rawSignals.map((s) => ({
        ...s,
        matchedPath: toRelative(repoPath, s.matchedPath),
    }));
    const modelScores = models.map((m) => scoreOneModel(m, signals));
    const overall = modelScores.length === 0
        ? 0
        : Math.round((modelScores.reduce((a, b) => a + b.score, 0) / modelScores.length) * 10) / 10;
    return { signals, modelScores, overall };
}
function topImprovements(modelId, signals, limit = scoring_1.DEFAULT_SUGGESTION_LIMIT, models = weights_1.MODELS) {
    const profile = models.find((m) => m.id === modelId);
    if (!profile) {
        return [];
    }
    const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0) || 1;
    return signals
        .map((s) => {
        const w = profile.weights[s.id] ?? 0;
        const scoreGain = (((1 - s.pass) * w) / weightSum) * 100;
        return { signalResult: s, scoreGain };
    })
        .filter((x) => x.scoreGain > 0)
        .sort((a, b) => b.scoreGain - a.scoreGain)
        .slice(0, limit)
        .map(({ signalResult, scoreGain }) => ({
        label: signalResult.label,
        signalId: signalResult.id,
        scoreGain: Math.round(scoreGain * 10) / 10,
        suggestion: signals_1.SIGNAL_BY_ID[signalResult.id]?.improveSuggestion ?? "",
    }));
}


/***/ }),

/***/ 605:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.agentSkills = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = "Skills (.agents/skills)";
// Presence only: the live-score path materializes the tree without skill
// contents, so judging a SKILL.md by what it says would score a clone differently.
exports.agentSkills = {
    label: LABEL,
    id: "agent_skills",
    description: "Task-specific instructions in `.agents/skills/<name>/SKILL.md`, which agents load when a task matches.",
    improveSuggestion: "Add `.agents/skills/<name>/SKILL.md` for the workflows an agent repeats here (running one test, cutting a release, adding a migration), each with a `name` and `description` in its frontmatter.",
    check: (repo) => {
        const dir = (0, helpers_1.resolveRelative)(repo, ".agents/skills");
        if (dir && (0, helpers_1.entryKind)(repo, (0, node_path_1.join)(repo, dir)) === "dir") {
            let names = [];
            try {
                names = (0, node_fs_1.readdirSync)((0, node_path_1.join)(repo, dir)).sort();
            }
            catch { }
            const skills = names
                .map((n) => (0, helpers_1.resolveRelative)(repo, `${dir}/${n}/SKILL.md`))
                .filter((p) => !!p && (0, helpers_1.isFileEntry)(repo, (0, node_path_1.join)(repo, p)));
            if (skills.length > 0) {
                return {
                    pass: 1,
                    label: LABEL,
                    id: "agent_skills",
                    matchedPath: skills[0],
                    detail: `${skills.length} skill${skills.length === 1 ? "" : "s"} in ${dir}/`,
                };
            }
        }
        return {
            pass: 0,
            label: LABEL,
            id: "agent_skills",
            detail: "No .agents/skills/<name>/SKILL.md",
        };
    },
};


/***/ }),

/***/ 299:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.agentsMd = void 0;
const helpers_1 = __nccwpck_require__(742);
// Only Claude Code reads the `.claude/` names, so a root file wins over them.
const CANDIDATES = ["AGENTS.md", "CLAUDE.md", "AGENT.md", ".claude/CLAUDE.md", ".claude/AGENTS.md"];
const LABEL = "AGENTS.md / CLAUDE.md";
exports.agentsMd = {
    label: LABEL,
    id: "agents_md",
    description: "An instructions file for agents, with real content.",
    improveSuggestion: "Add an AGENTS.md covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
    check: (repo) => {
        // An empty AGENTS.md stub must not hide a full CLAUDE.md beside it.
        let matched = null;
        let len = 0;
        for (const c of CANDIDATES) {
            const hit = (0, helpers_1.firstExisting)(repo, [c]);
            if (!hit) {
                continue;
            }
            const n = (0, helpers_1.readSafe)(hit, repo).trim().length;
            if (!matched || n > 0) {
                matched = hit;
                len = n;
            }
            if (n > 0) {
                break;
            }
        }
        if (!matched) {
            return {
                pass: 0,
                label: LABEL,
                id: "agents_md",
                detail: "No agent instructions file found",
            };
        }
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: "File exists but empty",
            };
        }
        if (len < 200) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: `File exists (${(0, helpers_1.characters)(len)}) — thin`,
            };
        }
        if (len < 800) {
            return {
                pass: 0.8,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: `File exists (${(0, helpers_1.characters)(len)})`,
            };
        }
        return {
            pass: 1,
            label: LABEL,
            id: "agents_md",
            matchedPath: matched,
            detail: `Substantive (${(0, helpers_1.characters)(len)})`,
        };
    },
};


/***/ }),

/***/ 585:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.aiderConf = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = ".aider.conf.yml";
// Aider looks for this one spelling only; a `.yaml` file loads just through `--config`.
const REL = ".aider.conf.yml";
// Settings that change what Aider runs or reads; a model choice, `auto-test: false` or `read: []` changes neither.
const USEFUL = [
    /^(?:test|lint)-cmd[ \t]*:[ \t]*[^\s#]/m,
    /^auto-test[ \t]*:[ \t]*true\b/im,
    /^read[ \t]*:[ \t]*(?:[^\s#[]|\[[ \t]*[^\s\]]|\r?\n[ \t]+-[ \t]*\S)/m,
];
exports.aiderConf = {
    label: LABEL,
    id: "aider_conf",
    description: "`.aider.conf.yml`: Aider's repo config — test and lint commands, and the files it reads.",
    improveSuggestion: "Add a `.aider.conf.yml` at the repo root with `test-cmd`, `lint-cmd` and `auto-test: true`, and list AGENTS.md under `read:`.",
    check: (repo) => {
        const rel = (0, helpers_1.resolveRelative)(repo, REL);
        if (!rel) {
            return {
                pass: 0,
                label: LABEL,
                id: "aider_conf",
                detail: "No .aider.conf.yml at repo root",
            };
        }
        const text = (0, helpers_1.readSafe)((0, node_path_1.join)(repo, rel), repo);
        if (text.trim().length === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                matchedPath: rel,
                id: "aider_conf",
                detail: "Empty .aider.conf.yml",
            };
        }
        if (!USEFUL.some((re) => re.test(text))) {
            return {
                pass: 0.5,
                label: LABEL,
                matchedPath: rel,
                id: "aider_conf",
                detail: "Aider config sets no test-cmd, lint-cmd, auto-test or read",
            };
        }
        return {
            pass: 1,
            label: LABEL,
            matchedPath: rel,
            id: "aider_conf",
            detail: "Aider config sets test-cmd, lint-cmd, auto-test or read",
        };
    },
};


/***/ }),

/***/ 543:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ci = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const OTHER_CI = [
    ".gitlab-ci.yml",
    ".circleci/config.yml",
    "azure-pipelines.yml",
    ".travis.yml",
    "Jenkinsfile",
    ".buildkite/pipeline.yml",
];
exports.ci = {
    id: "ci",
    label: "CI configuration",
    description: "A CI pipeline the agent can read and run locally.",
    improveSuggestion: "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
    check: (repo) => {
        const ghWf = (0, helpers_1.resolveRelative)(repo, ".github/workflows");
        if (ghWf) {
            const abs = (0, node_path_1.join)(repo, ghWf);
            try {
                if ((0, helpers_1.entryKind)(repo, abs) === "dir") {
                    const files = (0, node_fs_1.readdirSync)(abs).filter((f) => /\.ya?ml$/i.test(f) && (0, helpers_1.isFileEntry)(repo, (0, node_path_1.join)(abs, f)));
                    if (files.length > 0) {
                        return {
                            pass: 1,
                            id: "ci",
                            matchedPath: ghWf,
                            label: "CI configuration",
                            detail: `${files.length} GitHub Actions workflow${files.length === 1 ? "" : "s"}`,
                        };
                    }
                }
            }
            catch { }
        }
        const m = (0, helpers_1.firstExisting)(repo, OTHER_CI);
        if (m) {
            return {
                id: "ci",
                pass: 0.9,
                matchedPath: m,
                label: "CI configuration",
                detail: "CI config present",
            };
        }
        return {
            pass: 0,
            id: "ci",
            label: "CI configuration",
            detail: "No CI config found",
        };
    },
};


/***/ }),

/***/ 259:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contributing = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [
    "CONTRIBUTING.md",
    "CONTRIBUTING.rst",
    "CONTRIBUTING.adoc",
    "CONTRIBUTING",
    ".github/CONTRIBUTING.md",
    ".github/CONTRIBUTING.rst",
    ".github/CONTRIBUTING.adoc",
    "docs/CONTRIBUTING.md",
    "docs/CONTRIBUTING.rst",
    "docs/CONTRIBUTING.adoc",
];
exports.contributing = {
    id: "contributing",
    label: "CONTRIBUTING guide",
    description: "A contribution workflow the agent can follow.",
    improveSuggestion: "Add CONTRIBUTING.md describing branch naming, commit style, test commands, and the PR process.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "contributing",
                detail: "Guide present",
                label: "CONTRIBUTING guide",
            };
        }
        return {
            pass: 0,
            id: "contributing",
            label: "CONTRIBUTING guide",
            detail: "No CONTRIBUTING file",
        };
    },
};


/***/ }),

/***/ 567:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cursorRules = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = "Cursor rules (.cursor/rules)";
// Cursor reads `.mdc` (not `.md`) in `.cursor/rules/`, its subfolders, and any
// subdirectory's `.cursor/rules/` (CLI changelog). The search stops at the tests
// check's depth so a repo without rules doesn't cost a full walk.
const PARENT_DEPTH = 3;
const SUBFOLDER_DEPTH = 3;
const SKIP = new Set(["node_modules", ".git", "vendor", "target"]);
function list(repo, rel) {
    try {
        // Sorted: readdir order is filesystem-dependent, and the first hit becomes matchedPath.
        return (0, node_fs_1.readdirSync)((0, node_path_1.join)(repo, rel)).sort();
    }
    catch {
        return [];
    }
}
function mdcFiles(repo, rel, depth, out) {
    for (const e of list(repo, rel)) {
        const child = `${rel}/${e}`;
        const kind = (0, helpers_1.entryKind)(repo, (0, node_path_1.join)(repo, child));
        if (kind === "dir") {
            if (depth < SUBFOLDER_DEPTH)
                mdcFiles(repo, child, depth + 1, out);
        }
        else if (e.toLowerCase().endsWith(".mdc") && (0, helpers_1.isFileEntry)(repo, (0, node_path_1.join)(repo, child))) {
            out.push(child);
        }
    }
}
/** Every `.cursor/rules/` folder, the root one first. */
function rulesDirs(repo) {
    const found = [];
    const visit = (rel, depth) => {
        const dir = (0, helpers_1.resolveRelative)(repo, rel ? `${rel}/.cursor/rules` : ".cursor/rules");
        if (dir && (0, helpers_1.entryKind)(repo, (0, node_path_1.join)(repo, dir)) === "dir")
            found.push(dir);
        if (depth >= PARENT_DEPTH)
            return;
        for (const e of list(repo, rel || ".")) {
            if (SKIP.has(e) || e.toLowerCase() === ".cursor")
                continue;
            const child = rel ? `${rel}/${e}` : e;
            if ((0, helpers_1.entryKind)(repo, (0, node_path_1.join)(repo, child)) === "dir")
                visit(child, depth + 1);
        }
    };
    visit("", 0);
    return found;
}
exports.cursorRules = {
    label: LABEL,
    id: "cursor_rules",
    description: "Cursor's instructions: `.cursor/rules/*.mdc`, or the older `.cursorrules`.",
    improveSuggestion: "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). Cursor's current docs no longer mention the single `.cursorrules` file.",
    check: (repo) => {
        const dirs = rulesDirs(repo);
        const mdc = [];
        for (const d of dirs)
            mdcFiles(repo, d, 0, mdc);
        if (mdc.length > 0) {
            const onlyRoot = mdc.every((p) => p.toLowerCase().startsWith(".cursor/rules/"));
            return {
                pass: 1,
                label: LABEL,
                id: "cursor_rules",
                matchedPath: mdc[0],
                detail: `${mdc.length} .mdc file${mdc.length === 1 ? "" : "s"} in ${onlyRoot ? ".cursor/rules/" : ".cursor/rules/ folders"}`,
            };
        }
        const legacy = (0, helpers_1.resolveRelative)(repo, ".cursorrules");
        if (legacy) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "cursor_rules",
                matchedPath: legacy,
                detail: "Only the older .cursorrules — Cursor's docs now cover .cursor/rules/*.mdc instead",
            };
        }
        return {
            pass: 0,
            label: LABEL,
            id: "cursor_rules",
            detail: "No .cursor/rules/*.mdc or .cursorrules",
        };
    },
};


/***/ }),

/***/ 119:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.depsManifest = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [
    "package.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "poetry.lock",
    "Cargo.toml",
    "go.mod",
    "Gemfile",
    "composer.json",
    "pubspec.yaml",
    "build.gradle",
    "build.gradle.kts",
    "build.sbt",
    "pom.xml",
    "mix.exs",
    "Package.swift",
    "deps.edn",
    "project.clj",
    "stack.yaml",
    "dune-project",
    "rebar.config",
    "shard.yml",
    "build.zig",
    "CMakeLists.txt",
    "meson.build",
    "conanfile.txt",
    "conanfile.py",
    "vcpkg.json",
];
const GLOB_MANIFESTS = [/\.(csproj|fsproj|vbproj|sln)$/i, /\.cabal$/i, /\.nimble$/i];
function findGlobManifest(repo) {
    try {
        const entries = (0, node_fs_1.readdirSync)(repo).sort();
        for (const re of GLOB_MANIFESTS) {
            const hit = entries.find((f) => re.test(f) && (0, helpers_1.isFileEntry)(repo, (0, node_path_1.join)(repo, f)));
            if (hit) {
                return hit;
            }
        }
    }
    catch { }
    return null;
}
exports.depsManifest = {
    id: "deps_manifest",
    label: "Dependency manifest",
    description: "A dependency manifest, so the agent can reproduce the environment.",
    improveSuggestion: "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
    check: (repo) => {
        const m = (0, helpers_1.firstFile)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "deps_manifest",
                detail: "Manifest present",
                label: "Dependency manifest",
            };
        }
        const glob = findGlobManifest(repo);
        if (glob) {
            return {
                pass: 1,
                matchedPath: glob,
                id: "deps_manifest",
                detail: "Manifest present",
                label: "Dependency manifest",
            };
        }
        return {
            pass: 0,
            id: "deps_manifest",
            label: "Dependency manifest",
            detail: "No dependency manifest found",
        };
    },
};


/***/ }),

/***/ 50:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.devEnv = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const ARTIFACTS = [
    "Makefile",
    ".devcontainer/devcontainer.json",
    ".devcontainer.json",
    "flake.nix",
    "shell.nix",
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
    "justfile",
    "Taskfile.yml",
    "tox.ini",
    "noxfile.py",
    "mvnw",
    "gradlew",
    "bin/setup",
    ".devin/blueprint.yaml",
    ".cursor/environment.json",
];
exports.devEnv = {
    id: "dev_env",
    label: "Reproducible dev env",
    description: "One-command setup the agent can run: Makefile, devcontainer, Nix or Docker.",
    improveSuggestion: "Add a Makefile or devcontainer or Dockerfile so the agent can set up the project in one command.",
    check: (repo) => {
        const matches = (0, helpers_1.resolveAllRelative)(repo, ARTIFACTS);
        if (matches.length >= 2) {
            return {
                pass: 1,
                id: "dev_env",
                matchedPath: matches[0],
                label: "Reproducible dev env",
                detail: `${matches.length} env artifacts (${matches.slice(0, 2).join(", ")})`,
            };
        }
        if (matches.length === 1) {
            return {
                pass: 0.7,
                id: "dev_env",
                matchedPath: matches[0],
                detail: `Has ${matches[0]}`,
                label: "Reproducible dev env",
            };
        }
        const pkg = (0, helpers_1.resolveRelative)(repo, "package.json");
        if (pkg) {
            try {
                const j = JSON.parse((0, helpers_1.readSafe)((0, node_path_1.join)(repo, pkg), repo));
                if (j.scripts && Object.keys(j.scripts).length >= 3) {
                    return {
                        pass: 0.6,
                        id: "dev_env",
                        matchedPath: pkg,
                        label: "Reproducible dev env",
                        detail: `package.json has ${Object.keys(j.scripts).length} scripts`,
                    };
                }
            }
            catch { }
        }
        return {
            pass: 0,
            id: "dev_env",
            label: "Reproducible dev env",
            detail: "No Makefile / devcontainer / Docker / equivalent found",
        };
    },
};


/***/ }),

/***/ 340:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.geminiMd = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = "GEMINI.md";
// Gemini CLI inlines `@file.md` imports. Only these are followed: the live-score
// path fetches no other file's content, so any other would break parity.
const IMPORTABLE = ["AGENTS.md", "CLAUDE.md", "AGENT.md"];
// Gemini CLI skips imports in code blocks, so a fenced block matches first and is kept.
const IMPORT_OR_FENCE = /^[ \t]*(?:```|~~~)[^\n]*\n[\s\S]*?^[ \t]*(?:```|~~~)[ \t]*\r?$|^[ \t]*@(?:\.\/)?([^\s/]+\.md)[ \t]*\r?$/gim;
function withImports(repo, text) {
    return text.replace(IMPORT_OR_FENCE, (match, name) => {
        if (!name || !IMPORTABLE.some((f) => f.toLowerCase() === name.toLowerCase())) {
            return match;
        }
        const rel = (0, helpers_1.resolveRelative)(repo, name);
        return rel ? (0, helpers_1.readSafe)((0, node_path_1.join)(repo, rel), repo) : match;
    });
}
exports.geminiMd = {
    label: LABEL,
    id: "gemini_md",
    description: "Gemini CLI's instructions file, sent with every prompt.",
    improveSuggestion: "Add a GEMINI.md at the repo root covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
    check: (repo) => {
        const matched = (0, helpers_1.resolveRelative)(repo, "GEMINI.md");
        if (!matched) {
            return {
                pass: 0,
                label: LABEL,
                id: "gemini_md",
                detail: "No GEMINI.md at repo root",
            };
        }
        const len = withImports(repo, (0, helpers_1.readSafe)((0, node_path_1.join)(repo, matched), repo)).trim().length;
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: "GEMINI.md exists but empty",
            };
        }
        if (len < 200) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: `GEMINI.md exists (${(0, helpers_1.characters)(len)}) — thin`,
            };
        }
        if (len < 800) {
            return {
                pass: 0.8,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: `GEMINI.md exists (${(0, helpers_1.characters)(len)})`,
            };
        }
        return {
            pass: 1,
            label: LABEL,
            id: "gemini_md",
            matchedPath: matched,
            detail: `Substantive GEMINI.md (${(0, helpers_1.characters)(len)})`,
        };
    },
};


/***/ }),

/***/ 742:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_READ_BYTES = void 0;
exports.characters = characters;
exports.entryKind = entryKind;
exports.resolveRelative = resolveRelative;
exports.resolveAllRelative = resolveAllRelative;
exports.firstExisting = firstExisting;
exports.isFileEntry = isFileEntry;
exports.firstFile = firstFile;
exports.readSafe = readSafe;
exports.walkFind = walkFind;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
/** The site parses this count back out of stored details (fileLength), so keep the shape. */
function characters(n) {
    return `${n.toLocaleString("en-US")} characters`;
}
// The scored tree is untrusted — a PR branch, a live-scored repo — so its links
// are never followed out of it, and no read is unbounded: a README linked to
// /dev/zero, /etc/passwd or a CI runner's /proc would otherwise be read.
exports.MAX_READ_BYTES = 1024 * 1024;
const inside = (root, p) => p.startsWith(root + node_path_1.sep);
function entryKind(repo, abs) {
    try {
        const own = (0, node_fs_1.lstatSync)(abs);
        if (!own.isSymbolicLink()) {
            return own.isDirectory() ? "dir" : own.isFile() ? "file" : null;
        }
        // Lexical first, as the materializer decides: a dangling link that points out
        // must read the same on a clone as its placeholder does on the live path.
        if (!inside((0, node_path_1.resolve)(repo), (0, node_path_1.resolve)((0, node_path_1.dirname)(abs), (0, node_fs_1.readlinkSync)(abs)))) {
            return "escaped";
        }
        // .native asks the OS: the JS version resolves `..` after a link textually,
        // so a chain like `t -> ..` plus `s -> t/../../x` passes it while the read escapes.
        const real = node_fs_1.realpathSync.native(abs);
        if (!inside(node_fs_1.realpathSync.native(repo), real)) {
            return "escaped";
        }
        const target = (0, node_fs_1.statSync)(real);
        return target.isDirectory() ? "dir" : target.isFile() ? "file" : null;
    }
    catch {
        // Dangling, or unreadable.
        return null;
    }
}
function indexDir(dir, cache) {
    const cached = cache.get(dir);
    if (cached !== undefined) {
        return cached;
    }
    let index = null;
    try {
        const entries = (0, node_fs_1.readdirSync)(dir);
        const lower = new Map();
        // Sorted so that when both README.md and readme.md exist, the pick is
        // stable across runs instead of following readdir order.
        for (const e of [...entries].sort()) {
            const key = e.toLowerCase();
            if (!lower.has(key)) {
                lower.set(key, e);
            }
        }
        index = { lower, exact: new Set(entries) };
    }
    catch { }
    cache.set(dir, index);
    return index;
}
function resolveWith(repo, rel, cache) {
    const parts = [];
    let current = repo;
    for (const segment of rel.split("/")) {
        if (!segment) {
            return null;
        }
        if (current !== repo && entryKind(repo, current) !== "dir") {
            return null;
        }
        const index = indexDir(current, cache);
        if (!index) {
            return null;
        }
        // Exact spelling wins so it is never shadowed by a differently-cased sibling.
        const actual = index.exact.has(segment) ? segment : index.lower.get(segment.toLowerCase());
        if (!actual) {
            return null;
        }
        parts.push(actual);
        current = (0, node_path_1.join)(current, actual);
    }
    return parts.join("/");
}
// Returns the path as spelled on disk, not as spelled in the candidate list —
// callers surface it as `matchedPath`, so it has to be the real name.
function resolveRelative(repo, rel) {
    return resolveWith(repo, rel, new Map());
}
// Deduped by resolved path: a candidate list carrying two spellings of one
// file (Makefile / makefile) must not count as two hits.
function resolveAllRelative(repo, candidates) {
    const cache = new Map();
    const hits = new Set();
    for (const c of candidates) {
        const hit = resolveWith(repo, c, cache);
        if (hit) {
            hits.add(hit);
        }
    }
    return [...hits];
}
// Absolute, unlike the resolve* helpers above: callers feed the result straight
// to readSafe, and scorer.ts relativises it before it is stored or rendered.
function firstExisting(repo, candidates) {
    // One directory listing serves every candidate rooted in the same place.
    const cache = new Map();
    for (const c of candidates) {
        const hit = resolveWith(repo, c, cache);
        if (hit) {
            return (0, node_path_1.join)(repo, hit);
        }
    }
    return null;
}
// A name match alone would take a directory called `x.yml` for a workflow file.
// "escaped" counts because on the live path it is a placeholder file.
function isFileEntry(repo, abs) {
    const kind = entryKind(repo, abs);
    return kind === "file" || kind === "escaped";
}
function firstFile(repo, candidates) {
    const cache = new Map();
    for (const c of candidates) {
        const hit = resolveWith(repo, c, cache);
        if (hit && isFileEntry(repo, (0, node_path_1.join)(repo, hit))) {
            return (0, node_path_1.join)(repo, hit);
        }
    }
    return null;
}
// Truncated rather than refused past the cap, so a long README keeps its score.
// Without `repo` there is no root to hold links to; pass it wherever one exists.
function readSafe(p, repo) {
    try {
        if (repo ? entryKind(repo, p) !== "file" : !(0, node_fs_1.statSync)(p).isFile()) {
            return "";
        }
        const fd = (0, node_fs_1.openSync)(p, "r");
        try {
            const buf = Buffer.alloc(Math.min((0, node_fs_1.fstatSync)(fd).size, exports.MAX_READ_BYTES));
            let n = 0;
            while (n < buf.length) {
                const got = (0, node_fs_1.readSync)(fd, buf, n, buf.length - n, n);
                if (got === 0) {
                    break;
                }
                n += got;
            }
            return buf.toString("utf8", 0, n);
        }
        finally {
            (0, node_fs_1.closeSync)(fd);
        }
    }
    catch {
        return "";
    }
}
function walkFind(root, match, maxDepth = 3, maxHits = 1) {
    const hits = [];
    const visit = (dir, depth, rel) => {
        if (hits.length >= maxHits || depth > maxDepth) {
            return;
        }
        let entries = [];
        try {
            // readdir order is filesystem-dependent, and the first hit becomes matchedPath.
            entries = (0, node_fs_1.readdirSync)(dir).sort();
        }
        catch {
            return;
        }
        for (const e of entries) {
            if (e === "node_modules" || e === ".git" || e === "vendor" || e === "target") {
                continue;
            }
            const abs = (0, node_path_1.join)(dir, e);
            const relNext = rel ? `${rel}/${e}` : e;
            const kind = entryKind(root, abs);
            if (!kind) {
                continue;
            }
            if (kind === "dir") {
                visit(abs, depth + 1, relNext);
            }
            else if (match(relNext)) {
                hits.push(relNext);
                if (hits.length >= maxHits) {
                    return;
                }
            }
        }
    };
    visit(root, 0, "");
    return hits;
}


/***/ }),

/***/ 607:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SIGNAL_BY_ID = exports.SIGNALS = void 0;
exports.runAllSignals = runAllSignals;
const agent_skills_1 = __nccwpck_require__(605);
const agents_md_1 = __nccwpck_require__(299);
const aider_conf_1 = __nccwpck_require__(585);
const ci_1 = __nccwpck_require__(543);
const contributing_1 = __nccwpck_require__(259);
const cursor_rules_1 = __nccwpck_require__(567);
const deps_manifest_1 = __nccwpck_require__(119);
const dev_env_1 = __nccwpck_require__(50);
const gemini_md_1 = __nccwpck_require__(340);
const license_1 = __nccwpck_require__(324);
const linter_1 = __nccwpck_require__(809);
const openhands_setup_1 = __nccwpck_require__(213);
const pre_commit_1 = __nccwpck_require__(406);
const readme_1 = __nccwpck_require__(601);
const size_1 = __nccwpck_require__(746);
const tests_1 = __nccwpck_require__(218);
const type_config_1 = __nccwpck_require__(158);
exports.SIGNALS = [
    agents_md_1.agentsMd,
    cursor_rules_1.cursorRules,
    gemini_md_1.geminiMd,
    openhands_setup_1.openhandsSetup,
    aider_conf_1.aiderConf,
    agent_skills_1.agentSkills,
    readme_1.readme,
    tests_1.tests,
    ci_1.ci,
    linter_1.linter,
    deps_manifest_1.depsManifest,
    dev_env_1.devEnv,
    type_config_1.typeConfig,
    license_1.license,
    contributing_1.contributing,
    pre_commit_1.preCommit,
    size_1.size,
];
exports.SIGNAL_BY_ID = Object.fromEntries(exports.SIGNALS.map((s) => [s.id, s]));
function runAllSignals(repoPath) {
    return exports.SIGNALS.map((s) => {
        try {
            return s.check(repoPath);
        }
        catch (err) {
            return {
                pass: 0,
                id: s.id,
                label: s.label,
                detail: `check errored: ${err.message}`,
            };
        }
    });
}


/***/ }),

/***/ 324:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.license = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "COPYING.md"];
exports.license = {
    id: "license",
    label: "License file",
    description: "A license, so it's clear what may be done with the code.",
    improveSuggestion: "Add a LICENSE (or COPYING) file — MIT, Apache-2.0, BSD, GPL, etc. — at the repo root.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                id: "license",
                matchedPath: m,
                label: "License file",
                detail: "License present",
            };
        }
        return {
            pass: 0,
            id: "license",
            label: "License file",
            detail: "No LICENSE/COPYING file",
        };
    },
};


/***/ }),

/***/ 809:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.linter = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.json",
    ".eslintrc.cjs",
    "eslint.config.js",
    "eslint.config.mjs",
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    "prettier.config.js",
    "ruff.toml",
    ".ruff.toml",
    ".pylintrc",
    ".flake8",
    "setup.cfg",
    "rustfmt.toml",
    ".rustfmt.toml",
    "clippy.toml",
    ".golangci.yml",
    ".golangci.yaml",
    "biome.json",
    ".biome.json",
    ".rubocop.yml",
    ".standard.yml",
    ".swiftlint.yml",
    ".swiftformat",
    ".swift-format",
    "detekt.yml",
    "config/detekt/detekt.yml",
    ".scalafmt.conf",
    "phpstan.neon",
    "phpstan.neon.dist",
    "psalm.xml",
    "psalm.xml.dist",
    ".php-cs-fixer.dist.php",
    ".php-cs-fixer.php",
    ".credo.exs",
    ".formatter.exs",
    "stylua.toml",
    ".stylua.toml",
    "checkstyle.xml",
    "config/checkstyle/checkstyle.xml",
    "analysis_options.yaml",
    ".clang-format",
    ".clang-tidy",
    ".clj-kondo/config.edn",
];
const PYPROJECT_RE = /\[tool\.(ruff|black|flake8|pylint|mypy)/;
exports.linter = {
    id: "linter",
    label: "Linter / formatter config",
    description: "A linter, so the agent gets style feedback right away instead of guessing.",
    improveSuggestion: "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint) and commit the config.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                id: "linter",
                matchedPath: m,
                detail: "Config detected",
                label: "Linter / formatter config",
            };
        }
        const pyproject = (0, helpers_1.resolveRelative)(repo, "pyproject.toml");
        if (pyproject && PYPROJECT_RE.test((0, helpers_1.readSafe)((0, node_path_1.join)(repo, pyproject), repo))) {
            return {
                pass: 1,
                id: "linter",
                matchedPath: pyproject,
                label: "Linter / formatter config",
                detail: "Configured in pyproject.toml",
            };
        }
        return {
            pass: 0,
            id: "linter",
            label: "Linter / formatter config",
            detail: "No linter/formatter config found",
        };
    },
};


/***/ }),

/***/ 213:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openhandsSetup = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = ".openhands/setup.sh";
const REL = ".openhands/setup.sh";
exports.openhandsSetup = {
    label: LABEL,
    id: "openhands_setup",
    description: "`.openhands/setup.sh`, which OpenHands runs at session start to set up the dev environment.",
    improveSuggestion: "Add a `.openhands/setup.sh` that installs dependencies and prepares the project so OpenHands can run tests and lints out of the box.",
    check: (repo) => {
        const rel = (0, helpers_1.resolveRelative)(repo, REL);
        if (!rel) {
            return {
                pass: 0,
                label: LABEL,
                id: "openhands_setup",
                detail: "No .openhands/setup.sh",
            };
        }
        const len = (0, helpers_1.readSafe)((0, node_path_1.join)(repo, rel), repo).trim().length;
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                matchedPath: rel,
                id: "openhands_setup",
                detail: "Empty .openhands/setup.sh",
            };
        }
        return {
            pass: 1,
            label: LABEL,
            matchedPath: rel,
            id: "openhands_setup",
            detail: `Setup script present (${(0, helpers_1.characters)(len)})`,
        };
    },
};


/***/ }),

/***/ 406:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.preCommit = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [".pre-commit-config.yaml", ".husky", "lefthook.yml", "lefthook.yaml"];
exports.preCommit = {
    id: "pre_commit",
    label: "Pre-commit / git hooks",
    description: "Pre-commit hooks catch problems before the agent waits on CI.",
    improveSuggestion: "Set up pre-commit (.pre-commit-config.yaml), husky, or lefthook to run format+lint on every commit.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "pre_commit",
                label: "Pre-commit / git hooks",
                detail: "Hook framework configured",
            };
        }
        return {
            pass: 0,
            id: "pre_commit",
            label: "Pre-commit / git hooks",
            detail: "No pre-commit / husky / lefthook found",
        };
    },
};


/***/ }),

/***/ 601:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readme = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];
exports.readme = {
    id: "readme",
    label: "README",
    description: "A README with enough detail for the agent to learn the project.",
    improveSuggestion: "Expand your README to cover what the project does, how to install, the common commands, and the high-level layout.",
    check: (repo) => {
        const p = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (!p) {
            return {
                pass: 0,
                id: "readme",
                label: "README",
                detail: "No README found",
            };
        }
        const len = (0, helpers_1.readSafe)(p, repo).trim().length;
        if (len < 200) {
            return {
                id: "readme",
                label: "README",
                pass: 0.3,
                detail: `README thin (${(0, helpers_1.characters)(len)})`,
                matchedPath: p,
            };
        }
        if (len < 1000) {
            return {
                pass: 0.7,
                id: "readme",
                matchedPath: p,
                label: "README",
                detail: `README present (${(0, helpers_1.characters)(len)})`,
            };
        }
        return {
            pass: 1,
            id: "readme",
            matchedPath: p,
            label: "README",
            detail: `README detailed (${(0, helpers_1.characters)(len)})`,
        };
    },
};


/***/ }),

/***/ 746:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.size = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const ignore_1 = __importDefault(__nccwpck_require__(298));
const helpers_1 = __nccwpck_require__(742);
const BASELINE_IGNORE = ["node_modules", ".git", "vendor", "target", "dist", "build", ".next"];
const CAP = 10000;
const MAX_DEPTH = 8;
exports.size = {
    id: "size",
    label: "Manageable size",
    description: "Very large repos strain the agent's context window.",
    improveSuggestion: "If possible, split into smaller modules or carve out a focused entry path. Document where to start in AGENTS.md.",
    check: (repo) => {
        const ig = (0, ignore_1.default)().add(BASELINE_IGNORE);
        ig.add((0, helpers_1.readSafe)((0, node_path_1.join)(repo, ".gitignore"), repo));
        let count = 0;
        const visit = (dir, depth) => {
            if (count > CAP || depth > MAX_DEPTH) {
                return;
            }
            let entries = [];
            try {
                entries = (0, node_fs_1.readdirSync)(dir);
            }
            catch {
                return;
            }
            for (const e of entries) {
                if (e.startsWith(".")) {
                    continue;
                }
                const abs = (0, node_path_1.join)(dir, e);
                const kind = (0, helpers_1.entryKind)(repo, abs);
                if (!kind) {
                    continue;
                }
                const rel = (0, node_path_1.relative)(repo, abs).split(node_path_1.sep).join("/");
                if (ig.ignores(kind === "dir" ? `${rel}/` : rel)) {
                    continue;
                }
                if (kind === "dir") {
                    visit(abs, depth + 1);
                }
                else {
                    count++;
                }
                if (count > CAP) {
                    return;
                }
            }
        };
        visit(repo, 0);
        if (count < 50) {
            return {
                pass: 0.9,
                id: "size",
                label: "Manageable size",
                detail: `${count} files — very small`,
            };
        }
        if (count < 500) {
            return {
                pass: 1,
                id: "size",
                detail: `${count} files`,
                label: "Manageable size",
            };
        }
        if (count < 2000) {
            return {
                pass: 0.8,
                id: "size",
                detail: `${count} files`,
                label: "Manageable size",
            };
        }
        if (count < 5000) {
            return {
                pass: 0.5,
                id: "size",
                label: "Manageable size",
                detail: `${count} files — large`,
            };
        }
        return {
            pass: 0.2,
            id: "size",
            label: "Manageable size",
            detail: count > CAP ? `${CAP}+ files — very large` : `${count} files — very large`,
        };
    },
};


/***/ }),

/***/ 218:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tests = void 0;
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const DIRS = ["tests", "test", "__tests__", "spec", "specs", "src/test"];
const FILE_RE = /(^|\/)(.*\.test\.|.*\.spec\.|test_.*\.py$|.*_test\.go$|.*_test\.rs$|.*Test\.java$|.*Tests?\.kt$|.*_test\.exs$|.*_test\.dart$|.*Spec\.scala$|.*Test\.scala$|.*Test\.php$|.*_test\.rb$|.*_spec\.rb$|.*Tests?\.cs$)/;
exports.tests = {
    id: "tests",
    label: "Test suite",
    description: "Tests the agent can run to check its changes.",
    improveSuggestion: "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
    check: (repo) => {
        for (const d of DIRS) {
            const rel = (0, helpers_1.resolveRelative)(repo, d);
            if (!rel) {
                continue;
            }
            if ((0, helpers_1.entryKind)(repo, (0, node_path_1.join)(repo, rel)) === "dir") {
                return {
                    pass: 1,
                    id: "tests",
                    matchedPath: rel,
                    label: "Test suite",
                    detail: `Found /${rel}`,
                };
            }
        }
        const hits = (0, helpers_1.walkFind)(repo, (rel) => FILE_RE.test(rel), 3, 1);
        if (hits.length > 0) {
            return {
                pass: 0.7,
                id: "tests",
                label: "Test suite",
                matchedPath: hits[0],
                detail: `Test files detected (${hits[0]})`,
            };
        }
        return {
            pass: 0,
            id: "tests",
            label: "Test suite",
            detail: "No test directory or test files found",
        };
    },
};


/***/ }),

/***/ 158:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.typeConfig = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["tsconfig.json", "jsconfig.json", "mypy.ini", ".mypy.ini", "pyrightconfig.json"];
const PYPROJECT_RE = /\[tool\.(mypy|pyright)/;
const TYPED_LANG_FILES = [
    { file: "Cargo.toml", lang: "Rust" },
    { file: "go.mod", lang: "Go" },
    { file: "pom.xml", lang: "Java" },
    { file: "build.gradle", lang: "Java/Kotlin" },
    { file: "build.gradle.kts", lang: "Java/Kotlin" },
    { file: "build.sbt", lang: "Scala" },
    { file: "Package.swift", lang: "Swift" },
    { file: "global.json", lang: "C#" },
    { file: "dune-project", lang: "OCaml" },
    { file: "stack.yaml", lang: "Haskell" },
    { file: "build.zig", lang: "Zig" },
];
const GLOB_TYPED = [
    { re: /\.(csproj|fsproj|vbproj|sln)$/i, lang: "C#" },
    { re: /\.cabal$/i, lang: "Haskell" },
];
function detectTypedLang(repo) {
    for (const { file, lang } of TYPED_LANG_FILES) {
        if ((0, helpers_1.firstFile)(repo, [file])) {
            return lang;
        }
    }
    try {
        const entries = (0, node_fs_1.readdirSync)(repo);
        for (const { re, lang } of GLOB_TYPED) {
            if (entries.some((f) => re.test(f) && (0, helpers_1.isFileEntry)(repo, (0, node_path_1.join)(repo, f)))) {
                return lang;
            }
        }
    }
    catch { }
    return null;
}
exports.typeConfig = {
    id: "type_config",
    label: "Type configuration",
    description: "Static types let the agent check call sites without running code.",
    improveSuggestion: "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python). Rust/Go/JVM/Scala/Swift/C#/OCaml/Haskell/Zig are typed by default.",
    check: (repo) => {
        const m = (0, helpers_1.firstFile)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "type_config",
                label: "Type configuration",
                detail: "Type config present",
            };
        }
        const pyproject = (0, helpers_1.resolveRelative)(repo, "pyproject.toml");
        if (pyproject && PYPROJECT_RE.test((0, helpers_1.readSafe)((0, node_path_1.join)(repo, pyproject), repo))) {
            return {
                pass: 1,
                id: "type_config",
                label: "Type configuration",
                matchedPath: pyproject,
                detail: "Configured in pyproject.toml",
            };
        }
        const lang = detectTypedLang(repo);
        if (lang) {
            return {
                pass: 1,
                id: "type_config",
                label: "Type configuration",
                detail: `Typed language (${lang})`,
            };
        }
        return {
            pass: 0,
            id: "type_config",
            label: "Type configuration",
            detail: "No type config found",
        };
    },
};


/***/ }),

/***/ 300:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODELS = void 0;
exports.MODELS = [
    {
        id: "claude-code",
        label: "Claude Code",
        rationale: "Loads CLAUDE.md (or `.claude/CLAUDE.md`) at the start of every session per Anthropic's memory docs, and AGENTS.md only when there is no CLAUDE.md, so the instructions file and a fast test loop carry the most weight. Its skills live in `.claude/skills/`, not `.agents/skills/`.",
        sources: ["https://code.claude.com/docs/en/memory", "https://code.claude.com/docs/en/skills"],
        weights: {
            ci: 0.5,
            size: 0.5,
            tests: 1.0,
            readme: 0.7,
            linter: 0.6,
            dev_env: 0.9,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 1.0,
            agent_skills: 0,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.6,
            contributing: 0.4,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "cursor",
        label: "Cursor",
        rationale: "Per Cursor's Rules docs, reads `.cursor/rules/*.mdc` (subfolders included) and AGENTS.md as its repo instructions, and loads skills from `.agents/skills/`. Type config and a clear README help its codebase search but aren't the docs-cited signal.",
        sources: ["https://cursor.com/docs/rules", "https://cursor.com/docs/skills"],
        weights: {
            ci: 0.4,
            size: 0.4,
            tests: 0.7,
            linter: 0.8,
            readme: 1.0,
            dev_env: 0.5,
            gemini_md: 0,
            license: 0.3,
            aider_conf: 0,
            agents_md: 0.8,
            agent_skills: 0.4,
            pre_commit: 0.3,
            type_config: 1.0,
            contributing: 0.3,
            cursor_rules: 1.0,
            deps_manifest: 0.8,
            openhands_setup: 0,
        },
    },
    {
        id: "devin",
        label: "Devin",
        rationale: "Works in a Linux virtual machine booted from a snapshot that already has the repo cloned and its tools, dependencies, environment variables and secrets set up, then installs, lints, builds and tests like any developer, per Cognition's environment docs; a committed `.devin/blueprint.yaml` defines that environment. CI config files alone aren't what the docs ask for — a runnable dev environment is. Pulls Cursor rule files into its Knowledge and discovers skills in `.agents/skills/`.",
        sources: [
            "https://docs.devin.ai/onboard-devin/environment",
            "https://docs.devin.ai/onboard-devin/knowledge-onboarding",
            "https://docs.devin.ai/product-guides/skills",
        ],
        weights: {
            ci: 0.7,
            size: 0.6,
            tests: 0.9,
            linter: 0.5,
            readme: 0.7,
            dev_env: 1.0,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.6,
            agent_skills: 0.4,
            cursor_rules: 0.3,
            pre_commit: 0.5,
            type_config: 0.5,
            contributing: 0.5,
            deps_manifest: 0.9,
            openhands_setup: 0,
        },
    },
    {
        id: "gpt-5-codex",
        label: "Codex",
        rationale: "Reads AGENTS.md before doing any work per OpenAI's Codex docs: one per directory from the repo root down to the working directory, where AGENTS.override.md replaces AGENTS.md, up to 32 KiB combined. Skills load from `.agents/skills/`.",
        sources: [
            "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
            "https://learn.chatgpt.com/docs/build-skills",
        ],
        weights: {
            ci: 0.7,
            size: 0.5,
            tests: 0.8,
            linter: 0.6,
            readme: 0.8,
            dev_env: 0.7,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.9,
            agent_skills: 0.4,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.7,
            contributing: 0.4,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "kimi-cli",
        label: "Kimi Code CLI",
        rationale: "Reads AGENTS.md as its native instruction surface (root or `.kimi-code/AGENTS.md`) per Moonshot's Kimi Code docs, and `/init` generates one. Its docs name no CLAUDE.md fallback, but the check passes on CLAUDE.md too. Skills load from `.agents/skills/`. Runs shell commands step-by-step under approval modes rather than in a sandbox VM, and dispatches `explore` sub-agents with isolated contexts to map a codebase, so a large tree costs it less than a single-context agent.",
        sources: [
            "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/agents.md",
            "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/reference/slash-commands.md",
            "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/skills.md",
        ],
        weights: {
            ci: 0.4,
            size: 0.4,
            tests: 0.9,
            readme: 0.7,
            linter: 0.6,
            dev_env: 0.7,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 1.0,
            agent_skills: 0.4,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.6,
            contributing: 0.4,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "gemini-cli",
        label: "Gemini CLI",
        rationale: "Loads `GEMINI.md` from the global file and from the workspace and its parent directories and sends it with every prompt, per Gemini CLI's docs; one in a subdirectory loads when a tool first touches that directory. AGENTS.md is read only when listed in the `context.fileName` setting. Skills load from `.agents/skills/`.",
        sources: ["https://geminicli.com/docs/cli/gemini-md/", "https://geminicli.com/docs/cli/skills/"],
        weights: {
            ci: 0.6,
            size: 0.5,
            tests: 0.9,
            linter: 0.7,
            readme: 0.9,
            dev_env: 0.7,
            license: 0.3,
            aider_conf: 0,
            agents_md: 0.7,
            agent_skills: 0.4,
            gemini_md: 1.0,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.9,
            contributing: 0.4,
            deps_manifest: 0.8,
            openhands_setup: 0,
        },
    },
    {
        id: "aider",
        label: "Aider",
        rationale: "Auto-lints on every edit by default, and runs the test command after edits once both `test-cmd` and `auto-test` are set (per Aider's lint/test docs). It doesn't natively read AGENTS.md or CONVENTIONS.md — those load only when wired via `.aider.conf.yml`'s `read:` — so the config file, a green linter, and a declared test command are what translate into successful commits.",
        sources: ["https://aider.chat/docs/usage/lint-test.html", "https://aider.chat/docs/config/aider_conf.html"],
        weights: {
            ci: 0.3,
            size: 0.4,
            tests: 1.0,
            linter: 1.0,
            readme: 0.6,
            dev_env: 0.5,
            license: 0.2,
            gemini_md: 0,
            agents_md: 0.3,
            agent_skills: 0,
            aider_conf: 1.0,
            cursor_rules: 0,
            pre_commit: 0.3,
            type_config: 0.5,
            contributing: 0.3,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "openhands",
        label: "OpenHands",
        rationale: "Executes `.openhands/setup.sh` whenever it starts work on a repo, per OpenHands' repo-customization docs; its backend runs on the user's machine by default, or in Docker, a VM or OpenHands Cloud. A root AGENTS.md goes into its system prompt in full; skills live in `.agents/skills/`, with the legacy `.openhands/skills/` and `.openhands/microagents/` still loaded.",
        sources: [
            "https://docs.openhands.dev/openhands/usage/customization/repository",
            "https://docs.openhands.dev/overview/skills",
            "https://docs.openhands.dev/openhands/usage/agent-canvas/overview",
        ],
        weights: {
            ci: 1.0,
            size: 0.7,
            tests: 0.9,
            linter: 0.6,
            readme: 0.7,
            dev_env: 1.0,
            license: 0.4,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.5,
            agent_skills: 0.4,
            cursor_rules: 0,
            pre_commit: 0.6,
            type_config: 0.5,
            contributing: 0.7,
            deps_manifest: 1.0,
            openhands_setup: 1.0,
        },
    },
    {
        id: "pi",
        label: "Pi",
        rationale: "Minimal terminal coding harness. Loads `AGENTS.md` (or `CLAUDE.md`) from its agent directory, the working directory and its parent directories, per Pi's configuration docs, and skills from `.agents/skills/`. It has no built-in sandbox; isolation is left to a container the user runs it in.",
        sources: [
            "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md",
            "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md",
        ],
        weights: {
            ci: 0.4,
            size: 0.5,
            tests: 0.9,
            linter: 0.8,
            readme: 0.7,
            dev_env: 0.6,
            license: 0.2,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 1.0,
            agent_skills: 0.4,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.6,
            contributing: 0.3,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
];


/***/ }),

/***/ 24:
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ 760:
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ 708:
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const node_process_1 = __nccwpck_require__(708);
const args_1 = __nccwpck_require__(970);
const format_1 = __nccwpck_require__(264);
const scorer_1 = __nccwpck_require__(789);
const PROJECT_ROOT_MARKERS = [
    ".git",
    "go.mod",
    "Gemfile",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "readme.md",
    "Cargo.toml",
    "package.json",
    "pyproject.toml",
];
function bestModelId(scores) {
    const sorted = scores.slice().sort((a, b) => b.score - a.score);
    return sorted[0]?.modelId;
}
function buildWarnings(target) {
    const hasMarker = PROJECT_ROOT_MARKERS.some((m) => (0, node_fs_1.existsSync)((0, node_path_1.join)(target, m)));
    if (hasMarker) {
        return [];
    }
    return [
        `${target} doesn't look like a project root (no package.json, README.md, AGENTS.md, .git, or other project marker found at this path). The score will be low. Run from your project root, or pass the project root path explicitly.`,
    ];
}
const KNOWN_FLAGS = new Set(["--summary", "--json", "--help", "-h"]);
const USAGE = [
    "Usage: agent-friendly-skill [path] [--summary] [--json]",
    "",
    "Scores the repo at <path> (default: cwd) and prints the result.",
    "",
    "  --summary   one-line human summary (for SessionStart hooks)",
    "  --json      JSON output (the default)",
    "  -h, --help  print this help",
    "",
].join("\n");
function main() {
    const { flags, positional } = (0, args_1.parseArgs)(node_process_1.argv.slice(2));
    if (flags.has("--help") || flags.has("-h")) {
        node_process_1.stdout.write(USAGE);
        (0, node_process_1.exit)(0);
    }
    // A mistyped `--summary` would otherwise print JSON into a hook that expects one line.
    const unknown = [...flags].filter((f) => !KNOWN_FLAGS.has(f));
    if (unknown.length > 0) {
        node_process_1.stderr.write(`agent-friendly: unknown option ${unknown.join(", ")}\n\n${USAGE}`);
        (0, node_process_1.exit)(2);
    }
    const target = (0, node_path_1.resolve)(positional[0] ?? process.cwd());
    if (!(0, node_fs_1.existsSync)(target) || !(0, node_fs_1.statSync)(target).isDirectory()) {
        node_process_1.stderr.write(`agent-friendly: not a directory: ${target}\n`);
        (0, node_process_1.exit)(2);
    }
    const score = (0, scorer_1.scoreRepo)(target);
    const warnings = buildWarnings(target);
    const topModel = bestModelId(score.modelScores);
    const improvements = topModel ? (0, scorer_1.topImprovements)(topModel, score.signals) : [];
    if (flags.has("--summary")) {
        for (const w of warnings) {
            node_process_1.stderr.write(`agent-friendly: ${w}\n`);
        }
        node_process_1.stdout.write((0, format_1.formatSummary)(score));
        return;
    }
    node_process_1.stdout.write(`${JSON.stringify({ ...score, topImprovements: improvements, warnings }, null, 2)}\n`);
}
main();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map