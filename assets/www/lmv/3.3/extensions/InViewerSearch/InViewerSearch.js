/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

/*
 *
 * Developers: If you are reading this, please ensure your app is using the minified SDK version.
 * See ./search-qs-jsapi.min.js
 *
 */
(function(window) {
    "use strict";

    // Source: https://git.autodesk.com/A360/firefly.js/blob/develop/src/AutodeskNamespace.js
    var AutodeskNamespace = AutodeskNamespace || function (s) {

        /* jshint -W117 */
        var ns = typeof window !== 'undefined' && window !== null ? window : self;

        var parts = s.split('.');
            parts.forEach(function(elem) {
            ns[elem] = ns[elem] || {};
            ns = ns[elem];
        });

        return ns;
    };
    /* jshint -W117 */

    //
    // "Private" variables
    //

    /** @namespace Autodesk */
    /** @namespace Autodesk.Search */
    var ns = new AutodeskNamespace('Autodesk.Search');

    var DEBUG = DEBUG || false;

    // Page load time instrumentation
    var searchSDKInstantiated = +new Date();
    var isPagePerformanceLogged = false;

    // version
    var versionInfo = Object.freeze({
        version: '3.0.3',
        buildDate: '2017-01-27T14:10:26',
        buildNumber: '236',
        minRestApiVersion: '1.40.4'
    });


    var SearchQueryAPIRoot = 'qs';
    var ApiPortalSearchQueryAPIRoot = 'search';
    var SearchQueryAPIVersion = 'v3';
    var SearchHealthAPIVersion = 'v2';
    var SearchLogAPIVersion = 'v2';
    var DefaultSearchEnv = 'prod';

    var SearchApiUrls = Object.freeze({
        localdev: 'http://search-localdev.api.autodesk.com:8080' + '/' + SearchQueryAPIRoot,
        dev: 'https://dev.search.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        'dev-dr': 'https://dev.search-dr.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        stg: 'https://search-staging.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        'stg-dr': 'https://search-staging-dr.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        prod: 'https://search.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        'prod-dr': 'https://search-dr.api.autodesk.com' + '/' + SearchQueryAPIRoot,
        apidev: 'https://developer-dev.api.autodesk.com' + '/' + ApiPortalSearchQueryAPIRoot,
        apistg: 'https://developer-stg.api.autodesk.com' + '/' + ApiPortalSearchQueryAPIRoot,
        apiprod: 'https://developer.api.autodesk.com' + '/' + ApiPortalSearchQueryAPIRoot
    });

    var searchEnv = DefaultSearchEnv;
    var searchEndPoint = SearchApiUrls[searchEnv];
    var defaultAjaxTimeout = null;      // ms
    var suggestionDelay = 250;          // ms

    var SearchQueryAPIs = Object.freeze({
        'Query': '/' + SearchQueryAPIVersion + '/search',
        'Categories': '/' + SearchQueryAPIVersion + '/categories',
        'Suggestions': '/' + SearchQueryAPIVersion + '/suggestions',
        'Log': '/' + SearchLogAPIVersion + '/log',
        'Health':  '/' + SearchHealthAPIVersion + '/health',
        'SavedQueries': '/' + SearchQueryAPIVersion + '/savedqueries'
    });

    // Page load-time, visibility, and unload instrumentation
    var searchSDKLoaded = +new Date(); // When the Search SDK JS was loaded
    var lastVisiblityChange = +new Date(); // Last time the document was visible to the user
    var totalVisibleDuration=0, totalNotVisibleDuration=0;
    var lastQueryId, lastSessionInfo; // Shared between instances of the SearchQueryAPIs class
    if (document.addEventListener) { document.addEventListener("visibilitychange", visibilityChangeHandler, false); }
    if (window.addEventListener) { window.addEventListener("beforeunload", beforeUnloadHandler, false); }

    var SearchQueryHeaders = Object.freeze({
        TOKEN_HEADER_NAME:'x-ads-token',
        ANON_SESSION_HEADER_NAME: 'x-ads-anon-session',
        CLIENT_ID_HEADER_NAME: 'x-ads-client-id',
        CLIENT_FEATURE_ID_HEADER_NAME: 'x-ads-client-feature-id',
        SESSION_ID_HEADER_NAME: 'x-ads-session-id',
        DEBUG_HEADER_NAME: 'x-ads-debug',
        EXTRA_USER_ID_HEADER_NAME: 'x-ads-ex-user-id',
        ACM_NAMESPACES_HEADER_NAME: 'x-ads-search-acm-namespaces',
        CACHE_CONTROL_HEADER_NAME: 'Cache-Control',
        CONTENT_TYPE_HEADER_NAME: 'Content-Type',
        ACCEPT_HEADER_NAME: 'Accept',
        AUTHORIZATION_HEADER_NAME: 'Authorization'
    });

    /**
     * The parameter to be passed to search, suggestion and category queries
     * @typedef Autodesk.Search.QueryParameterType
     * @memberof Autodesk.Search
     * @property {string} pid Profile id, for more see {@tutorial profiles}
     * @property {string} query The query string to search for
     * @property {string} sort The sort type of the search, acceptable values depend on the profile
     * @property {string} page The page number to retrieve. Static page size pagination option.
     * @property {string} pageOffset Offset the first search response to this index. Dynamic page size pagination option.
     * @property {string} pageSize The number of results per page to retrieve. Dynamic size pagination option.
     * @property {string} filters The filters to apply to the search, the possible values depend on the profile and the returned categories
     * @property {number} modifier Search modifier ID
     */

    /**
     * Description of the behavior of the profile
     * @typedef Profile
     * @memberof Autodesk.Search
     * @property {number} id - Id of profile, for example 'adsk.simple.main' or 'adsk.a360team.main'
     * @property {number} pageSize - approximate number of results returned on each page by the search API
     * @property {string[]} sortTypes - the ways the returned results can be sorted, for example the simple profile has two ways, date ascending ('dateAscending') and date descending ('dateDescending')
     */

    /**
     * Session related information that needs to be submitted to the Search REST API on every call
     * @typedef SessionInfoType
     * @memberof Autodesk.Search
     * @property {string} clientId - application specific client identifier that will be added to the searches, for example an ClientId issued by the Dev Portal or an App specific Guid
     * @property {string} clientFeatureId - application specific Client Feature Id that will be added to the searches, for example main_search_bar
     * @property {string} sessionId - a session specific id, improves search reliability
     * @property {string} token - Oxygen OAuth1.0a user access token
     * @property {string} oauth2Token - Oxygen OAuth2.0 user access token
     * @property {string} userId - application user id if available. If you don't know what this should be, you should leave it empty.
     * @property {string} cacheControlReq - Optional cache control request that the server might honor for the given search request. This can be applicable for recurring searches that don't need to be redone every time. All valid Http Cache-Control header directives are acceptable here and they will be returned in the response as the Cache-Control header. If you don't know what this should be, you should leave it empty.
     * @property {string} acmNameSpace - Optional Access Control Management Info header
     */

    /**
     * Object holding the constants that define the search filter configuration
     * @typedef FilterConfig
     * @memberof Autodesk.Search
     * @property {string} arrayListItemDelimiter - Separates arrays in the outer array
     * @property {string} arrayListValueDelimiter - Separates values in an inner array
     * @property {string} escapeCharacter - Escapes the above characters in filter names and values
     * @property {string} reservedArrayListFilterNames - Reserved filter names that accept arrays as values that restrict the search in special ways
     * @example
     * filter=userName:John AND projectId:XXZZYX
     * where '!' is the filter list item delimiter and '~' is the filter name/value delimiter
     * or
     * filter=resourceIds:adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
     * where '*' is the array list value delimiter and "'" is the array list item delimiter
     * so the above filters have 3 items: adsk.wipmaster*fs.file*id123 and adsk.wipmaster*fs.file*id456 and adsk.wipmaster*fs.file*id789
     * and in this case every item has 3 values.
     * effect: restricts search to urns adsk.wipmaster:fs.file:id123, adsk.wipmaster:fs.file:id456, adsk.wipmaster:fs.file:id789
     */

     /**
      * The parameter to be passed save queries or get queries saved
      * @typedef Autodesk.Search.SavedQueriesParameterType
      * @memberof Autodesk.Search
      * @property {string} pid Viewer Search Profile id, for more see {@tutorial savedQueries}
      * @property {string} document The document asociated with the queries.
      * @property {Autodesk.Search.UserQueries} userQueries The object that contains the user data and the document queries to save.
      */


    // Filter delimiting and escaping
    //
    // resourceIds    List of URNs used to scope the search. The URNs are broken into composite identifiers in the format:
    // sourceSystem*type*id*version*elementId The sub-fields are optional going from left to right.
    // For example, one can have just a sourceSystem, or a sourceSystem plus type, or a sourceSystem plus type plus id.
    //
    // Filter examples:
    // filter=docType:FILE AND creator:C456QB2N9YSX AND lastModifier:XABYDC12122
    // filter=resourceIds:adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    // Meaning: Restrict search to urns adsk.wipmaster:fs.file:id123, adsk.wipmaster:fs.file:id456, adsk.wipmaster:fs.file:id789
    //
    // List item = name~value
    // Multiple list items: name1~value1!name1~value2!name2~value3!
    //
    var FilterConfig = deepFreeze({
        arrayListItemDelimiter: '\'',
        arrayListValueDelimiter: '*',

        escapeCharacter: '\\',

        reservedArrayListFilterNames: ['resourceIds']
    });


    var FilterEscapeSequences = deepFreeze({
        arrayListItemDelimiterEscSeq: FilterConfig.escapeCharacter + FilterConfig.arrayListItemDelimiter,
        arrayListValueDelimiterEscSeq: FilterConfig.escapeCharacter + FilterConfig.arrayListValueDelimiter,
        escapeCharacterEscSeq: FilterConfig.escapeCharacter + FilterConfig.escapeCharacter
    });


    var BCP47ToUPILanguageCode = deepFreeze({
        'pt-BR': 'PTB',     // Brazilian Portuguese
        'cs': 'CSY',        // Czech
        'en': 'ENU',        // English
        'en-us': 'ENU',     // English
        'fr': 'FRA',        // French
        'de': 'DEU',        // German
        'hu': 'HUN',        // Hungarian
        'it': 'ITA',        // Italian
        'ja': 'JPN',        // Japanese
        'ko': 'KOR',        // Korean
        'pl': 'PLK',        // Polish
        'ru': 'RUS',        // Russian
        'zh-CN': 'CHS',     // Simplified Chinese
        'es': 'ESP',        // Spanish
        'es-ES': 'ESP',     // Spanish
        'zh-TW': 'CHT'      // Traditional Chinese
    });


    //
    // "Private" functions
    //

    function parseUrlParams(urlSearch) {
        if (!urlSearch || urlSearch.length === 0) {
            return null;
        }
        return  urlSearch.replace(/^#?\?/,'')
            .split('&')
            .map(function(s){
                return s.split('=').map(function(v){ return decodeURIComponent(v);
            });
        });
    }

    function deepFreeze(obj) {
        if (typeof obj !== 'object' || obj === null) { return obj; }
        if (Object.getOwnPropertyNames) {
            Object.getOwnPropertyNames(obj).forEach(function(name) {
                var p = obj[name];
                if (typeof p === 'object' && p !== null && !Object.isFrozen(p)) { deepFreeze(p); }
            });
        }
        return Object.freeze(obj);
    }

    // To prevent CORS preflight request:
    // method := {HEAD|GET|POST} ;
    // headers := {Accept, Accept-Language, Content-Language, Last-Event-ID, Content-Type}
    // Content-Type header := {application/x-www-form-urlencoded|multipart/form-data|text/plain}
    function ajaxReq(url, headers, cb, timeout, method, body, returnErrorMessage) {
        cb = cb || function(){};

        if (!url || !headers) {
            console.error("Invalid URL or Request Headers for the Query Service REST API");
            setTimeout(function() { cb("Invalid URL or Request Headers for the Query Service REST API", null); }, 0);
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(method || 'GET', url);

        Object.keys(headers).forEach(function (headerName) {
            if (typeof headers[headerName] !== 'undefined' && headers[headerName] !== null) {
                xhr.setRequestHeader(headerName, headers[headerName]);
            }
        });

        var cbCalled = [];

        xhr.onreadystatechange = done();
        xhr.onload = done();
        xhr.onerror = done(null, 'Error');
        xhr.ontimeout = done(null, 'TimeOut');
        xhr.onabort = done(null, 'Abort');
        xhr.timeout = timeout || defaultAjaxTimeout;

        if (body) {
            xhr.send(body);
        } else {
            xhr.send();
        }

        function done(statusCode, eventName) {
            return function() {
                var status, err=null, result=null;

                if (xhr.readyState === 4) {
                    status = xhr.status || statusCode || -1;

                    if (xhr.response && (xhr.getResponseHeader('Content-Type') === 'application/json' || xhr.responseType === 'json')) {
                        result = JSON.parse(xhr.response);
                    } else {
                        result = xhr.response;
                    }

                    if (!cbCalled[status]) {
                        cbCalled[status] = true;

                        if (status !== 200) {
                            err = xhr.status || statusCode || 'unknown error';
                        }

                        if (err) { cb(err, returnErrorMessage ? result : null); }
                        else { cb(null, result); }
                    }
                }
            };
        }
    }

    function visibilityChangeHandler() {
        var logBody, duration, now=+new Date();
        if (lastQueryId && lastSessionInfo) { // These are set after the first successful query or autosuggest request
            duration = now - lastVisiblityChange;
            lastVisiblityChange = now;

            if (document.hidden) { // Document went from visible to NOT visible
                totalVisibleDuration += duration;
                logBody = { documentVisibleDuration: duration, totalDocumentVisibleDuration: totalVisibleDuration, totalDocumentNotVisibleDuration: totalNotVisibleDuration };
                logEvent(lastQueryId, lastSessionInfo, "documentNotVisible", logBody);
            } else  { // Document went from NOT visible to visible
                totalNotVisibleDuration += duration;
                logBody = { documentNotVisibleDuration: duration, totalDocumentVisibleDuration: totalVisibleDuration, totalDocumentNotVisibleDuration: totalNotVisibleDuration };
                logEvent(lastQueryId, lastSessionInfo, "documentVisible", logBody);
            }
        }
    }

    function beforeUnloadHandler() {
        var logBody = {}, duration, now=+new Date();
        if (lastQueryId && lastSessionInfo) { // These are set after the first successful query or autosuggest request
            duration = now - lastVisiblityChange;
            lastVisiblityChange = now;
            if (document.hidden) {
                totalNotVisibleDuration += duration;
            } else {
                totalVisibleDuration += duration;
            }
            logBody = { totalDocumentVisibleDuration: totalVisibleDuration, totalDocumentNotVisibleDuration: totalNotVisibleDuration };
            logEvent(lastQueryId, lastSessionInfo, "documentUnloaded", logBody);
        }
    }

    function setLoggerLastQueryInfo(queryId, sessionInfo) {
        lastQueryId = queryId;
        lastSessionInfo = sessionInfo;
    }

    // Headers accepted by the Query Service REST API:
    // x-ads-token: identifies the user in oxygen
    // x-ads-client-id: identifies the client application
    // x-ads-client-feature-id: identifies the client application feature that uses search
    // x-ads-session-id: identifies the current session
    // x-ads-anon-session: true|false
    // x-ads-cache-control-req: <cache control request>
    // x-ads-search-acm-namespaces:
    // x-ads-debug: true|false
    // 'Content-Type': 'application/json'
    function sessionInfoToHeaders(sessionInfo) {

        var headers = {};

        if (sessionInfo.token) {
            headers[SearchQueryHeaders.TOKEN_HEADER_NAME] = sessionInfo.token;
        }
        if (sessionInfo.oauth2Token) {
            headers[SearchQueryHeaders.AUTHORIZATION_HEADER_NAME] = sessionInfo.oauth2Token ? ("Bearer " + sessionInfo.oauth2Token) : undefined;
        }
        headers[SearchQueryHeaders.ANON_SESSION_HEADER_NAME] = (sessionInfo.token || sessionInfo.oauth2Token) ? 'false' : 'true';
        headers[SearchQueryHeaders.CLIENT_ID_HEADER_NAME] = sessionInfo.clientId;
        headers[SearchQueryHeaders.CLIENT_FEATURE_ID_HEADER_NAME] = sessionInfo.clientFeatureId;
        headers[SearchQueryHeaders.SESSION_ID_HEADER_NAME] = sessionInfo.sessionId;
        if (sessionInfo.userId) {
            headers[SearchQueryHeaders.EXTRA_USER_ID_HEADER_NAME] = sessionInfo.userId;
        }
        if (sessionInfo.cacheControlReq) {
            headers[SearchQueryHeaders.CACHE_CONTROL_HEADER_NAME] = sessionInfo.cacheControlReq;
        }
        if (sessionInfo.acmNameSpace) {
            headers[SearchQueryHeaders.ACM_NAMESPACES_HEADER_NAME] = sessionInfo.acmNameSpace;
        }
        if (DEBUG) {
            headers[SearchQueryHeaders.DEBUG_HEADER_NAME] = DEBUG;
        }
        headers[SearchQueryHeaders.CONTENT_TYPE_HEADER_NAME] = 'application/json';
        headers[SearchQueryHeaders.ACCEPT_HEADER_NAME] = 'application/json';

        return headers;
    }

    function validateHeaders(headers) {
        var err = null;

        // Check OAUTH2 is used only w/ apidev/apistg/apiprod endpoints
        if (headers[SearchQueryHeaders.AUTHORIZATION_HEADER_NAME] && searchEnv !== 'apidev' && searchEnv !== 'apistg' && searchEnv !== 'apiprod') {
            err = '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' header for OAUTH2 not valid for ' + searchEnv + ' endpoint. Use one of apidev/apistg/apiprod endpoints.';
        }

        // Check OAUTH1 is not used w/ apidev/apistg/apiprod endpoints
        if (headers[SearchQueryHeaders.TOKEN_HEADER_NAME] && (searchEnv === 'apidev' || searchEnv === 'apistg' || searchEnv === 'apiprod')) {
            err = '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' header for OAUTH1 not valid for ' + searchEnv + ' endpoint.';
        }

        // Check OAUTH1 & OAUTH2 tokens are not both defined
        if (headers[SearchQueryHeaders.TOKEN_HEADER_NAME] && headers[SearchQueryHeaders.AUTHORIZATION_HEADER_NAME]) {
            err = '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' and ' + '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' headers can not coexist.';
        }

        // Check OAUTH2 is used w/ ExtraUserId header
        if (headers[SearchQueryHeaders.EXTRA_USER_ID_HEADER_NAME] && !headers[SearchQueryHeaders.AUTHORIZATION_HEADER_NAME]) {
            err = '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' OAUTH2 header must be used w/ ' + '\'' + SearchQueryHeaders.EXTRA_USER_ID_HEADER_NAME + '\'' + ' header.';
        }

        // Check clientId header exists
        if (!headers[SearchQueryHeaders.CLIENT_ID_HEADER_NAME]) {
            err = '\'' + SearchQueryHeaders.CLIENT_ID_HEADER_NAME + '\'' + ' header is required for all requests.';
        }

        // Check featureId header exists
        if (!headers[SearchQueryHeaders.CLIENT_FEATURE_ID_HEADER_NAME]) {
            err = '\'' + SearchQueryHeaders.CLIENT_FEATURE_ID_HEADER_NAME + '\'' + 'header is required for all requests.';
        }

        // Sanity check for content-type
        if (headers[SearchQueryHeaders.CONTENT_TYPE_HEADER_NAME] !== 'application/json') {
            err = '\'' + SearchQueryHeaders.CONTENT_TYPE_HEADER_NAME + '\'' + ' header must be application/json for all requests.';
        }

        if (!headers[SearchQueryHeaders.TOKEN_HEADER_NAME] &&
            !headers[SearchQueryHeaders.AUTHORIZATION_HEADER_NAME] &&
            !(headers[SearchQueryHeaders.SESSION_ID_HEADER_NAME] && headers[SearchQueryHeaders.ANON_SESSION_HEADER_NAME])) {
            err = '\'' + SearchQueryHeaders.TOKEN_HEADER_NAME + '\'' + ' or ' + '\'' + SearchQueryHeaders.AUTHORIZATION_HEADER_NAME + '\'' + ' header needs to be a valid value or both ' +
                '\'' + SearchQueryHeaders.SESSION_ID_HEADER_NAME + '\'' + ' and ' + '\'' + SearchQueryHeaders.ANON_SESSION_HEADER_NAME + '\'' + ' header need to be specified.';
        }

        return err;
    }

    function validateParameters(queryParams) {
        var err = null;
        var warn = null;

        if (!queryParams) {
            err = 'queryParams: needs to be specified.';
        }

        if (!queryParams.pid && queryParams.pid !== 0) {
            err = 'queryParams.pid: needs to be a valid Profile Id.';
        }

        if (queryParams.pid.length <= 0) {
            err = 'queryParams.pid: Profile Id needs to be a string with length greater than zero.';
        }

        if (!queryParams.query) {
            warn = 'queryParams.query empty.';
        }

        if (queryParams.page && (queryParams.pageOffset || queryParams.pageSize)) {
            warn = 'either queryParams.page or queryParams.pageOffset and queryParams.pageSize must be set.';
        }

        if (!queryParams.page && !queryParams.pageOffset && !queryParams.pageSize) {
            warn = 'queryParams.page, queryParams.pageOffset, queryParams.pageSize empty.';
        }

        if (queryParams.page < 0 || queryParams.page > 100) {
            warn = 'queryParams.page should be a positive integer between 1 and 100';
        }

        if (queryParams.pageOffset < 0) {
            warn = 'queryParams.pageOffset should be a positive integer greater than 1';
        }

        if (queryParams.pageSize < 0 || queryParams.pageSize > 100) {
            warn = 'queryParams.pageSize should be a positive integer between 1 and 100';
        }

        return { err: err, warn: warn };
    }

    function validateSavedQueriesParams(params, cb, isSaving) {
        var err = null;

        if (!cb || (cb && typeof cb !== "function")) {
            err = ("cb: callback was not a function");
        }

        if (!params.pid) {
            err = 'pid: needs to be specified.';
        }

        if (params.pid.length <= 0) {
            err = 'pid: Profile Id needs to be a string with length greater than zero.';
        }

        if (params.document && params.document.length <= 0) {
            err = 'document: Document needs to be a string with length greater than zero.';
        }

        if (isSaving) {
            if (!params.userQueries) {
                err = 'userQueries: userQueries is empty, nothing to save.';
            }

            if (!params.userQueries.userData) {
                err = 'userQueries.userData: User data is missing.';
            }
        }

        return err;
    }

    function composeQueryURL(serviceUrl, queryParams) {
        var queryUrl = serviceUrl;

        if (queryParams.pid) {
            queryUrl += '?pid=' + queryParams.pid;
        }
        if (queryParams.query) {
            queryUrl += '&query=' + encodeURIComponent(queryParams.query);
        }
        if (queryParams.language) {
            queryUrl += '&language=' + encodeURIComponent(queryParams.language);
        }
        if (queryParams.modifier) {
            queryUrl += '&modifier=' + encodeURIComponent(queryParams.modifier);
        }
        if (queryParams.filters) {
            queryUrl += '&filters=' + encodeURIComponent(queryParams.filters);
        }
        if (queryParams.sort && queryParams.sort !== 'relevance') {
            queryUrl += '&sort=' + encodeURIComponent(queryParams.sort);
        }
        if (queryParams.page && queryParams.page !== 1) {
            queryUrl += '&page=' + encodeURIComponent('' + queryParams.page);
        }
        if (queryParams.pageOffset && queryParams.pageOffset !== 0) {
            queryUrl += '&offset=' + encodeURIComponent('' + queryParams.pageOffset);
        }
        if (queryParams.pageSize && queryParams.pageSize !== 0) {
            queryUrl += '&pagesize=' + encodeURIComponent('' + queryParams.pageSize);
        }
        if (searchEnv !== DefaultSearchEnv) {
            queryUrl += '&env=' + encodeURIComponent(searchEnv);
        }

        queryUrl = queryUrl.replace(/^\?&/,'?');

        return queryUrl;
    }


    //
    // Filters
    //
    // docType~FILE!creator~C456QB2N9YSX!lastModifier~XABYDC12122!resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    // becomes
    // [['docType', 'FILE'], ['creator', 'C456QB2N9YSX'], ['lastModifier', 'XABYDC12122'], ['resourceIds', [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]]];
    //
    // arr -> str steps: 1. escape strings -- 2. concatenate using the delimiters
    // str -> arr steps: 1. break up string by delimiters and create arrays -- 2. unescape strings in arrays
    // this functions assumes that the escape characters have already been escaped so there would be no characters
    // inserted that would cause the original string to contain unexpected string
    function escapeString(str, char, escapedChar) {
        if (str.indexOf(FilterConfig.escapeCharacter) === -1) {
            return str;
        }
        return str.split(char).join(escapedChar);
    }

    function escapeFilterStr(str) {
        str = str || '';

        str = escapeString(str, FilterConfig.escapeCharacter, FilterEscapeSequences.escapeCharacterEscSeq);
        str = escapeString(str, FilterConfig.arrayListItemDelimiter, FilterEscapeSequences.arrayListItemDelimiterEscSeq);
        str = escapeString(str, FilterConfig.arrayListValueDelimiter, FilterEscapeSequences.arrayListValueDelimiterEscSeq);

        return str;
    }


    // from [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']];
    // to adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    function filterArrayListFilterToEscapedFilterStr(filterArr) {
        var strArr = filterArr.map(function(a) {
            var str = a[0];
            for (var i = 1; i < a.length; i++) {
                str += FilterConfig.arrayListValueDelimiter + a[i];
            }
            return str;
        });
        return strArr.join(FilterConfig.arrayListItemDelimiter);
    }


    //
    // [['docType', 'FILE'], ['creator', 'C456QB2N9YSX'], ['lastModifier', 'XABYDC12122'], ['resourceIds', [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]]];
    // becomes
    // docType~FILE!creator~C456QB2N9YSX!lastModifier~XABYDC12122!resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    //
    function filterArrayToEscapedFilterString(filterArr) {
        var strArr = filterArr.map(function(f) {
            if (FilterConfig.reservedArrayListFilterNames.indexOf(f[0]) !== -1 && Array.isArray(f[1])) {          // find reserved names that have values that should be converted to arrays and convert them to arrays
                var escapedFilterArrayStr = filterArrayListFilterToEscapedFilterStr(f[1]);
                return (escapeFilterStr(f[0]) + FilterConfig.nameValueDelimiter + escapedFilterArrayStr);
            } else {                                                            // normal name - value pair
                return escapeFilterStr(f[0]) + FilterConfig.nameValueDelimiter + escapeFilterStr(f[1]);
            }
        });

        return strArr.join(FilterConfig.listItemDelimiter);
    }


    //
    // if delimiter is ~ and the escape char is \ then:
    // 'a\\\\\\~aa~bb\\\\b' --> ['a\\\\\\~aa', 'bb\\\\b']
    //
    function filterStringToUnescapedArray(str, delimiterChar, escapeChar) {
        if (!str || !delimiterChar || !escapeChar) {
            return [];
        }

        var arr = [];
        var ch = '';
        var s1 = '';
        var escState = false;
        for (var i = 0; i < str.length; i++) {
            ch = str[i];
            if (ch === escapeChar) {
                escState = !escState;
                s1 += ch;
            } else if (ch === delimiterChar && !escState) {
                arr.push(s1);
                s1 = '';
                escState = false;
            } else {
                s1 += ch;
                escState = false;
            }
        }
        if (s1.length) {
            arr.push(s1);
        }
        return arr;
    }

    //
    // adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    // to
    // [['adsk.wipmaster', 'fs.file' 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]
    //
    function filterItemListArrayStringToItemListArray(itemListArrayString) {
        var itemListArray = filterStringToUnescapedArray(itemListArrayString, FilterConfig.arrayListItemDelimiter, FilterConfig.escapeCharacter);
        return itemListArray.map(function(itemList){
            return filterStringToUnescapedArray(itemList, FilterConfig.arrayListValueDelimiter, FilterConfig.escapeCharacter);
        });
    }

    //
    // Parse the list of name / value pairs and break up the arraylists to arrays
    // [['docType', 'FILE'], ['creator' 'C456QB2N9YSX'], ['lastModifier', 'XABYDC12122'], ['resourceIds', 'adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789']]
    // becomes
    // [['docType', 'FILE'], ['creator', 'C456QB2N9YSX'], ['lastModifier', 'XABYDC12122'], ['resourceIds', [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]]];
    //
    function filterNameValueItemArrayToFilterNameValueValueItemAndArrayListArray(nameValueItemArray) {
        var itemListArray = [];
        return nameValueItemArray.map(function(nameValuePair){
            if (FilterConfig.reservedArrayListFilterNames.indexOf(nameValuePair[0]) !== -1) {
                itemListArray = filterItemListArrayStringToItemListArray(nameValuePair[1]);
                return [nameValuePair[0], itemListArray];
            } else {
                return nameValuePair;
            }
        });
    }

    //
    // ['docType~FILE', 'creator~C456QB2N9YSX', 'lastModifier~XABYDC12122', 'resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789']
    // becomes
    // [['docType', 'FILE'], ['creator' 'C456QB2N9YSX'], ['lastModifier', 'XABYDC12122'], ['resourceIds', 'adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789']]
    //
    function filterItemValueStringArrayToItemValueArray(itemValueStringArray) {
        return itemValueStringArray.map(function(itemValueString) {
            return filterStringToUnescapedArray(itemValueString, FilterConfig.nameValueDelimiter, FilterConfig.escapeCharacter);
        });
    }

    //
    // break up a filter string, into an array of name-value pair  strings
    // docType~FILE!creator~C456QB2N9YSX!lastModifier~XABYDC12122!resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
    // becomes
    // ['docType~FILE', 'creator~C456QB2N9YSX', 'lastModifier~XABYDC12122', 'resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789']
    //
    function filterStringToItemArray(str) {
        return filterStringToUnescapedArray(str, FilterConfig.listItemDelimiter, FilterConfig.escapeCharacter);
    }


    function filterStringToUnescapedFilterArray(str) {
        if (!str || !str.length) {

            return [];
        }

        var itemArray = filterStringToItemArray(str);
        var itemValueArray = filterItemValueStringArrayToItemValueArray(itemArray);
        return filterNameValueItemArrayToFilterNameValueValueItemAndArrayListArray(itemValueArray);
    }



    //function unescapeString(filterArr, escapedSeq, unescapedStr) {
    //    if (str.indexOf(escapedSeq) === -1) {
    //        return filterArr;
    //    }
    //
    //    return filterArr.map(function(a) {
    //        return a.map(function(b) {
    //            return a.split(escapedSeq).join(unescapedStr); }); });
    //}
    //
    //
    ////
    //// 'a\\\\\\~aa~bb\\\\b' --> ['a\\\\\\~aa', 'bb\\\\b']
    ////
    //// s = 'a\\\\\\~aa~bb\\\\b'
    //// r = s.split(/\\\\/)
    //// r2 = r.map(function(a){ return a.split(/[^\\]~/) })
    //// s.split(/[^\\]~/) = ["a\~a", "bb\\b"]
    //// r4 = [r2[0][0] + '\\\\' + r2[1][0], r2[1][1] + '\\\\' + r2[2][0]]
    //// 1. split on double escapes ( \\ )
    //// 2. split on separators
    //// 3. put back double escapes
    //// 4. create new array from this by concating the last of subarray to first of next subarray
    ////
    //function filterStringToUnescapedFilterArray(str) {
    //    if (!str || !str.length) {
    //
    //        return [];
    //    }
    //
    //    str = str || '';
    //    // string -> name-value array
    //    var filterArr = str.split(FilterConfig.listItemDelimiter).map(function(f) {
    //            return f.split(FilterConfig.nameValueDelimiter); }) || [];
    //
    //    // find reserved names that have values that should be converted to arrays and convert them to arrays
    //    filterArr = filterArr.map(function(f) {
    //        if (qsReservedArrayListFilterNames.indexOf(f[0]) === -1) {
    //            return f;
    //        }
    //
    //        return f[1].split(FilterConfig.arrayListItemDelimiter).map(function(values) {
    //            return a.split(FilterConfig.arrayListValueDelimiter);
    //        });
    //    });
    //
    //    if (filterArr.length === 0) {
    //        return filterArr;
    //    }
    //
    //    // Unescape escaped strings
    //    filterArr = unescapeString(filterArr, FilterEscapeSequences.arrayListValueDelimiterEscSeq, FilterConfig.arrayListValueDelimiter);
    //    filterArr = unescapeString(filterArr, FilterEscapeSequences.arrayListItemDelimiterEscSeq, FilterConfig.arrayListItemDelimiter);
    //
    //    return filterArr;
    //}


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //
    // "Public" API structures and calls
    //


    /**
     * @typedef SearchResultId - A structure describing the source of this result
     * @memberof Autodesk.Search
     * @property {string} sourceSystem - id of the source system
     * @property {string} type - type of the result in the source system, for example 'file'
     * @property {string} id - id of the result in the source system
     * @property {int} version - version of the result in the source system
     * @property {string} elementId - elementId of the result in the source system if applicable (used for elements)
     */

    /**
     * @typedef QueryResult
     * @memberof Autodesk.Search
     * @property {string} queryId - guid of the query, unique for each request
     * @property {int} queryResultCount - approximate total result count
     * @property {int} approximateNumberOfPages - approximate number of pages of search results, based on the page size specified in the search profile
     * @property {int} time - approximate time the query took (ms)
     * @property {string[]} messages - Array of messages the query returned. This can contain multiple warnings or errors even if the query returns results
     * @property {string[]} availableSortTypes - description of the ways the results can be sorted using the sort parameter in the query
     * @property {Object[]} queryResults - the array of results
     * @property {Autodesk.Search.SearchResultId} queryResults[].searchResultId - a structure describing the source of this result
     * @property {string} queryResults[].source - source of the result
     * @property {string} queryResults[].title - title of the result
     * @property {string} queryResults[].snippet - context of the result, shows it highlighted
     * @property {string} queryResults[].url - url associated with the result if available
     * @property {string} queryResults[].creator - creator of the result if available
     * @property {string} queryResults[].lastModifier - last modifier of the result if available
     * @property {date} queryResults[].dateCreated - date of creation of the result if available
     * @property {date} queryResults[].dateModified - date of last modification of the result if available
     * @property {int} queryResults[].positionHint - date of last modification of the result if available
     * @property {Object} queryResults[].stringFields - result fields containing extra result information for profile specific fields
     * @property {string[]} queryResults[].viewerContexts - mappings to viewer ids and views associated with the element
     * @property {Object[]} federatedResults - list of results from federated search sources as specified in the search profile
     */

    /**
     * @typedef CategoriesResult
     * @memberof Autodesk.Search
     * @property {string} queryId - guid of the query, unique for each request
     * @property {Object[]} queryCategories - the array of categories
     * @property {string} queryCategories[].categoryName - name of category
     * @property {string} queryCategories[].categoryType - type of category, for example "term"
     * @property {Object[]} queryCategories[].values - list of values found for the category and the number of instances found
     * @property {string} queryCategories[].values[].value - a value for the category, this can be used as a filter in subsequent queries with the category name, as in ...&filter=cat1:val11|cat1:val12|cat2:val22
     * @property {number} queryCategories[].values[].count - an approximate count for the instances this category value was found
     */

    /**
     * @typedef SuggestionsResult
     * @memberof Autodesk.Search
     * @property {string} queryId - guid of the query, unique for each request
     * @property {Object[]} textSuggestions - The array of search term suggestions. These are 'normal' search terms or expressions that could be used as the query parameter expanding the current word root.
     * @property {int} textSuggestions[].positionHint - the position where the suggestion should be displayed
     * @property {int} textSuggestions[].suggestion - the suggestion text. The matching substring is highlighted the same way as search results.
     * @property {Object[]} suggestionGroups - A list of specific groups of search results that the search would return if executed with the current search term.
     * @property {string} suggestionGroups[].modifier - search modifier ID
     * @property {string} suggestionGroups[].displayName - Name of group type, for example 'fileSuggestions' if the source system is a file system for this group of suggestions
     * @property {int} suggestionCount - the number of suggestions available for that group
     * @property {Object[]} suggestionGroups[].suggestions - A list of objects describing the suggested results
     * @property {Autodesk.Search.SearchResultId} suggestionGroups[].suggestions[].searchResultId - a structure describing the source of this result
     * @property {string} suggestionGroups[].suggestions[].title - Title or name of this particular result
     * @property {string} suggestionGroups[].suggestions[].creator - Id or name of the creator of this document
     * @property {string} suggestionGroups[].suggestions[].dateCreated - Date of the creation of the document in ISO 8601 format
     * @property {string} suggestionGroups[].suggestions[].dateModified - Date of the modification of the document in ISO 8601 format
     * @property {string} suggestionGroups[].suggestions[].lastModifier - Id or name of the last modifier of this document
     * @property {int} suggestionGroups[].suggestions[].positionHint - the position where the suggestion should be displayed
     * @property {string} suggestionGroups[].suggestions[].snippet - A snippet of the text found in the field
     * @property {string} suggestionGroups[].suggestions[].source -
     * @property {string} suggestionGroups[].suggestions[].stringFields -
     * @property {string} suggestionGroups[].suggestions[].url - The url of the original or related document
     * @property {string} suggestionGroups[].suggestions[].viewerContexts -
     */

    /**
     * Health check and service status information
     * @typedef ServiceInfoResult
     * @memberof Autodesk.Search
     * @property {boolean} indexingWorkQueueHealthy - True if indexing is working properly
     * @property {boolean} searchesSuccessful - True if searches are succeeding
     * @property {boolean} searchClusterRunning - True if the search cluster is healthy
     * @property {Object} versionInfo - Version info of the Search REST API
     * @property {string} versionInfo.version - Version number of the Search REST API in the format of XX.XX.XX as in <major>.<minor>.<patch>
     * @property {date} versionInfo.buildDate - Build Date of the Search REST API
     * @property {string} javaVersion - Java Version of the Search REST API
     * @example An example ServiceInfoResult would be:
     * {
     *  "indexingWorkQueueHealthy": true,
     *  "searchesSuccessful": false,
     *  "searchClusterRunning": false,
     *  "versionInfo": {
     *      "version": "1.27-SNAPSHOT",
     *      "buildDate": "2015-11-03T20:20 GMT-0800"
     *  },
     * "javaVersion": "1.7.0_80"
     * }
     */

    /**
     * This is the callback that is called when the http request to the Query Service REST API 'Search' endpoint is complete
     * and on success it returns a list of search results. The structure of these results is as described in the {Autodesk.Search.QueryResult} structure
     *
     * @callback SearchAjaxCallback
     * @memberof Autodesk.Search
     * @param {int} err - the status code of the response, when the ajax call succeeds, it's null, otherwise set to the HTTP status code of the response. Possible error values include 401 (if a required header is missing, for example) or 404 (if an endpoint is not found) or 500 (Internal error)
     * @param {Autodesk.Search.QueryResult|Autodesk.Search.CategoriesResult|Autodesk.Search.SuggestionsResult|Autodesk.Search.ServiceInfoResult} data - the result object if the operation is successful or null if it failed
     */

     /**
      * @typedef UserQueries
      * @memberof Autodesk.Search
      * @property {int} userData.allocation.max - maximum count of queries allowed to be saved
      * @property {int} userData.allocation.used - the amount of queries saved by the user
      * @property {string} userData.creationDate - the date that the userData was created
      * @property {string} userData.lastModifiedDate - the date that the userData was updated
      * @property {string} userData.version - version for the user data
      * @property {string} documentQueries.document.id - document identifier
      * @property {string} documentQueries.document.name - document name
      * @property {string} documentQueries.queries[].querySet[].query - query string
      * @property {string} documentQueries.queries[].querySet[].queryId - query identifier
      * @property {string} documentQueries.queries[].querySet[].geometry - geometry
      * @property {string} documentQueries.queries[].creationDate - the date that the query ser was created
      * @property {string} documentQueries.queries[].lastModifiedDate - the date that the query set was updated
      * @property {string} documentQueries.version - version for the document data
      */

      /**
       * @typedef SaveQueryResponse
       * @memberof Autodesk.Search
       * @property {string} userDataVersion - new version for the user data saved
       * @property {string} documentQueriesVersion - new version for the document data saved
       */


    /**
     * Logs a query event
     *
     * @function logEvent
     * @memberof Autodesk.Search.SearchQueryAPI.prototype
     * @instance
     * @param {string} queryId - unique id of the query returned in the query results
     * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user id if available (if user data needs to be searched). This helps optimize future searches.
     * @param {string} type - type of log entry, for example 'info', 'error', or event type
     * @param {string} body - log message
     * @param {Autodesk.Search.SearchAjaxCallback} cb - log callback, called on completion of the log call
     */
     function logEvent(queryId, sessionInfo, type, body, cb) {
        var hadCb = !!cb, beaconSent = false;

        if (cb && typeof cb !== "function") { throw new Error("Callback was not a function"); }

        cb = cb || function () {};

        var logURL = searchEndPoint + SearchQueryAPIs.Log +
            '?queryId=' + queryId +
            '&type=' + encodeURIComponent(type) + // Note: if &type= is first, Adblockers block the logging call
            '&sessionId=' + (sessionInfo.sessionId || '') +
            '&userId=' + (sessionInfo.userId || '') +
            '&clientId=' + (sessionInfo.clientId || '') +
            '&clientFeatureId=' + (sessionInfo.clientFeatureId || '') +
            '&body=' + encodeURIComponent(JSON.stringify(body)) +
            '&_n=' + Math.floor(Math.random() * 100000);  // nonce to prevent caching

        var logCb = function (err, info) {
            if (err) { console.debug('Logged(err:' + (err || 'noerr') + ' info:' + (info || '-') + '): ' + logURL); }
            cb(err);
        };

        // to prevent CORS preflight, we need to keep it simple
        // for more, see http://www.html5rocks.com/en/tutorials/cors/#toc-types-of-cors-requests
        var headers = {};
        headers[SearchQueryHeaders.CONTENT_TYPE_HEADER_NAME] = 'text/plain';

        // Use a beacon if available & there is no callback
        //if (!hadCb && navigator.sendBeacon) {
        //    beaconSent = navigator.sendBeacon(logURL);
        //}

        if (!beaconSent) {
            ajaxReq(logURL, headers, logCb);
        }
    }


    function pagePerformanceLogger(queryId, sessionInfo) {
        var logBody, performanceObj;

        logBody = {
            url: document && document.location && document.location.href,
            userAgent: navigator.userAgent,
            hardwareConcurrency: navigator.hardwareConcurrency,
            language: navigator.language,
            maxTouchPoints: navigator.maxTouchPoints,
            versionInfo: versionInfo,
            performance: null
        };

        if (!isPagePerformanceLogged) {
            if (window && window.performance) {

                performanceObj = clonePerformanceObject();

                // Add in SDK timings
                performanceObj.searchSDKTimings = {
                    fetchStartToSearchSDKLoaded: searchSDKLoaded - performanceObj.timing.fetchStart,
                    fetchStartToSearchSDKInstantiated: searchSDKInstantiated - performanceObj.timing.fetchStart,
                    fetchStartToNow: +new Date() - performanceObj.timing.fetchStart
                };

                // Add in calculated times. See performance object descriptions: http://w3c.github.io/navigation-timing/#h-processing-model
                performanceObj.timingDelta = {};
                if (performanceObj.timing) {
                    performanceObj.timingDelta.navigationStartToDomInteractive = performanceObj.timing.domInteractive - performanceObj.timing.navigationStart;
                    performanceObj.timingDelta.dns = performanceObj.timing.domainLookupEnd - performanceObj.timing.domainLookupStart;
                    performanceObj.timingDelta.htmlDownloadTime = performanceObj.timing.responseEnd - performanceObj.timing.responseStart;
                    performanceObj.timingDelta.tcpConnectionSetup = performanceObj.timing.connectEnd - performanceObj.timing.connectStart;
                    if (performanceObj.timing.secureConnectionStart) { performanceObj.timingDelta.secureConnectionSetup = performanceObj.timing.connectEnd - performanceObj.timing.secureConnectionStart; }

                    // Starting w/ the fetchStart time, calculate the delta duration to all other times
                    Object.keys(performanceObj.timing).forEach(function(key) {
                        if (performanceObj.timing[key] !== 0) {
                            performanceObj.timingDelta['fetchStartTo' + key[0].toUpperCase() + key.slice(1)] = performanceObj.timing[key] - performanceObj.timing.fetchStart;
                        }
                    });
                }

                // Remove the raw timing data (reduce logging URL parameter size)
                delete performanceObj.timing;

                logBody.performance = performanceObj;

            } else {
                logBody.performance = {};
                logBody.noPerformance = true;
            }
            logEvent(queryId, sessionInfo, "performance", logBody);
        }

        isPagePerformanceLogged = true;
    }

    function clonePerformanceObject() {
        if (!window || !window.performance) { return {}; }

        var clonePerformanceSubSection = function(section) {
            if (!window.performance[section]) { return null; }

            return Object.keys(Object.getPrototypeOf(window.performance[section])).reduce(function(obj, k){
                if (window.performance[section][k] >= 0) { obj[k] = window.performance[section][k]; }
                return obj;
            }, {});
        };

        // Special work is needed to clone this built-in class
        return Object.keys(Object.getPrototypeOf(window.performance)).reduce(function(obj, section){
            if ((section.indexOf('onwebkit') !== 0) && window.performance[section] && typeof window.performance[section] === 'object') { obj[section] = clonePerformanceSubSection(section); }
            return obj;
        }, {});
    }

    function addClickLoggingCallbacksToSERP(queryId, sessionInfo, data /* Modifies */) {
        var allResults, querySource;

        if (!data) { return; }

        querySource = "SERP";
        allResults = [].concat(data.queryResults||[], data.federatedResults||[]); // TODO(jwo): Correctly insert AKN result in proper position

        // Add click logging callbacks to each result
        allResults.forEach(function(result, i) {
            addClickLoggingCallbacksToResult(result, i+1, queryId, sessionInfo, querySource, '');
        });
    }

    function addClickLoggingCallbacksToSuggestions(queryId, sessionInfo, data /* Modifies */) {
        var querySource;

        if (!data) { return; }
        querySource = "suggestions";

        (data.suggestionGroups||[]).forEach(function(suggestionGroup) {
            var suggestionGroupName = suggestionGroup.name;
            // Add click logging callbacks to each result
            suggestionGroup.suggestions.forEach(function(suggestion, i) {
                addClickLoggingCallbacksToResult(suggestion, i+1, queryId, sessionInfo, querySource, suggestionGroupName);
            });
        });

        (data.textSuggestions||[]).forEach(function(termSuggestion, i) {
            addClickLoggingToTextSuggestion(termSuggestion, i, queryId, sessionInfo, querySource, '');
        });
    }

    function addClickLoggingToTextSuggestion(result, position, queryId, sessionInfo, querySource, subQuerySource) {
        result.logClick = function() {
            var logBody = { position:position, url:'', querySource:querySource, subQuerySource:subQuerySource };
            if (result.suggestion) { logBody.title = result.suggestion; }

            logEvent(queryId, sessionInfo, "click", logBody);
        };
    }

    function addClickLoggingCallbacksToResult(result, position, queryId, sessionInfo, querySource, subQuerySource) {
        result.logClick = function() {
            var logBody = { position:position, url:'', querySource:querySource, subQuerySource:subQuerySource };
            if (result.searchResultId) { // Organic results have this field
                logBody.id = result.searchResultId.id;
                logBody.sourceSystem = result.searchResultId.sourceSystem;
            }
            if (result.url) { logBody.url = result.url; } // AKN results have this field

            logEvent(queryId, sessionInfo, "click", logBody);
        };
    }


    /**
     * The Search Query Javascript API main object
     * @class SearchQueryAPI
     * @memberof Autodesk.Search
     * @classdesc This is the main constructor that will provide simplified access to the Query Service REST API
     * @param env {string} environment specifier - one of dev, stg, prod (default)
     */
    function SearchQueryAPI(env) {
        if (env && SearchApiUrls.hasOwnProperty(env)) {
            searchEnv = env;
        } else {
            searchEnv = DefaultSearchEnv;
        }
        searchEndPoint = SearchApiUrls[searchEnv];

        var _this = this;

        /**
        * Returns the Search Query Javascript API version
        * @function
        * @memberof Autodesk.Search.SearchQueryAPI.prototype
        * @instance
        * @returns {string}
        */
        this.getApiVersion = function() {
            return versionInfo.version;
        };

        /**
         * Search Query REST API version that is compatible with this API. It is recommended that this version is equal to the version that is returned by [queryServiceInfo]{@link Autodesk.Search.SearchQueryAPI#queryServiceInfo}
         * @see {@link Autodesk.Search.SearchQueryAPI#queryServiceInfo|queryServiceInfo}
         * @function getServerMinRestApiVersion
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @returns {string}
         */
        this.getServerMinRestApiVersion = function() {
            return versionInfo.minRestApiVersion;
        };

        /**
         * Returns the Search Query Javascript API version
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @returns {string}
         */
        this.getBuildDate = function() {
            return versionInfo.buildDate;
        };

        /**
         * Returns the Search Query Javascript API build number
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @returns {string}
         */
        this.getBuildNumber = function() {
            return versionInfo.buildNumber;
        };

        /**
         * Returns the available Environments
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @returns {Array}
         */
        this.getServiceEnvironments = function() {
            return Object.keys(SearchApiUrls);
        };


        /**
         * Returns the reserved Search Query filter list item delimiter
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @returns {Autodesk.Search.FilterConfig}
         * @example
         * filter=resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
         * where '*' is the array list value delimiter and "'" is the array list item delimiter
         * so the above filters have 3 items: adsk.wipmaster*fs.file*id123 and adsk.wipmaster*fs.file*id456 and adsk.wipmaster*fs.file*id789
         * and in this case every item has 3 values.
         * effect: restricts search to urns adsk.wipmaster:fs.file:id123, adsk.wipmaster:fs.file:id456, adsk.wipmaster:fs.file:id789
         */
        this.getFilterConfig = function() {
            return FilterConfig;
        };

        /**
         * Returns the reserved Search Query reserved filter names that can hold Array lists of filter values
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @param str {string} String to convert
         * @instance
         * @returns {string}
         * @example
         * ['resourceIds', [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]]
         * would be converted to
         * resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
         */
        this.reservedFilterStringToFilterArray = function(str) {
            return filterStringToUnescapedFilterArray(str);
        };


        /**
         * Returns the Search Query reserved filter names that can hold Array lists of filter values
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @param arr {Array} Array to convert to String
         * @instance
         * @returns {string}
         * @example
         * resourceIds~adsk.wipmaster*fs.file*id123'adsk.wipmaster*fs.file*id456'adsk.wipmaster*fs.file*id789
         * would be converted to ['resourceIds', [['adsk.wipmaster', 'fs.file', 'id123'], ['adsk.wipmaster', 'fs.file', 'id456'], ['adsk.wipmaster', 'fs.file', 'id789']]]
         */
        this.reservedFilterArrayToFilterString = function(arr) {
            return filterArrayToEscapedFilterString(arr);
        };


        /**
         * Returns the language code from the BCP47 code
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @param bcp47Code Code to convert
         * @instance
         * @returns {string}
         * @example
         * getLanguageFromBcp47Code('en') returns 'ENU'
         * getLanguageFromBcp47Code('de') returns 'DEU'
         */
        this.getLanguageFromBcp47Code = function(bcp47Code) {
            return BCP47ToUPILanguageCode[bcp47Code];
        };


        /**
         * Utility function to help highlighting
         *  Replaces the characters "\uE000" and "\uE001" w/ HTML <em>highlighted</em> or given tags. Sanitizes any HTML tags in the input string. Replaces null & undefined w/ an empty string. Casts non-strings as strings.
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @param {string} str String to sanitize
         * @param {string} replaceStart - string to match for the beginning of the string to replace
         * @param {string} replaceEnd - string to match for the beginning of the string to replace
         * @returns {string}
         * @example
         * var sanitizedResult = qsAPI.sanitizeAndHighlightString('We just found \uE000something\uE001', '<em class="highlight">', '</em>');
         * will result in
         * sanitizedResult === 'We just found <em class="highlight">something</em>';
        **/
        this.sanitizeAndHighlightString = function(str, replaceStart, replaceEnd) {
            var returnStr, dom, isHighlighted=false;

            if (!str) { return ''; }

            replaceStart = replaceStart||"<em class='highlight'>";
            replaceEnd = replaceEnd||"</em>";

            dom = document.createElement('div');
            dom.textContent = str;
            returnStr = dom.innerHTML;
            returnStr = returnStr.replace(/[\uE000\uE001]/g, function(token, position, tmpStr){
                if (token === '\uE000' && !isHighlighted) { isHighlighted = true; return replaceStart; }
                else if (token === '\uE001' && isHighlighted) { isHighlighted = false; return replaceEnd; }
                else { console.warn("Warning: Incorrect number of highlight tokens in string: " + str); }
            });
            if (isHighlighted) { returnStr += replaceEnd; console.warn("Warning: Incorrect number of highlight tokens in string: " + str); }
            return returnStr;
        };

        /**
         * Utility function to convert highlighted strings to plain strings
         *  Removes the characters "\uE000" and "\uE001". Replaces null & undefined w/ an empty string. Casts non-strings as strings.
         * @function
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @param str
         * @returns {string}
         * @example
         * var plainString = qsAPI.removeHighlightTokens('We just found \uE000something\uE001');
         * will result in
         * plainString === 'We just found something';
        **/
        this.removeHighlightTokens = function(str) {
            if (!str) { return ''; }
            str = str.replace(/[\uE000\uE001]/g, '');
            return str;
        };

        /**
         * Returns the list of search results that can be found for a search term. The result are returned through the callback {queryCb}
         *
         * @function query
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.QueryParameterType} queryParams - The parameters needed to call the search query
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - Callback called on completion of the search query: cb(err, data).
         */
        this.query = function (queryParams, sessionInfo, cb) {
            var queryURL, sent;

            // TODO(jwo): either freeze queryParams & sessionInfo, or copy it (can't trust the client no not modify it)

            var queryParamsErr = validateParameters(queryParams);
            if (queryParamsErr && queryParamsErr.err) {
                console.error("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr);
                setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr.err, null); }, 0);
                return;
            } else if (queryParamsErr && queryParamsErr.warn) {
                console.warn("Query Parameters for the Query Service REST API - " + queryParamsErr.warn);
            }

            queryURL = composeQueryURL(searchEndPoint + SearchQueryAPIs.Query, queryParams);
            // console.debug('Search Query URL: ' + queryURL);

            var headers = sessionInfoToHeaders(sessionInfo);
            var headerErr = validateHeaders(headers);
            if (headerErr) {
                console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
                setTimeout(function() { cb("Invalid Request Headers for the Query Service REST API - " + headerErr, null); }, 0);
                return;
            }

            ajaxReq(queryURL, headers, function(err, data) {
                if (!err && data) {
                    addClickLoggingCallbacksToSERP(data.queryId, sessionInfo, data);
                    deepFreeze(data); // Disallow modification of data needed by click logging
                    pagePerformanceLogger(data.queryId, sessionInfo); // Log (only once) how long the page load time took
                    setLoggerLastQueryInfo(data.queryId, sessionInfo);
                }
                cb(err, data);
            });
        };

        /**
         * Returns the list of categories that can be found for a search term. The categories are returned through the callback {categoriesCb}
         *
         * @function findCategories
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.QueryParameterType} queryParams - The parameters needed to call the query
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - Callback called on success of the categories query: cb(err, data)
         **/
        this.findCategories = function(queryParams, sessionInfo, cb) {
            var queryURL;

            var queryParamsErr = validateParameters(queryParams);
            if (queryParamsErr && queryParamsErr.err) {
                console.error("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr);
                setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr.err, null); }, 0);
                return;
            } else if (queryParamsErr && queryParamsErr.warn) {
                console.warn("Query Parameters for the Query Service REST API - " + queryParamsErr.warn);
            }

            queryURL = composeQueryURL(searchEndPoint + SearchQueryAPIs.Categories, queryParams);
            // console.debug('Categories Query URL: ' + queryURL);

            var headers = sessionInfoToHeaders(sessionInfo);
            var headerErr = validateHeaders(headers);
            if (headerErr) {
                console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
                setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + headerErr, null); }, 0);
                return;
            }

            ajaxReq(queryURL, headers, cb);
        };

        /**
         * Returns the list of suggestions that can be found for a search term. The categories are returned through the callback {suggestionsCb}
         *
         * @function suggest
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.QueryParameterType} queryParams - The parameters needed to call the suggestions query
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - Callback called on success of the suggestions query: cb(err, data)
         */
         this.suggestionTimeoutId = null;
         this.lastSentSuggestionNum = -1;
         this.lastDisplayedSuggestionNum = -1;
         this.suggest = function (queryParams, sessionInfo, cb) {
            var suggestFn = function(queryParams, sessionInfo, cb) {
                var queryURL, suggestionNum;

                var queryParamsErr = validateParameters(queryParams);
                if (queryParamsErr && queryParamsErr.err) {
                    console.error("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr);
                    setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + queryParamsErr.err, null); }, 0);
                    return;
                } else if (queryParamsErr && queryParamsErr.warn) {
                    console.warn("Query Parameters for the Query Service REST API - " + queryParamsErr.warn);
                }

                suggestionNum = _this.lastSentSuggestionNum + 1;
                _this.lastSentSuggestionNum = suggestionNum;

                queryURL = composeQueryURL(searchEndPoint + SearchQueryAPIs.Suggestions, queryParams);
                // console.debug('Suggestion Query URL: ' + queryURL);

                var headers = sessionInfoToHeaders(sessionInfo);
                var headerErr = validateHeaders(headers);
                if (headerErr) {
                    console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
                    setTimeout(function() { cb("Invalid Request Headers for the Query Service REST API - " + headerErr, null); }, 0);
                    return;
                }

                var cbInner = function(err, data) {
                    // Only display newer results than currently displayed result
                    if (suggestionNum > _this.lastDisplayedSuggestionNum) {
                        _this.lastDisplayedSuggestionNum = suggestionNum;
                        if (!err) {
                            addClickLoggingCallbacksToSuggestions(data.queryId, sessionInfo, data);
                            pagePerformanceLogger(data.queryId, sessionInfo); // Log (only once) how long the page load time took
                            setLoggerLastQueryInfo(data.queryId, sessionInfo);
                        }
                        cb(err, data);
                    }
                };

                ajaxReq(queryURL, headers, cbInner);
            };

            clearTimeout(_this.suggestionTimeoutId);
            _this.suggestionTimeoutId = setTimeout(function() {
                suggestFn(queryParams, sessionInfo, cb);
            }, suggestionDelay);

        };

        /**
         * Logs a query event
         *
         * @function logEvent
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {string} queryId - unique id of the query returned in the query results
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user id if available (if user data needs to be searched). This helps optimize future searches.
         * @param {string} type - type of log entry, for example 'info', 'error', or event type
         * @param {string} body - log message
         * @param {Autodesk.Search.SearchAjaxCallback} cb - log message
         */
        this.logEvent = logEvent; // Shared public & private


        /**
         * Returns the version info for the Query Service REST API as well as some basic health data.
         * The info is returned through the callbacks passed through the parameters
         *
         * @function queryServiceInfo
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - cb(err, data)
         */
        this.queryServiceInfo = function(sessionInfo, cb) {
            var queryHealthURL = searchEndPoint + SearchQueryAPIs.Health;
            // console.debug('Health Query URL: ' + queryHealthURL);

            var headers = sessionInfoToHeaders(sessionInfo);
            var headerErr = validateHeaders(headers);
            if (headerErr) {
                console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
                setTimeout(function() { cb("Invalid Request Headers for the Query Service REST API - " + headerErr, null); }, 0);
                return;
            }

            var localCb = function(err, data) {
                var minRestApiVersionSplit;
                var remoteRestApiVersionSplit;

                // Check the API version vs. local required version
                minRestApiVersionSplit = versionInfo.minRestApiVersion.split('.').map(function(a){ return parseFloat(a); });
                if (!err && data.versionInfo && data.versionInfo.version) {
                    remoteRestApiVersionSplit = data.versionInfo.version.split('.').map(function(a){ return parseFloat(a); });
                    var versionOK = false;
                    var i = 0;
                    while (i < remoteRestApiVersionSplit.length || i < minRestApiVersionSplit.length) {
                        if ((remoteRestApiVersionSplit[i]||0) > (minRestApiVersionSplit[i]||0)) {   // if the most significant digit in the remote is greater than the min we're good
                            versionOK = true;
                            break;
                        } else if ((remoteRestApiVersionSplit[i]||0) < (minRestApiVersionSplit[i]||0)) {    // if the most significant digit in the remote is less than the min we fail
                            versionOK = false;
                            break;
                        }
                        // otherwise keep on checking

                        i = i + 1;
                    }
                    versionOK = versionOK || (i === minRestApiVersionSplit.length);
                    if (!versionOK) { console.error('Error: Remote API version (' + data.versionInfo.version + ') is older than required (' + versionInfo.minRestApiVersion + ')'); }
                }

                cb(err, data);
            };

            ajaxReq(queryHealthURL, headers, localCb);
        };


        /**
         * Serializes the passed URL encoded query parameters
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/History}
         * @example The query parameters of
         * {
         *     pid: 1,                           // profile id
         *     query: 'fox',                     // query string
         *     sort: 'dateDescending',
         *     page: 1,
         *     filters: 'content.name:dog|creator.userIdValue:uid2'
         * }
         * turn into the query
         * [apiurl]/qs/v3/search?pid=1&query=fox&filters=content.name%3Adog%7Ccreator.userIdValue%3Auid2&sort=dateDescending&page=1
         * and it gets serialized into the main window.location like this:
         * [windowsurl]/[path]?adqs=pid%3D1%26query%3Dfox%26filters%3Dcontent.name%253Adog%257Ccreator.userIdValue%253Auid2%26sort%3DdateDescending%26page%3D1
         *
         * @function queryParamsToUrl
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.QueryParameterType} queryParams - The parameters needed to call a query
         * @param {string} loc - Url of the current window/frame location
         * @param {History} history - History object where the new state can be serialized
         * @param {string?} prefix - Url of the current window/frame location
         *
         * @returns {boolean} True if success, false if there was a problem assigning the search parameters to the URL
         */
        this.queryParamsToUrl = function(queryParams, loc, history, prefix) {
            var url;

            // TODO(jwc): Make sure that the original URL parameters are preserved, for example: examples/?testing=the_url&more=testing#someOtherStuffHere
            if (!loc || !history || !history.pushState) {
                console.error("queryParamsToUrl() requres a History object in the urlLocation parameter such as window.history.");
                return false;
            }

            url = new URL(loc);
            url.search = new URL(composeQueryURL(searchEndPoint + SearchQueryAPIs.Query, queryParams)).search;

            try {
                history.pushState(null, '', url);
            } catch (err) {
                // Fallback to using the #HASH portion of the URL
                document.location.hash = url.search;
            }

            return true;
        };


        /**
         * Serializes the passed query parameters from the passed url
         *
         * @function readUrlParameters
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Location} loc - URL with parameters to serialize
         * @returns {Autodesk.Search.QueryParameterType} - The parameters needed to call the suggestions query
         */
        this.urlParametersToQueryParams = function(loc) {
            var queryParams = {
                pid: undefined,
                query: null,
                modifier: null,
                filters: '',
                sort: '',
                page: 1,
                language: '',
                oauth2Token: null,
                env: null
            };

            var ignoredParams = {
                pid: 1 // we don't overwrite pid
            };

            var paramMap = {
                access_token: 'oauth2Token',
                expires_in: 'oauth2TokenExpiresIn'
            };

            var url = new URL(loc);
            var urlSearchAndHash = (url.search||'').slice(1) + '&' + (url.hash||'').slice(1);
            var arrParams = parseUrlParams(urlSearchAndHash);
            arrParams.forEach(function(p) {
                if (typeof queryParams[p[0]] !== undefined && !ignoredParams[p[0]]) {
                    queryParams[(paramMap[p[0]] || p[0])] = p[1];
                }
            });

            return queryParams;
        };

        /**
         * Returns the user queries object containing the saved queries for the user and document.
         * If no document is passed then returns all the queries saved for the user.
         * The result are returned through the callback {cb}
         *
         * @function getUserQueries
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.SavedQueriesParameterType} params - The parameters needed to call the search query
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - Callback called on completion of the search query: cb(err, data).
         * @returns {Autodesk.Search.SavedQueries} user queries object
         */
        this.getUserQueries = function(params, sessionInfo, cb) {
            var paramsErr = validateSavedQueriesParams(params, cb);
            if (paramsErr) {
                console.error("Invalid Query Parameters for the Query Service REST API - " + paramsErr);
                setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + paramsErr, null); }, 0);
                return;
            }

            var savedQueriesURL = searchEndPoint + SearchQueryAPIs.SavedQueries +
               '?pid=' + params.pid +
               '&document=' + (params.document ? params.document : '') +
               '&_n=' + Math.floor(Math.random() * 100000);  // nonce to prevent caching

            var headers = sessionInfoToHeaders(sessionInfo);
            var headerErr = validateHeaders(headers);
            if (headerErr) {
               console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
               setTimeout(function() { cb("Invalid Request Headers for the Query Service REST API - " + headerErr, null); }, 0);
               return;
            }

            ajaxReq(savedQueriesURL, headers, function(err, data) {
               cb(err, data);
           }, null, null, null, true);
        };

        /**
         * Saved the user queries object that contains the all the queries saved for the user and document.
         * The result are returned through the callback {cb}
         *
         * @function saveUserQueries
         * @memberof Autodesk.Search.SearchQueryAPI.prototype
         * @instance
         * @param {Autodesk.Search.SavedQueriesParameterType} params - The parameters needed to call the search query
         * @param {Autodesk.Search.SessionInfoType} sessionInfo - The session information for the query: clientId, clientFeatureId, sessionId and oxygen user token (if user data needs to be searched)
         * @param {Autodesk.Search.SearchAjaxCallback} cb - Callback called on completion of the search query: cb(err, data).
         * @returns {Autodesk.Search.SaveQueryResponse} the new versions of the objects saved.
         */
        this.saveUserQueries = function(params, sessionInfo, cb) {
            var paramsErr = validateSavedQueriesParams(params, cb, true);
            if (paramsErr) {
                console.error("Invalid Query Parameters for the Query Service REST API - " + paramsErr);
                setTimeout(function() { cb("Invalid Query Parameters for the Query Service REST API - " + paramsErr, null); }, 0);
                return;
            }

            var savedQueriesURL = searchEndPoint + SearchQueryAPIs.SavedQueries +
               '?pid=' + params.pid;

            // to prevent CORS preflight, we need to keep it simple
            // for more, see http://www.html5rocks.com/en/tutorials/cors/#toc-types-of-cors-requests
            var headers = sessionInfoToHeaders(sessionInfo);

            var headerErr = validateHeaders(headers);

            if (headerErr) {
               console.error("Invalid Request Headers for the Query Service REST API - " + headerErr);
               setTimeout(function() { cb("Invalid Request Headers for the Query Service REST API - " + headerErr, null); }, 0);
               return;
            }

            var body = JSON.stringify(params.userQueries);
            ajaxReq(savedQueriesURL, headers, function(err, data) {
               cb(err, data);
           }, null, 'PUT', body, true);
        };
    }

    SearchQueryAPI.prototype.constructor = SearchQueryAPI;

    ns.SearchQueryAPI = SearchQueryAPI;

})(window);

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    var ENABLE_INLINE_WORKER = avp.ENABLE_INLINE_WORKER || false;
    var LMV_WORKER_URL = avp.LMV_WORKER_URL;

    /**
     * worker utils
     * @constructor
     */
    var WorkerUtils = function() {
        var isMinified = LMV_WORKER_URL.indexOf(".min.js") > 0;
        this.propertyWorkerUrl = isMinified ? "searchworker.min.js" : "searchworker.js";
        this.propertyWorkerFetchingScript = false;
        this.propertyWorkerDataUrl = null;
        this.propertyWorkerFetchingCbs = [];
    };

    var proto = WorkerUtils.prototype;

    proto.initPropertyWorkerScript = function(successCB, errorCB) {
        var self = this;
        if (ENABLE_INLINE_WORKER && !this.propertyWorkerDataUrl) {
            this.propertyWorkerFetchingCbs.push({
                successCB: successCB
            });

            if (this.propertyWorkerFetchingScript) {
                return;
            }

            var xhr = new XMLHttpRequest();
            var scriptURL = this.propertyWorkerUrl;

            // We need to request the same version of the library for this worker.  Take the original
            // script url, which will already have the version string (if provided).
            //
            var originalScriptURL = avp.getResourceUrl(this.propertyWorkerUrl);

            if (originalScriptURL) {
                scriptURL = originalScriptURL;
            }

            xhr.open("GET", scriptURL, true);
            xhr.withCredentials = false;

            xhr.onload = function() {

                // Set up global cached worker script.
                self.propertyWorkerFetchingScript = false;
                var blob;
                window.URL = window.URL || window.webkitURL;

                try {
                    blob = new Blob([xhr.responseText], {
                        type: 'application/javascript'
                    });
                } catch (e) {
                    // Backward compatibility.
                    blob = new BlobBuilder();
                    blob.append(xhr.responseText);
                    blob = blob.getBlob();
                }
                self.propertyWorkerDataUrl = URL.createObjectURL(blob);

                var callbacks = self.propertyWorkerFetchingCbs.concat(); // Shallow copy
                self.propertyWorkerFetchingCbs = [];
                for (var i = 0; i < callbacks.length; ++i) {
                    callbacks[i].successCB && callbacks[i].successCB();
                }
            };

            self.propertyWorkerFetchingScript = true;
            xhr.send();
        } else {
            if (successCB)
                successCB();
        }
    };

    /**
     * gets the workers scripts needed for the in-viewer-search extension
     *
     * @param  {function} successCB callback function called on success
     * @param  {function} errorCB   callback function called on error
     */
    proto.initInViewerSearchWorkersScripts = function(successCB, errorCB) {
        this.initPropertyWorkerScript(successCB, errorCB);
    };

    /**
     * creates the viewerpropertiesworker
     *
     */
    proto.createPropertyWorker = function() {
        var w;

        // When we are not at release mode, create web worker directly from URL.
        if (ENABLE_INLINE_WORKER) {
            w = new Worker(this.propertyWorkerDataUrl);
        } else {
            w = new Worker(avp.getResourceUrl(this.propertyWorkerUrl));
        }

        return w;
    };


    viewerSearchNameSpace.WorkerUtils = new WorkerUtils();

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var avu = Autodesk.Viewing.UI;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    /* CONSTANTS*/
    var IN_VIEWER_SEARCH_THIS_VIEW_ID = 'in-viewer-search-this-view';
    var IN_VIEWER_SEARCH_THIS_ITEM_ID = 'in-viewer-search-this-item';
    var IN_VIEWER_SEARCH_THIS_PROJECT_ID = 'in-viewer-search-this-project';
    var THIS_VIEW_TAB_ID = 'this-view-tab';
    var THIS_ITEM_TAB_ID = 'this-item-tab';
    var THIS_PROJECT_TAB_ID = 'this-project-tab';

    var THRESHOLD_SEARCH_AS_YOU_TYPE = 3;
    var SEARCH_TIMEOUT = 200;

    var node = null; //this is a variable used for the UI mode
    var searchTimer = null;

    var KEY_CODES = Object.freeze({
        BACKSPACE: 8,
        SPACE: 32,
        ENTER: 13
    });

    /*************** INNER FUNCTIONS ***********************************/

    function initializeSearchTabs(self, currentGeometry, tabInitializedCallback) {
        var is2DMode = self.viewer.model.is2d();

        var highlight;

        var isNodeVisiblefn = function(nodeId, cb) {
            return self.isNodeVisible(nodeId, cb);
        };



        if (self.inViewerSearchThisView) {
            highlight = function(selectedNodeId, searchedIds, showNodeProperties, fitToView) {
                self.highlightNodeInViewer(selectedNodeId, searchedIds, showNodeProperties, fitToView, THIS_VIEW_TAB_ID);
            };
            self.inViewerSearchThisView.initialize(self.qsApiService, self.viewerProperties, currentGeometry, is2DMode, self.thisViewDom || IN_VIEWER_SEARCH_THIS_VIEW_ID, highlight, isNodeVisiblefn, tabInitializedCallback);
            if (self.options.uiEnabled && self.thisViewDom) {
                self.thisViewDom.addEventListener('click', function(event) {
                    var class_name = event.target.getAttribute('class');
                    if (class_name && class_name.includes("item-result")) {
                        self.updateRecentQueries(self.inViewerSearchThisView.searchString);
                    }
                });
            }
        }

        if (self.inViewerSearchThisItem && !self.inViewerSearchThisItem.initialized) {
            highlight = function(selectedNodeId, searchedIds, showNodeProperties, fitToView) {
                self.highlightNodeInViewer(selectedNodeId, searchedIds, showNodeProperties, fitToView, THIS_ITEM_TAB_ID);
            };
            self.inViewerSearchThisItem.initialize(self.qsApiService, self.viewerProperties, currentGeometry, self.thisItemDom || IN_VIEWER_SEARCH_THIS_ITEM_ID, highlight, isNodeVisiblefn, tabInitializedCallback, function(nodeId) {
                self.changeToThisViewTabAndSelectNode(nodeId);
            });
            if (self.options.uiEnabled && self.thisItemDom) {
                self.thisItemDom.addEventListener('click', function(event) {
                    var class_name = event.target.getAttribute('class');
                    if (class_name && (class_name.includes("item-result") || class_name.includes("geometry-name"))) {
                        self.updateRecentQueries(self.inViewerSearchThisItem.searchString)
                    }
                });
            }
        }

        if (self.inViewerSearchThisProject) {
            self.inViewerSearchThisProject.initialize(self.qsApiService, self.thisProjectDom || IN_VIEWER_SEARCH_THIS_PROJECT_ID);
            if (self.options.uiEnabled && self.thisProjectDom) {
                self.thisProjectDom.addEventListener('click', function(event) {
                    var class_name = event.target.getAttribute('class');
                    if (class_name && (class_name.includes("item-result") || class_name.includes("category-name"))) {
                        self.updateRecentQueries(self.inViewerSearchThisProject.searchString)
                    }
                });
            }
        }
    }

    function getGeometries(self, viewer, callback) {
        var docNode = viewer.model.getDocumentNode();
        var bubbleData = (docNode ? viewer.model.getDocumentNode().parent : null);

        if (bubbleData) {
            setTimeout(function() {
                callback(bubbleData);
            }, 0); // Explicitly move cb to async
        } else {
            self.noBubbleData = true;
            if (self.inViewerSearchThisItem) {
                delete self.inViewerSearchThisItem;
                self.inViewerSearchThisItem = null;
            }

            avp.logger.warn('InViewerSearch Extension: no ViewingApplication is being used so relatedItemsTab will not be visible');
            setTimeout(function() {
                callback(null);
            }, 0); // Explicitly move cb to async
        }
    }

    function enableSearchButton(self) {
        var visible;

        if (self.options.uiEnabled && self.searchToolButton && self.inViewerSearchPanel) {
            visible = self.inViewerSearchPanel.isVisible();
            self.searchToolButton.setState(visible ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE);
            self.searchToolButton.setToolTip(av.i18n.translate('Search'));
        }
    }

    /**
     * @private
     * Initializes the services and logic
     *
     * @param  {AutodeskNamespace.InViewerSearchMain} self
     * @param  {function} cb - will be called after initialize
     */
    function initialize(self, cb) {
        var viewer = self.viewer;
        var environment = avp.env;
        var currentGeometry = self.getCurrentGeometry();
        var loading = self.cacheObj.searchInfoThisItem;
        self.showingTabs = false;

        var onTabInitialized = function() {
            var done;

            // Check if any id is not initialized
            done = (!self.inViewerSearchThisView || self.inViewerSearchThisView.initialized) && (!self.inViewerSearchThisItem || self.inViewerSearchThisItem.initialized);

            if (done) {
                self.initialized = true;
                if (self.options.uiEnabled && self.viewer && self.viewer.getPropertyPanel) {
                    self.extensionViewer = self.viewer.getPropertyPanel(true);
                }
                if (!loading) {
                    enableSearchButton(self);
                }
                cb(true);
            } else if (self.inViewerSearchThisView.initialized) { // if This View is already loaded and not returning from this item tab, we can enable the button
                if (!loading) {
                    enableSearchButton(self);
                }
            }
        };

        var onGetGeometriesDone = function(bubbleData) {
            var flatGUIDS = [];
            var sharedPropertyDBPath = '';
            var modelSize;

            if (bubbleData) {
                flatGUIDS = bubbleData.getRootNode().search({'type':'geometry'});
                sharedPropertyDBPath = bubbleData.findPropertyDbPath();
            }

            self.flatGUIDS = flatGUIDS;

            avp.logger.debug('InViewerSearchExtension - has sharedPropertyDBPath: ' + sharedPropertyDBPath);

            if (self.qsApiService) {
                var modelInfo = {
                    count: {}
                };
                modelSize = 0;

                flatGUIDS.forEach(function(geometry) {
                    if (geometry.data) {
                        modelSize += (geometry.data.size) ? geometry.data.size : 0;
                        if (geometry.data.role) {
                            modelInfo.count[geometry.data.role] = modelInfo.count[geometry.data.role] + 1 || 1;
                        }
                    }
                });
                modelInfo.size = modelSize;

                var global = av.getGlobal();
                var viewerBuildId = global.LMV_VIEWER_VERSION + '.' + global.LMV_VIEWER_PATCH;

                self.qsApiService.initialize(viewerBuildId, environment, self.options.clientId, self.options.sessionId);
                self.qsApiService.logInitEvent(self.viewer.model.getData().urn, modelInfo, self.options, "");
            }

            if (self.viewerProperties && !self.viewerProperties.initialized) {
                self.viewerProperties.initialize(self.viewer, self.noBubbleData, self.flatGUIDS, currentGeometry, self.options.thresholdSearchMaxNodes, self.qsApiService, sharedPropertyDBPath);
            }

            // InitializeTabs
            if (self.options.uiEnabled && !self.initialized) {
                self.createTabs();
            }

            initializeSearchTabs(self, currentGeometry, onTabInitialized);
        };

        getGeometries(self, viewer, onGetGeometriesDone);
    }

    /**
     * @private
     * @param self
     * @param tab - selected tab element
     */
    function selectClickTab(self, tab) {
        var contentWrapper, contents;
        var thisItem;
        var thisView;
        var contentId;
        var tabs = [].slice.call(tab.parentElement.children);

        if (!self.enabled) {
            return;
        }
        // Unselect all tabs
        tabs.forEach(function(tabDom) {
            tabDom.classList.remove('selected');
        });

        var tabId = tab.getAttribute('tabId');

        if (tabId === THIS_ITEM_TAB_ID) {
            contentId = IN_VIEWER_SEARCH_THIS_ITEM_ID;
        } else if (tabId === THIS_VIEW_TAB_ID) {
            contentId = IN_VIEWER_SEARCH_THIS_VIEW_ID;
        } else {
            contentId = IN_VIEWER_SEARCH_THIS_PROJECT_ID;
        }


        // Select current tab
        tab.classList.add('selected');
        self.selectedTab = tab;
        self.qsApiService.logTabClickEvent(tabId);

        // TODO(jwo): this is fragile; indexing into the children directly should be a selector instead.
        // Perhaps should be: contentWrapper = tab.parentElement.parentElement.getElementsByClassName('???')[0]; to make it less fragile
        contentWrapper = tab.parentElement.parentElement.children[1]; //tab-content;

        contents = [].slice.call(contentWrapper.children);

        if (contentId === IN_VIEWER_SEARCH_THIS_VIEW_ID) {
            thisView = self.inViewerSearchThisView;
            self.highlightNodeInViewer(thisView.clicked, thisView.controller.searchResultIds, thisView.clicked, false);
        } else if (contentId === IN_VIEWER_SEARCH_THIS_ITEM_ID) {
            thisItem = self.inViewerSearchThisItem;
            self.highlightNodeInViewer(thisItem.selectedNodeId, thisItem.currentGeoSearchedIds, thisItem.selectedNodeId, false);
        }

        // Unhide contentId & hide others
        contents.forEach(function(contDom) {
            if (contDom.id === contentId) {
                contDom.classList.remove('hidden');
            } else {
                contDom.classList.add('hidden');
            }
        });
    }

    function createTabItem(self, contentId, tabClass, name, tabId) {
        var itemDom, labelDom;

        itemDom = document.createElement('div');
        itemDom.className = 'tab-item ' + tabClass;
        itemDom.setAttribute('tabId', tabId);
        itemDom.addEventListener('click', function() {
            selectClickTab(self, this);
        }, false);

        labelDom = document.createElement('label');
        labelDom.appendChild(document.createTextNode(name)); // TODO(go) - 20160522: av.i18n.translate(name) -- or even sooner;
        itemDom.appendChild(labelDom);

        return itemDom;
    }

    function createTabsHTML(containerDom, self) {
        var tabItemsContainerDom, tabContentDom, thisViewDom, thisItemDom, thisProjectDom, count;

        count = 0;

        tabItemsContainerDom = document.createElement('div');

        tabContentDom = document.createElement('div');
        tabContentDom.className = 'tab-content';


        if (self.options.loadedModelTab.enabled && self.inViewerSearchThisView) {
            count++;
            tabItemsContainerDom.appendChild(createTabItem(self, IN_VIEWER_SEARCH_THIS_VIEW_ID, 'this-view', self.options.loadedModelTab.displayName, THIS_VIEW_TAB_ID));

            thisViewDom = document.createElement('div');
            thisViewDom.id = IN_VIEWER_SEARCH_THIS_VIEW_ID;
            thisViewDom.className = 'tab-content-this-view hidden';
            self.thisViewDom = thisViewDom;
            tabContentDom.appendChild(thisViewDom);
        }

        if (self.options.relatedItemsTab.enabled && self.inViewerSearchThisItem) {
            count++;
            tabItemsContainerDom.appendChild(createTabItem(self, IN_VIEWER_SEARCH_THIS_ITEM_ID, 'this-item', self.options.relatedItemsTab.displayName, THIS_ITEM_TAB_ID));

            thisItemDom = document.createElement('div');
            thisItemDom.className = 'tab-content-this-item hidden';
            thisItemDom.id = IN_VIEWER_SEARCH_THIS_ITEM_ID;
            self.thisItemDom = thisItemDom;
            tabContentDom.appendChild(thisItemDom);
        }

        if (self.options.serverSearchTab.enabled) {
            count++;
            tabItemsContainerDom.appendChild(createTabItem(self, IN_VIEWER_SEARCH_THIS_PROJECT_ID, 'this-project', self.options.serverSearchTab.displayName, THIS_PROJECT_TAB_ID));

            thisProjectDom = document.createElement('div');
            thisProjectDom.className = 'tab-content-this-project hidden';
            thisProjectDom.id = IN_VIEWER_SEARCH_THIS_PROJECT_ID;
            self.thisProjectDom = thisProjectDom;
            tabContentDom.appendChild(thisProjectDom);
        }

        tabItemsContainerDom.className = 'tab-items tabs-count-' + count;
        tabItemsContainerDom.childNodes[0].classList.add("selected");
        self.selectedTab = tabItemsContainerDom.childNodes[0];
        tabContentDom.childNodes[0].classList.remove("hidden");

        containerDom.appendChild(tabItemsContainerDom);
        containerDom.appendChild(tabContentDom);
        self.tabContent = tabContentDom;
    }

    function changeCurrentGeometry(self) {
        var newCurrentGeometry = self.getCurrentGeometry();
        var is2DMode = self.viewer.model.is2d();

        if (self.options.uiEnabled && self.viewer && self.viewer.getPropertyPanel) {
            self.extensionViewer = self.viewer.getPropertyPanel(true);
        }

        self.viewerProperties.updateCurrentGeometry(newCurrentGeometry, function(str, resultCollection) {
            var highlightedNode = self.cacheObj.searchInfoThisItem.node;
            if (self.inViewerSearchThisView) {
                self.inViewerSearchThisView.updateCurrentGeometry(newCurrentGeometry, resultCollection, str, is2DMode, highlightedNode, self.viewer);
            }
            if (self.inViewerSearchThisItem) {
                self.inViewerSearchThisItem.updateCurrentGeometry(newCurrentGeometry, self.viewer);
            }
            self.disabledPanel(true);
        });
        self.addToolbarUI(true);
    }
    /***************** END INNER FUNCTIONS **********************************/

    /**
     * InViewerSearchMain
     */
    viewerSearchNameSpace.InViewerSearchMain = function(viewer, options, cache) {
        this.viewer = viewer;
        this.cacheObj = cache;
        this.options = options;
        this.is2DMode = null;

        this.initialized = false;

        this.toolbarTools = null;
        this.qsApiService = new viewerSearchNameSpace.QsApiService();
        this.viewerProperties = new viewerSearchNameSpace.ViewerPropertiesService(viewer);
        this.queries = new viewerSearchNameSpace.InViewerSearchQueries(viewer, options);
        this.noBubbleData = false;
        this.inViewerSearchPanel = null;

        this.inViewerSearchThisView = null;
        this.inViewerSearchThisItem = null;
        this.inViewerSearchThisProject = null;

        this.geometryLoadedCallback = null;

        this.tabsElem = null;
        this.searchBarElem = null;
        this.queriesContainer = null;

        this.saveLastQuery = null;
        this.recentSearches = null;
        this.flatGUIDS = {};
        this.container = null; //inViewerSearch html container
        this.searchToolButton = null;
        this.showingTabs = false;
        this.initCb = null;

        this.closeCallback = null;

        this.workersScriptsInitialized = false;
        this.initWorkersScripts = null;

        this.thisProjectDom = null;
        this.thisItemDom = null;
        this.thisViewDom = null;
        this.extensionViewer = null;
        this.enabled = true;

    };

    viewerSearchNameSpace.InViewerSearchMain.prototype.constructor = viewerSearchNameSpace.InViewerSearchMain;

    /**
     * Loads the extension
     *
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.load = function() {
        var self = this;
        var viewer = this.viewer;

        var allTabsLoaded = !!(this.options && this.options.loadedModelTab && this.options.relatedItemsTab && this.options.serverSearchTab);
        var atleastOneTabEnabled = allTabsLoaded && (this.options.loadedModelTab.enabled || this.options.relatedItemsTab.enabled || this.options.serverSearchTab.enabled);

        if (!atleastOneTabEnabled) {
            avp.logger.log('InViewerSearch Extension - all search types disabled, nothing to do.');
            return false;
        }

        //load worker scripts
        viewerSearchNameSpace.WorkerUtils.initInViewerSearchWorkersScripts(function() {
            self.workersScriptsInitialized = true;
            if (self.initWorkersScripts) {
                self.initWorkersScripts();
            }
            avp.logger.info("InViewerSearch Extension: workers fetched.");
        }, function() {
            avp.logger.warn("InViewerSearch Extension: error fetching workers.");
        });

        if (this.options.loadedModelTab.enabled && !this.inViewerSearchThisView) {
            this.inViewerSearchThisView = new viewerSearchNameSpace.InViewerSearchThisView(viewer, this.options);
        }

        if (this.options.relatedItemsTab.enabled && !this.inViewerSearchThisItem) {
            this.inViewerSearchThisItem = new viewerSearchNameSpace.InViewerSearchThisItem(viewer, this.options, this.cacheObj);
        }

        if (this.options.serverSearchTab.enabled && !this.inViewerSearchThisProject) {
            this.inViewerSearchThisProject = new viewerSearchNameSpace.InViewerSearchThisProject(this.options);
        }

        if (this.options.uiEnabled && !this.inViewerSearchPanel) {
            this.inViewerSearchPanel = new viewerSearchNameSpace.InViewerSearchPanel(viewer, 'in-viewer-search', av.i18n.translate('Search'), this.options, this.qsApiService);
            this.container = this.inViewerSearchPanel.container;
            this.inViewerSearchPanel.addCloseHandler(function() {
                if (self.queries) {
                    self.queries.closeSettingsPanel();
                }
            });

            this.inViewerSearchPanel.addEventListener(this.inViewerSearchPanel.closer, 'click', this.closeCallback);
        }

        // Add the ui to the viewer.
        if (this.options.uiEnabled && !self.searchToolButton) {
            this.addToolbarUI();
        }

        this.onInitialized = function(initializationDone) {
            if (!initializationDone) {
                return;
            }

            self.initialized = true;
            enableSearchButton(self);

            if (self.initCb) {
                self.initCb();
            }
        };

        this.geometryLoadedCallback = function() {
            if (!self.workersScriptsInitialized) {
                self.initWorkersScripts = function() {
                    initialize(self, self.onInitialized);
                };
            } else {
                initialize(self, self.onInitialized);
            }
        };

        var onGeometryLoadedEvent = function() {
            viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoadedEvent);
            viewer.getObjectTree(function() {
                self.geometryLoadedCallback();
            }, function() {
                avp.logger.warn("InViewerSearch Extension - failed getObjectTree");
                self.geometryLoadedCallback();
            });
        };

        viewer.getObjectTree(function() {
            self.geometryLoadedCallback();
        }, function() {
            if (viewer.model && viewer.model.getData) {
                var data = viewer.model.getData();
                if (data && data.hasOwnProperty('hasObjectProperties')) {
                    //Case where there is no object tree, but objects
                    //do still have properties. This is the case for F2D drawings.
                    self.geometryLoadedCallback();
                }
            } else {
                viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, onGeometryLoadedEvent);
            }

        });

        return true;
    };

    viewerSearchNameSpace.InViewerSearchMain.prototype.update = function(viewer, options, cache) {
        this.viewer = viewer;
        this.cacheObj = cache;
        this.options = options;
        var self = this;
        this.container.classList.remove("hidden");
        var afterGetObjTree = function() {
            self.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoadedEvent);
            changeCurrentGeometry(self);
            self.cacheObj.inViewerSearch = null;
        };

        var onGeometryLoadedEvent = function() {
            viewer.getObjectTree(function() {
                afterGetObjTree();
            }, function() {
                avp.logger.warn("InViewerSearch Extension - failed getObjectTree");
                afterGetObjTree();
            });
        };

        this.viewer.getObjectTree(function() {
            onGeometryLoadedEvent();
        }, function() {
            if (self.viewer.model && self.viewer.model.getData) {
                var data = self.viewer.model.getData();
                if (data && data.hasOwnProperty('hasObjectProperties')) {
                    //Case where there is no object tree, but objects
                    //do still have properties. This is the case for F2D drawings.
                    onGeometryLoadedEvent();
                }
            } else {
                self.viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, onGeometryLoadedEvent);
            }
        });
        //this.viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, onGeometryLoadedEvent);

        return true;
    };

    viewerSearchNameSpace.InViewerSearchMain.prototype.disabledPanel = function(enabled) {
        this.container.classList.add("disabled");
        if (enabled) {
            this.container.classList.remove("disabled");
        }
        this.enabled = enabled;
    };

    /**
     * [UI ENABLED] Creates the UI for the extension
     *
     * @return {*}
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.addToolbarUI = function(enabled) {
        var searchToolButton;
        var self = this;
        var viewer = this.viewer;
        if (!viewer.getToolbar) {
            return;
        } // Adds support for Viewer3D instance
        var toolbar = viewer.getToolbar(false);

        this.toolbarTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

        // Create a button for the tool.
        searchToolButton = new avu.Button('toolbar-in-viewer-search');
        searchToolButton.setToolTip(av.i18n.translate('Search'));
        searchToolButton.setIcon('adsk-button-icon-search');
        if (!enabled) {
            searchToolButton.setToolTip(av.i18n.translate('Loading Search'));
            searchToolButton.setState(avu.Button.State.DISABLED);
        }

        searchToolButton.addEventListener('click', function( /*e*/ ) {
            if (self.inViewerSearchPanel) {
                var isVisible = self.inViewerSearchPanel.isVisible();
                self.qsApiService.logGeneralEvent(isVisible ? 'searchWindowClose' : 'searchWindowOpen');
                self.inViewerSearchPanel.setVisible(!isVisible);
                self.searchBarElem.focus();

                if (self.queries) {
                    self.queries.closeSettingsPanel();
                }
            }
        }, false);

        searchToolButton.addClass('in-viewer-search-button');

        // Add visibility callback
        if (self.inViewerSearchPanel) {
            self.inViewerSearchPanel.addVisibilityListener(function(visible) {
                searchToolButton.setState(visible ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE);
            });
        }

        self.searchToolButton = searchToolButton;

        self.toolbarTools.addControl(searchToolButton);
    };

    /**
     * Unloads the extension -- disabling for test
     *
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.unload = function() {
        var loading = this.cacheObj.searchInfoThisItem;
        if (loading) {
            this.cacheObj.inViewerSearch = this;
            if (this.viewer.getPropertyPanel()) {
                this.viewer.getPropertyPanel().setVisible(false);
            }

            var extensions = this.viewer.config.extensions;
            if (extensions && extensions.indexOf("Autodesk.InViewerSearch") < 0) {
                this.container.classList.add("hidden");
            }
        } else {
            this.initialized = false;
            if (this.options.uiEnabled) {
                this.closeSearch();

                if (this.toolbarTools) {
                    this.toolbarTools.removeControl(this.searchToolButton);
                }
            }

            if (this.geometryLoadedCallback) {
                this.viewer.removeEventListener(av.GEOMETRY_LOADED_EVENT, this.geometryLoadedCallback);
            }

            if (this.inViewerSearchThisView && this.inViewerSearchThisView.initialized) {
                this.inViewerSearchThisView.uninitialize();
            }

            if (this.inViewerSearchThisItem && this.inViewerSearchThisItem.initialized) {
                this.inViewerSearchThisItem.uninitialize();
            }

            if (this.inViewerSearchThisProject && this.inViewerSearchThisProject.initialized) {
                this.inViewerSearchThisProject.uninitialize();
            }
            if (this.inViewerSearchPanel) {
                this.inViewerSearchPanel.uninitialize();
            }
            this.viewerProperties.uninitialize();

            delete this.searchToolButton;
            delete this.inViewerSearchThisView;
            delete this.inViewerSearchThisItem;
            delete this.inViewerSearchThisProject;
            delete this.inViewerSearchPanel;
            delete this.qsApiService;
            delete this.viewerProperties;
        }

        return true;
    };

    /**
     * adds a new string to the recent searches list and save it to browser local storage
     *
     * @param  {string} str searched string
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.updateRecentQueries = function(str) {
        this.queries.updateRecentQueries(str);
    };

    viewerSearchNameSpace.InViewerSearchMain.prototype.highlightNodeInViewer = function(selected, searchedIds, showNodeProps, fitView, context) {
        var selectedtabId = this.selectedTab.getAttribute('tabId');
        if (context && context !== selectedtabId) {
            return;
        }
        var is2DMode = this.viewer.model.is2d();
        this.viewer.navigation.setRequestHomeView(true);

        if (selected) {
            this.viewer.isolate(selected);
            this.viewer.select(selected);

            if (showNodeProps && this.extensionViewer && this.extensionViewer.container) {
                this.extensionViewer.setVisible(true);
            } else if (!showNodeProps) {
                this.extensionViewer.setVisible(false);
            }
        } else {
            if (!searchedIds) {
                if (selectedtabId === THIS_VIEW_TAB_ID) {
                    searchedIds = this.inViewerSearchThisView.controller.searchResultIds;
                } else if (selectedtabId === THIS_ITEM_TAB_ID) {
                    searchedIds = this.inViewerSearchThisItem.currentGeoSearchedIds;
                }
            }
            this.viewer.clearSelection();
            this.viewer.isolate(searchedIds);
            if (this.extensionViewer && this.extensionViewer.container) {
                this.extensionViewer.setVisible(false);
            }
        }

        if (fitView) {
            this.viewer.fitToView();
        }
    };

    /**
     * [UI ENABLED] hides the search panel and clean the search
     *
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.closeSearch = function() {
        var self = this;

        self.hideTabs();

        if (self.inViewerSearchThisView) {
            self.inViewerSearchThisView.clearSearch();
        }

        if (self.inViewerSearchThisItem) {
            self.inViewerSearchThisItem.clearSearch();
        }

        if (self.inViewerSearchThisProject) {
            self.inViewerSearchThisProject.clearSearch();
        }

        if (this.queries) {
            this.queries.closeSettingsPanel();
        }

        if (this.searchBarElem) {
            this.searchBarElem.value = "";
        }

        selectClickTab(this, this.tabsElem.firstChild.firstChild); //starts this view tab selected
    };

    /**
     * [UI ENABLED] helper to create the UI tabs
     *
     * @return {*}
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.createTabs = function() {
        if (!this.inViewerSearchPanel || !this.inViewerSearchPanel.scrollContainer) {
            return;
        }

        var queriesContainerDom;

        var self = this;
        var container = this.inViewerSearchPanel ? this.inViewerSearchPanel.scrollContainer : null;
        var searchBarDom;
        var tabsDom;
        var supportsSearch = "onsearch" in document.documentElement; //.hasOwnProperty doesn't work

        // If there was an existing search bar, exit and don't create a new one
        if (this.searchBarElem) {
            return;
        }

        searchBarDom = document.createElement('input');
        searchBarDom.className = 'in-viewer-search-bar';
        searchBarDom.id = 'in-viewer-search-bar';
        searchBarDom.type = 'search';

        if (this.options.searchDefaultText) {
            searchBarDom.placeholder = this.options.searchDefaultText;
        }

        searchBarDom.addEventListener('keyup', function(e) {
            var str = e.target.value.trim();
            var c = e.which || e.keyCode;
            if (!supportsSearch && c === KEY_CODES.ENTER) {
                // if onSearch is not supported, we trigger the searchHandler after enter.
                searchBarDom.onsearch(e);
            } else if (str && str.length >= THRESHOLD_SEARCH_AS_YOU_TYPE) {
                // TODO(jwo): What's the use of these high order keycodes?
                if (c === KEY_CODES.BACKSPACE || c === KEY_CODES.SPACE || (c > 40 && c < 128) || (c > 185 && c < 193) || (c > 218 && c < 223)) {
                    clearTimeout(searchTimer);
                    searchTimer = setTimeout(function() {
                        self.saveLastQuery = false;
                        self.uiSearch();
                    }, SEARCH_TIMEOUT);
                }
            } else {
                self.hideTabs();
                //self.inViewerSearchThisView.clearSearch();
            }
        });

        searchBarDom.onsearch = function(e) {
            var str = e.target.value.trim();

            clearTimeout(searchTimer);

            if (!str) {
                self.hideTabs();
                //self.inViewerSearchThisView.clearSearch();
            } else {
                searchTimer = setTimeout(function() {
                    self.saveLastQuery = true;
                    self.uiSearch();
                }, SEARCH_TIMEOUT);
            }
        };

        this.searchBarElem = searchBarDom;

        queriesContainerDom = document.createElement('div');
        queriesContainerDom.className = 'queries-container';
        this.queriesContainer = queriesContainerDom;

        this.queries.initialize(queriesContainerDom, self.qsApiService, self.searchBarElem, self.getCurrentGeometry(), self.getDocumentName(), function() {
            self.uiSearch();
        });

        tabsDom = document.createElement('div');
        tabsDom.className = 'tabs-wrapper hidden';
        createTabsHTML(tabsDom, self);
        this.tabsElem = tabsDom;

        if (container) {
            container.appendChild(searchBarDom);
            this.searchBarElem.focus();
            container.appendChild(queriesContainerDom);
            container.appendChild(tabsDom);
        }
    };

    /**
     * calls the search algorithms that are enabled and call the calback functions
     * that apply after getting the results
     *
     * @param  {string} query            - string to be searched
     * @param  {function} searchModelCb  - will be called with the loaded model search results: function(SearchResultsType)
     * @param  {function} searchDocumentCb - will be called with the related items search results: function(GeometriesSearchResultsType)
     * @param  {function} queryServiceCb       - will be called with the server search results: function(CategoriesSearchResultsType)
     * @param {boolean} uiSearch               - true if the search was triggered by the UI
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.search = function(query, searchModelCb, searchDocumentCb, queryServiceCb, uiSearch) {
        var strTrimmed = query.trim();

        if (strTrimmed) {
            this.qsApiService.generateQueryId();

            if (this.inViewerSearchThisView && (uiSearch || searchModelCb)) {
                this.inViewerSearchThisView.search(strTrimmed, node, searchModelCb);
            }

            if (this.inViewerSearchThisItem && (uiSearch ||searchDocumentCb)) {
                this.inViewerSearchThisItem.search(strTrimmed, searchDocumentCb);
            }

            if (this.inViewerSearchThisProject && (uiSearch ||queryServiceCb)) {
                this.inViewerSearchThisProject.search(strTrimmed, queryServiceCb);
            }

            if (this.saveLastQuery) {
                this.updateRecentQueries(strTrimmed);
            }
        }
    };

    /**
     * [UI ENABLED] once the user enters a string and press enter search is triggered.
     *
     * @param  {number} nodeId - (optional)
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.uiSearch = function(nodeId) {
        var strBar = this.searchBarElem;
        var str = strBar.value.toLocaleLowerCase();

        node = nodeId;

        if (str) {
            this.showTabs();
            this.search(str, null, null, null, true);
        } else {
            this.hideTabs();
        }
    };

    /**
     * [UI ENABLED] shows the tabs UI
     *
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.showTabs = function() {
        var tabs, recentSearches;

        if (!this.showingTabs) {
            tabs = this.tabsElem;

            tabs.classList.remove('hidden');

            recentSearches = this.queriesContainer;
            recentSearches.classList.add('hidden');
            this.showingTabs = true;
        }
    };

    viewerSearchNameSpace.InViewerSearchMain.prototype.changeToThisViewTabAndSelectNode = function(nodeid) {
        var tabs;

        if (!this.options.loadedModelTab || !this.options.loadedModelTab.enabled) {
            return;
        }

        tabs = this.tabsElem;

        selectClickTab(this, tabs.firstChild.firstChild); //starts this view tab selected
        this.inViewerSearchThisView.selectNode(null, nodeid, true);
    };

    /**
     * [UI ENABLED] hides the tabs UI
     *
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.hideTabs = function() {

        if (this.showingTabs) {
            if (this.extensionViewer && this.extensionViewer.container) {
                this.extensionViewer.setVisible(false);
            }

            this.viewer.showAll();
            this.viewer.clearSelection();
            this.queriesContainer.classList.remove('hidden');

            this.tabsElem.classList.add('hidden');
            this.showingTabs = false;
            this.searchBarElem.focus();
        }
    };

    /**
     * The callback is called if the node is visible
     *
     * @param  {type} nodeId node id
     * @param  {function} cb     callback function
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.isNodeVisible = function(nodeId, cb) {
        // if (this.viewer.impl && this.viewer.impl.visibilityManager) {
        //     var visible = this.viewer.model.visibilityManager.isNodeVisible(nodeId);
        //     if (visible) {
        //         cb();
        //     }
        // }
        //return false;

        if (this.viewer.model && this.viewer.model.getData()) {
            var data = this.viewer.model.getData();
            var is2DMode = this.viewer.model.is2d();
            if (is2DMode) {
                var frag = data.fragments.dbId2fragId[nodeId];
                var isVisible = this.viewer.model.isFragVisible(frag);
                if (isVisible) {
                    cb();
                }
            } else  {
                if (data && data.instanceTree) {
                    data.instanceTree.nodeAccess.enumNodeFragments(nodeId, function(/*frag*/) {
                        cb();
                    });
                }
            }
        }
    };


    /**
     * @private for testing pouposes only
     * InViewerSearchMain.prototype.getCurrentGeometry - returns the current geometry id
     *
     * @return {type}  description
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.getCurrentGeometry = function() {
        return avp.docItemId;
    }

    /**
     * @private
     * InViewerSearchMain.prototype.getCurrentGeometry - returns the current geometry id
     *
     * @return {type}  description
     */
    viewerSearchNameSpace.InViewerSearchMain.prototype.getDocumentName = function() {
        var name = "";
        if (this.viewer.model && this.viewer.model.getDocumentNode()) {
            var root = this.viewer.model.getDocumentNode().getRootNode();
            root.children.forEach(function(bubble) {
                if (bubble.data.name) {
                    name = bubble.data.name;
                }
            });
        }

        return name;
    }

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    var defaultOptions = {
        searchDefaultText: "",
        uiEnabled: true,
        clientId: 'adsk.viewer.defaultClientId',
        sessionId: 'adsk.viewer.defaultSessionId',
        thresholdSearchMaxNodes: 50000,
        savedQueries: {
        },

        loadedModelTab: {
            enabled: true,
            displayName: 'This View',
            pageSize: 50
        },

        relatedItemsTab: {
            enabled: true,
            displayName: 'This Item',
            pageSize: 20
        },

        serverSearchTab: {
            enabled: false,
            displayName: 'This Project',
            parameters: {
                pid: '',
                filters: '',
                language: 'ENU',
                baseURL: '',
                urlCallback: ''
            },
            pageSize: 20
        }
    };

    /**
     * @callback Autodesk.Viewing.Extensions.InViewerSearchExtension~searchModelCallback
     * @param {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~SearchResultsType
     */

    /**
     * @callback Autodesk.Viewing.Extensions.InViewerSearchExtension~searchDocumentCallback
     * @param {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~GeometriesSearchResultsType
     */

    /**
     * @callback Autodesk.Viewing.Extensions.InViewerSearchExtension~queryServiceCallback
     * @param {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoriesSearchResultsType
     * @private
     */

    /**
     * An object containing information about result set returned.
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~SearchResultType
     * @property {string} dbId - Geometry node dbId
     * @property {string} fieldName - Property field name
     * @property {string} fieldValue - Property field value
     * @property {string} nodeName - Geometry node name
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~SearchResultsType
     * @property {number} page - Page number
     * @property {Array<Autodesk.Viewing.Extensions.InViewerSearchExtension~SearchResultType>} results - Result list
     * @property {number} resultCount - Total number of results
     * @property {boolean} moreResults - Indicates if there are more results beyond the results on the page. True if there are more results
     * @property {string} message - Error message
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~GeometriesSearchResultType
     * @property {string} id - Geometry id
     * @property {string} name - Geometry Name
     * @property {Array<Autodesk.Viewing.Extensions.InViewerSearchExtension~SearchResultType>} results - Search results for the geometry
     * @property {boolean} moreResults - Indicates if there are more results beyond the results on the page. True if there are more results
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~GeometriesSearchResultsType
     * @property {number} page - Page number
     * @property {Array<Autodesk.Viewing.Extensions.InViewerSearchExtension~GeometriesSearchResultType>} results - Result list
     * @property {number} resultCount - Total number of results
     * @property {string} message - Error message
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoryResultType
     * @property {string} name - Item name
     * @property {string} url - Item url
     * @property {function} logClick - function to log click on the result
     * @private
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoryDataType
     * @property {string} name - Item name
     * @property {number} modifier - Query id
     * @private
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoriesResultsType
     * @property {string} name - Category name
     * @property {number} modifier - Query id
     * @property {boolean} moreItems - Indicates if there are more results beyond the results on the page. True if there are more results
     * @property {Array<Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoryResultType>} categoryResults - Search results for the category
     * @private
     */

    /**
     * @typedef {Object} Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoriesSearchResultsType
     * @property {number} page - Page number
     * @property {Array<Autodesk.Viewing.Extensions.InViewerSearchExtension~CategoriesResultsType>} results - Result list
     * @property {number} resultCount - Total number of results
     * @property {string} message - Error message.
     * @private
     */

    /**
     *  Extension that provides search capabilities.
     * The extension can be used as an API or directly through the Viewer UI.
     * - Search Model: searches into the property values of the geometry loaded in the viewer.
     * - Search Document: searches into the property values of all the geometries that belong to the document including the geometry loaded in the viewer.
     *
     * If the options object or any of the parameters are not specified, the default value will be used.
     * The example below shows how the options object and its parameters can be specified and what the default value for each parameter is.
     *
     * @example
     * // Load Extension
     * // example configuration object:
     * var options = {
     *     searchDefaultText: "",
     *     uiEnabled: true,
     *     clientId: 'adsk.viewer.defaultClientId',
     *     sessionId: 'adsk.viewer.defaultSessionId',
     *     thresholdSearchMaxNodes: 50000,
     *     savedQueries: {
     *         profileId: ""
     *     },
     *
     *     loadedModelTab: {
     *         enabled: true,
     *         displayName: 'This View',
     *         pageSize: 50
     *     },
     *
     *     relatedItemsTab: {
     *         enabled: true,
     *         displayName: 'This Item',
     *         pageSize: 20
     *     }
     * };
     *
     * viewer.loadExtension("Autodesk.InViewerSearch", options);
     *
     * //get Extension
     * var extension = viewer.getExtension("Autodesk.InViewerSearch");
     *
     * @constructor
     * @memberof Autodesk.Viewing.Extensions
     * @alias Autodesk.Viewing.Extensions.InViewerSearchExtension
     * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance.
     * @param {object} [options] - An optional dictionary of options for this extension.
     * @param {boolean} [options.uiEnabled] - A switch to enable UI. Default: true
     * @param {string} [options.clientId] - ID of the client application using the extension. Default: adsk.viewer.defaultClientId
     * @param {string} [options.sessionId] - ID that identifies a session which should be updated each time the extension is reloaded. Default: adsk.viewer.defaultSessionId
     * @param {string} [options.savedQueries.profileId] - Id of the viewerSearchProfile that is going to be used when calling to the Saved Queries API.
     * @param {boolean} [options.thresholdSearchMaxNodes] - Maximum number of nodes in the model that can be handled by the search extension. If exceeded, the search default to string match on Viewer's properties DB fields. Default: 50000
     * @param {boolean} [options.loadedModelTab.enabled] - A switch to enable loaded model tab. Default: true
     * @param {string} [options.loadedModelTab.displayName] - Name of loaded model tab. Default: This View
     * @param {number} [options.loadedModelTab.pageSize] - Number of results per page for loaded model tab. Default: 50
     * @param {boolean} [options.relatedItemsTab.enabled] - A switch to enable related items tab. Default: true
     * @param {string} [options.relatedItemsTab.displayName] - Name of related items tab. Default: This Item
     * @param {number} [options.relatedItemsTab.pageSize] - Number of results per page for related items tab. Default: 20
     * @category Extensions
     */
    var InViewerSearchExtension = function(viewer, options) {
        var notHeadlessMode;

        av.Extension.call(this, viewer, options);

        this.initialized = false;

        this.viewer = viewer;
        this.toolbarTools = null;

        // Make sure all options exist and are set up right, to at least the highest level
        // Doesn't protect from wrongly configured tabs
        if (!options) {
            options = {};
        }
        options.inViewerSearchConfig = options.inViewerSearchConfig || defaultOptions;
        this.options = options.inViewerSearchConfig;

        this.options.thresholdSearchMaxNodes = this.options.thresholdSearchMaxNodes || defaultOptions.thresholdSearchMaxNodes;

        //case viewer headless uiEnabled is always false!
        notHeadlessMode = Autodesk.Viewing.Private.GuiViewer3D && viewer instanceof Autodesk.Viewing.Private.GuiViewer3D;
        this.options.uiEnabled = notHeadlessMode && ((this.options.uiEnabled === undefined) ? defaultOptions.uiEnabled : this.options.uiEnabled);
        this.options.serverSearchTab = this.options.serverSearchTab || defaultOptions.serverSearchTab;
        this.options.relatedItemsTab = this.options.relatedItemsTab || defaultOptions.relatedItemsTab;
        this.options.loadedModelTab = this.options.loadedModelTab || defaultOptions.loadedModelTab;
        this.options.savedQueries = this.options.savedQueries || defaultOptions.savedQueries;

        // Options could exist without display name field properly configured. Use the default name in such case.
        this.options.serverSearchTab.displayName = this.options.serverSearchTab.displayName || defaultOptions.serverSearchTab.displayName;
        this.options.relatedItemsTab.displayName = this.options.relatedItemsTab.displayName || defaultOptions.relatedItemsTab.displayName;
        this.options.loadedModelTab.displayName = this.options.loadedModelTab.displayName || defaultOptions.loadedModelTab.displayName;

        function getInViewerSearch() {
            return this.inViewerSearchMain;
        }
    };

    /**
     * Static function internally used that provides info on what are the configuration options
     * available to this extension.
     * @private
     */
    InViewerSearchExtension.populateDefaultOptions = function(options) {
        options['inViewerSearchConfig'] = {
            uiEnabled: true,
            clientId: undefined, //"adsk.forge.default",
            sessionId: undefined, //"Session-ID-example-F969EB70-242F-11E6-BDF4-0800200C9A66",
            savedQueries: {
                profileId: "simple"
            },
            serverSearchTab: {
                enabled: true,  //if false we hide the tab
                displayName: 'This Project',
                // customize the following parameters for 'This Project' tab to work
                parameters: {
                    pid: '',   // profile id
                    filters: '',
                    language: "ENU",
                    baseURL: '',
                    urlCallback: ''
                },
                pageSize: 20
            },
            relatedItemsTab: {
                enabled: true,  //if false we hide the tab
                displayName: 'This Item',
                pageSize: 20
            },
            loadedModelTab: {
                enabled: true,  //if false we hide the tab
                displayName: 'This View',
                pageSize: 50
            }
        };
    };

    InViewerSearchExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    InViewerSearchExtension.prototype.constructor = viewerSearchNameSpace.InViewerSearchExtension;

    /**
     * Loads the search extension.
     *
     * @return {boolean} True if the extension is loaded successfully.
     */
    InViewerSearchExtension.prototype.load = function() {
        var self = this;
        this.cache = this.getCache();

        avp.injectCSS('extensions/InViewerSearch/InViewerSearch.css');

        if (this.cache && this.cache.inViewerSearch) {
            this.inViewerSearchMain = this.cache.inViewerSearch;
        } else {
            this.inViewerSearchMain = new viewerSearchNameSpace.InViewerSearchMain(this.viewer, this.options, this.getCache());
        }

        if (this.inViewerSearchMain && this.cache && this.cache.inViewerSearch) {
            this.cache.inViewerSearch = null;
            this.inViewerSearchMain.update(this.viewer, this.options, this.cache);
        } else {
            this.inViewerSearchMain.load();
        }

        return true;
    };

    /**
     * Unloads the search extension.
     *
     * @return {boolean} True if the extension is unloaded successfully.
     */
    InViewerSearchExtension.prototype.unload = function() {
        this.inViewerSearchMain.unload();
        if (!this.cache || !this.cache.searchInfoThisItem) {
            delete this.inViewerSearchMain;
            this.inViewerSearchMain = null;
            this.options.initialized = false;
            this.options.inViewerSearchMain = null;
        } else {
            this.inViewerSearchMain.disabledPanel();
        }

        return true;
    };

    /**
     * Adds a listener to the init event. The callback will be called after the extension is initialized.
     * The callback is called if the extension is already initialized. This method is for testing purposes.
     *
     * @param {function} cb - Method that gets called after init
     * @private
     */
    InViewerSearchExtension.prototype.addInitListener = function(cb) {

        if (this.inViewerSearchMain.initialized) {
            setTimeout(function() {
                cb();
            }, 0); // Explicitly move cb() to async
        } else {
            this.inViewerSearchMain.initCb = cb;
        }
    };

    /**
     * Execute a search into the property values of the loaded geometry and call the callback function provided to process results returned.
     *
     * @param {string} query                   - String to be searched
     * @param {object} params                  - object params contain the parameters for the search, if no parameter object should be empty.
     * @param {number} [params.page]           - Page to be returned if specified. Default to 1 (the first page) if not specified.
     * @param {Autodesk.Viewing.Extensions.InViewerSearchExtension~searchModelCallback}  searchModelCb   - Method that gets called after searching property values within the model is completed in order to allow custom result processing.
     *
     * searchModelCb should receive a SearchResultsType object which has the following fields:
     * - {number} page - Page number in one-based indexing
     * - {Array&lt;SearchResultType&gt;} results - Result list
     * - {number} resultCount - Total number of results
     * - {boolean} moreResults - Indicates if there are more results beyond the results on the page. True if there are more results
     * - {string} message - Error message if any error is encountered
     *
     * SearchResultType object has the following fields:
     * - {string} dbId - Geometry node dbId
     * - {string} fieldName - Property field name
     * - {string} fieldValue - Property field value
     * - {string} nodeName - Geometry node name
     */
    InViewerSearchExtension.prototype.searchModel = function(query, params, searchModelCb) {
        var strTrimmed = query.trim();
        var inViewerSearch = this.inViewerSearchMain;
        var page = null;

        if (params && params.page) {
            page = params.page;
        }

        if(!strTrimmed) {
            searchModelCb({
                message: "Nothing to search."
            });
            return;
        }

        if (!inViewerSearch.inViewerSearchThisView) {
            searchModelCb({
                message: "Search model is not enabled."
            });
            return;
        }

        if (!page || page === 1) {
            inViewerSearch.inViewerSearchThisView.search(strTrimmed, null, searchModelCb);
        } else {
            if (strTrimmed !== inViewerSearch.inViewerSearchThisView.searchString) {
                //no search with that string was done
                this.search(strTrimmed, function(/*results*/) {
                    inViewerSearch.inViewerSearchThisView.getPage(page, searchModelCb);
                });
            } else {
                inViewerSearch.inViewerSearchThisView.getPage(page, searchModelCb);
            }
        }
    };

    /**
     * Execute a search into the property values of the geometries that belong to the document and call the callback function provided to process results returned.
     *
     * @param {string} query                - String to be searched
     * @param {object} params               - object params contain the parameters for the search, if no parameter object should be empty.
     * @param {number} [params.page]        - Page to be returned if specified. Default to 1 (the first page) if not specified.
     * @param {string} [params.geometryId]  - ID of the geometry whose results to be returned. Returns results from all geometries available if not specified.
     * @param {searchDocumentCallback} searchDocumentCb - Method that gets called after searching property values within the document is completed in order to allow custom result processing.
     *
     * searchDocumentCb should receive a GeometriesSearchResultsType object which has the following fields:
     * - {number} page - Page number in one-based indexing
     * - {Array&lt;GeometriesSearchResultType&gt;} results - Result list
     * - {number} resultCount - Total number of results
     * - {string} message - Error message if any error is encountered
     *
     * GeometriesSearchResultType object has the following fields:
     * - {string} id - Geometry id
     * - {string} name - Geometry name
     * - {Array&lt;SearchResultType&gt;} results - Search results for the geometry
     * - {boolean} moreResults - Indicates if there are more results beyond the results on the page. True if there are more results
     *
     * SearchResultType object has the following fields:
     * - {string} dbId - Geometry node dbId
     * - {string} fieldName - Property field name
     * - {string} fieldValue - Property field value
     * - {string} nodeName - Geometry node name
     */
    InViewerSearchExtension.prototype.searchDocument = function(query, params, searchDocumentCb) {
        var strTrimmed = query.trim();
        var inViewerSearch = this.inViewerSearchMain;
        var thisItem = inViewerSearch.inViewerSearchThisItem;
        var page, geometryId;

        if (params) {
            page = params.page;
            geometryId = params.geometryId;
        }

        if (!strTrimmed) {
            searchDocumentCb({
                message: "Nothing to search"
            });
            return;
        }

        if (!thisItem) {
            searchDocumentCb({
                message: "Search document is not enabled."
            });
            return;
        }

        if (!page || page === 1) {
            thisItem.search(strTrimmed, searchDocumentCb);
        } else {
            inViewerSearch.inViewerSearchThisItem.getPage(geometryId, page, searchDocumentCb);
        }

    };

    /**
     * Execute a search in remote server by calling the query service and call the callback function provided to process results returned.
     * The results returned will depend on the configurations set in options object.
     *
     * @param {string} query          - String to be searched
     * @param {object} params         - Contains the parameters to be used for search.
     * @param {string} [params.categoryName]     - Name of the category
     * @param {number} [params.categoryModifier] - Modifier ID for the category query
     * @param {number} [params.page] - Page to be returned if specified. Default to 1 (the first page) if not specified.
     * @param {Autodesk.Viewing.Extensions.InViewerSearchExtension~queryServiceCallback} queryServiceCb   - Method that gets called after getCategoryResultsPage is completed.
     * @private
     */
    InViewerSearchExtension.prototype.queryService = function(query, params, queryServiceCb) {
        var strTrimmed = query.trim();
        var inViewerSearch = this.inViewerSearchMain;
        var page;

        if (!strTrimmed) {
            queryServiceCb({
                message: "Nothing to search"
            });
            return;
        }

        if (!inViewerSearch.inViewerSearchThisProject) {
            queryServiceCb({
                message: "Server search is not enabled."
            });
            return;
        }
        if (params && Object.keys(params).length) {
            var errorFounded = validateParams(params, ["categoryName", "categoryModifier", "page"]);
            if (errorFounded) {
                queryServiceCb(errorFounded);
                return;
            }
            page = params.page;

            if (page < 0) {
                queryServiceCb({
                    page: page,
                    message: "Invalid page number, it must be a positive number."
                });
                return;
            }

            inViewerSearch.inViewerSearchThisProject.getPage({
                name: params.categoryName,
                modifier: params.categoryModifier
            }, page, queryServiceCb);

        } else {
            inViewerSearch.inViewerSearchThisProject.search(strTrimmed, queryServiceCb);
        }
    };

    /**
     * Validates if the object params contains all the mandatory fields defined
     *
     * @param  {object} params - Contains fields to be validated
     * @param  {array} mandatoryFields - An array containing names of all the mandatory fields
     * @return {object} Returns an object containing all the errors found or returns null if all mandatory fields are found
     * @private
     */
    function validateParams(params, mandatoryFields) {
        var i = 0;
        var length = mandatoryFields.length;

        if (!params) {
            return {
                message: "params object is missing, it should be an object with the fields categoryName, categoryModifier and page specify."
            };
        }

        while (i < length) {
            if (!params.hasOwnProperty(mandatoryFields[i])) {
                return {
                    message: mandatoryFields[i] + " is missing in params object."
                };
            }
            i++;
        }

        return null;

    }

    viewerSearchNameSpace.InViewerSearchExtension = InViewerSearchExtension;
    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.InViewerSearch', InViewerSearchExtension);

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var avu = Autodesk.Viewing.UI;
    var viewerSearchNameSpace = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    /**
     * InViewerSearchPanel
     * Sets the model structure panel for displaying the loaded model.
     * @class
     * @augments Autodesk.Viewing.UI.DockingPanel
     *
     * @param {HTMLElement} viewer - The viewer
     * @param {string} id - The id for this panel.
     * @param {string} title - The initial title for this panel.
     * @param {Object} [options] - An optional dictionary of options.
     * @param {boolean} [options.startCollapsed=true] - When true, collapses all of the nodes under the root.
     * @param {class} qsApiService - pointer to QS API service.
     * @constructor
     */
    viewerSearchNameSpace.InViewerSearchPanel = function(viewer, id, title, options, qsApiService) {
        var that = this;

        this.viewer = viewer;
        this.qsApiService = qsApiService;

        avu.DockingPanel.call(this, viewer.container, id, title, options);

        this.container.classList.add('inViewerSearchPanel');

        options = options || {};

        if (!options.heightAdjustment) {
            options.heightAdjustment = 40;
        }

        if (!options.marginTop) {
            options.marginTop = 0;
        }

        options.left = true;

        this.createScrollContainer(options);

        this.options = options;
        this.selectedNodes = [];

        this.uiCreated = false;


        this.addVisibilityListener(function(show) {

            if (show) {
                if (!that.uiCreated) {
                    that.createUI();
                }

                that.resizeToContent();
            }
        });
    };

    viewerSearchNameSpace.InViewerSearchPanel.prototype = Object.create(avu.DockingPanel.prototype);
    viewerSearchNameSpace.InViewerSearchPanel.prototype.constructor = viewerSearchNameSpace.InViewerSearchPanel;

    viewerSearchNameSpace.InViewerSearchPanel.prototype.createUI = function() {
        // TODO(jwo): Why is this an empty function?
        //var self = this;
    };

    /**
     * Given a node's id, adds the given CSS class to this node.
     *
     * @param {string} id - The id of a node in an Autodesk.Viewing.Model
     * @param {string} className - The CSS class to add
     * @returns {boolean} - true if the class was added, false otherwise
     */
    viewerSearchNameSpace.InViewerSearchPanel.prototype.addClass = function(id, className) {
        return ((this.tree !== null) && this.tree.addClass(id, className));
    };

    /**
     * Given a node's id, removes the given CSS class from this node.
     *
     * @param {string} id - The id of a node in an Autodesk.Viewing.Model
     * @param {string} className - The CSS class to remove
     * @returns {boolean} - true if the class was removed, false otherwise
     */
    viewerSearchNameSpace.InViewerSearchPanel.prototype.removeClass = function(id, className) {
        return ((this.tree !== null) && this.tree.removeClass(id, className));
    };

    viewerSearchNameSpace.InViewerSearchPanel.prototype.initializeCloseHandler = function(closer) {
        var self = this;

        closer.setAttribute("id", "in-viewer-search-close");
        self.addEventListener(closer, 'click', function() {
            self.setVisible(false);
            self.qsApiService.logGeneralEvent('searchWindowClose');
            if (self.closeCb) {
                self.closeCb();
            }
        }, false);
    };

    viewerSearchNameSpace.InViewerSearchPanel.prototype.addCloseHandler = function(closecb) {
        this.closeCb = closecb;
    };


    avu.InViewerSearchPanel = viewerSearchNameSpace.InViewerSearchPanel;

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var avu = Autodesk.Viewing.UI;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');
    var Helper = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch.Helper');

    var RECENT_QUERIES_STORAGE_KEY = 'recentSearches';
    var RECENT_QUERIES_KEY = 'recent-queries';
    var SAVED_QUERIES_KEY = 'saved-queries';
    var SECTION_ATTR = "adsksectionkey";
    var QUERY_ID_ATTR = "adskqueryid";
    var ERROR_NOT_UP_TO_DATE = "The object to save is not up to date.";
    var ERROR_EXCEEDED_MAX = "User exceeded maximum number of queries";

    function tryJsonParse(jsonText) {
        var json = null;

        try {
            json = JSON.parse(jsonText);
        } catch (err) {
            avp.logger.error('JSON parse error: ' + err);
        }

        return json;
    }

    function repeatSearch(self, str, dbId, item, savedQuery) {
        if (!self.enabled) {
            return;
        }

        var searchBar = self.searchBarElem;
        if (savedQuery) {
            var index = self.userDocumentQueries.documentQueries.queries[0].querySet.indexOf(savedQuery);
            self.qsApiService.logSavedQuerySearchClickEvent(index, self.documentUrn, savedQuery.geometry, savedQuery.queryId, savedQuery.query);
        }

        if (str) {
            searchBar.value = str;
            self.uiSearch(dbId);
            self.updateRecentQueries(str);
        }
    }

    function recentSearchItem(self, string) {
        var itemDom = document.createElement('li');

        itemDom.className = 'recent-item';
        var textContainer = document.createElement('div');
        textContainer.className = "text-container";
        var labelText = document.createElement('label');

        labelText.appendChild(document.createTextNode(string));
        labelText.addEventListener('click', function() {
            repeatSearch(self, string);
        }, false);


        if (self.savedQueriesEnabled) {
            var saveIcon = document.createElement('div');
            saveIcon.className = "save-query-icon";
            saveIcon.addEventListener('click', function() {
                self.saveQuery(string);
            }, false);
            itemDom.appendChild(saveIcon);
        }
        textContainer.appendChild(labelText);
        itemDom.appendChild(textContainer);

        return itemDom;
    }

    function createRecentQueriesUI(self, container, hideTitle) {
        var labelDom, listDom, recentList, itemDom;
        if (!hideTitle) {
            labelDom = document.createElement('label');
            labelDom.className = 'recent-label';
            labelDom.appendChild(document.createTextNode(av.i18n.translate('Recent Queries')));
            container.appendChild(labelDom);
        }

        listDom = document.createElement('ul');
        listDom.className = 'recent-searches-list dockingPanelScroll';

        recentList = self.getRecentQueries();
        recentList.forEach(function(item) {
            listDom.appendChild(recentSearchItem(self, item));
        });

        if (recentList.length < 1) {
            itemDom = document.createElement('li');
            itemDom.className = 'recent-item empty-list';
            itemDom.appendChild(document.createTextNode(av.i18n.translate('Recent Queries Empty')));
            listDom.appendChild(itemDom);
        }


        container.appendChild(listDom);
    }

    function createSavedQueryItem(self, item) {
        var li = document.createElement('li');
        li.className = "saved-query-item";
        li.setAttribute(QUERY_ID_ATTR, item.queryId);
        var queryString = decodeURIComponent(item.query);
        var deleteIcon = document.createElement('div');
        deleteIcon.className = "delete-query-icon";
        deleteIcon.addEventListener('click', function() {
            self.showDeleteConfirmation(queryString, li, item.queryId);
        });

        var textContainer = document.createElement('div');
        textContainer.className = "text-container";
        var query = document.createElement('label');
        query.appendChild(document.createTextNode(queryString));
        query.addEventListener('click', function() {
            repeatSearch(self, queryString, null, li, item);
        });
        li.appendChild(deleteIcon);
        textContainer.appendChild(query);
        li.appendChild(textContainer);
        return li;
    }

    function setAllocationLabelText(label, userAllocation) {
        var text = av.i18n.translate('{0} saved of {1} allocated').replace("{0}", userAllocation.used).replace("{1}", userAllocation.max);
        label.appendChild(document.createTextNode(text));
    }

    function createAllocationHTML(self, userAllocation) {
        var userAllocationHtml = document.createElement('div');
        userAllocationHtml.className = "user-allocation";
        var quotatext = document.createElement('label');
        quotatext.className = "quota-text";
        setAllocationLabelText(quotatext, userAllocation);
        self.quotaHTML = quotatext;
        var settings = document.createElement('div');
        settings.className = "seetings-icon adsk-button-icon adsk-icon-settings";
        settings.title = av.i18n.translate('Saved queries settings');
        settings.addEventListener('click', function() {
            self.openSettingsPanel();
        });
        userAllocationHtml.appendChild(quotatext);
        userAllocationHtml.appendChild(settings);

        return userAllocationHtml;
    }

    function emptyListMessageHTML() {
        var noQueries = document.createElement('p');
        noQueries.className = "no-queries-saved";
        noQueries.appendChild(document.createTextNode(av.i18n.translate('There are no queries saved for this document')));
        return noQueries;
    }

    function createSavedQueriesHtml(self, data, container) {
        var queryListEmpty = true;
        var userAllocation = data.userData.allocation;
        var userAllocationHtml = createAllocationHTML(self, userAllocation);

        container.appendChild(userAllocationHtml);

        var queriesList = document.createElement('ul');
        queriesList.className = "saved-queries-list dockingPanelScroll";
        self.savedQueriesList = queriesList;
        if (data.documentQueries) {
            var documentQueries = data.documentQueries;
            if (documentQueries.queries && documentQueries.queries.length) {
                var queries = documentQueries.queries[0];
                var querySet = queries.querySet;
                querySet.forEach(function(item) {
                    var itemHTML = createSavedQueryItem(self, item);
                    queriesList.appendChild(itemHTML);
                    queryListEmpty = false;
                });
            }
        }
        container.appendChild(queriesList);

        if (queryListEmpty) {
            self.savedQueriesList.classList.add("hidden");
            var noQueries = emptyListMessageHTML();
            container.appendChild(noQueries);
        }
    }

    function createQueriesHtml(self, data, container) {
        if (data) {
            var queries = document.createElement('div');
            queries.className = "queries-accordion";
            var savedQueriesTitle = document.createElement('div');
            savedQueriesTitle.className = "queries-title saved-queries-title non-clickable";
            savedQueriesTitle.setAttribute(SECTION_ATTR, SAVED_QUERIES_KEY);
            savedQueriesTitle.addEventListener('click', function() {
                self.toggleSection(SAVED_QUERIES_KEY);
            });
            self.savedQueriesTitle = savedQueriesTitle;
            savedQueriesTitle.appendChild(document.createTextNode(av.i18n.translate('Saved Queries')));
            var savedQueriesContent = document.createElement('div');
            savedQueriesContent.className = "queries-content " + SAVED_QUERIES_KEY;
            self.savedQueriesContent = savedQueriesContent;
            createSavedQueriesHtml(self, data, savedQueriesContent);

            var recentQueriesTitle = document.createElement('div');
            recentQueriesTitle.className = "queries-title recent-queries-title";
            recentQueriesTitle.setAttribute(SECTION_ATTR, RECENT_QUERIES_KEY);
            recentQueriesTitle.addEventListener('click', function() {
                self.toggleSection(RECENT_QUERIES_KEY);
            });
            recentQueriesTitle.appendChild(document.createTextNode(av.i18n.translate('Recent Queries')));
            self.recentQueriesTitle = recentQueriesTitle;
            var recentQueriesContent = document.createElement('div');
            recentQueriesContent.className = "queries-content hidden " + RECENT_QUERIES_KEY;
            self.recentQueriesElem = recentQueriesContent;
            createRecentQueriesUI(self, self.recentQueriesElem, true);

            queries.appendChild(savedQueriesTitle);
            self.selectedSection = SAVED_QUERIES_KEY;
            self.savedQueriesContent = savedQueriesContent;
            queries.appendChild(savedQueriesContent);
            queries.appendChild(recentQueriesTitle);
            self.recentQueriesContent = recentQueriesContent;
            queries.appendChild(recentQueriesContent);

            container.appendChild(queries);
        }
    }

	function safe_atob(asciitext) {
		// replace "_" back into "/"
		var tmp = asciitext.replace(/-/g, '+').replace(/_/g, '/');

		while (tmp.length % 4)
			tmp += '=';

		return atob(tmp);
	}

    function removeVersionFromDocumentURN(documentUrnWithVersion) {
        var documentDecoded = safe_atob(documentUrnWithVersion);
        var index = documentDecoded.indexOf("?version=");
        var documentUrn = window.btoa(documentDecoded.slice(0, index));
        return documentUrn;
    }

    function addQueryToUserDocumentQueries(self, userDocumentQueries, currentGeometry, query) {
        var documentQueries;
        var alreadyExistQuery = false;
        var userData = userDocumentQueries.userData;

        if (userDocumentQueries.documentQueries) {
            documentQueries = userDocumentQueries.documentQueries;
        } else {
            documentQueries = {
              document: {
                id: self.documentUrn,
                name: encodeURIComponent(self.documentName),
                idType: "urn"
              },
              queries: [
                {
                  querySet: [],
                  creationDate: new Date().getTime(),
                  lastModifiedDate: new Date().getTime()
                }
              ]
            };

            userDocumentQueries.documentQueries = documentQueries;
        }

        var queries = documentQueries.queries[0];
        queries.querySet.forEach(function(existingQuery) {
            if (decodeURIComponent(existingQuery.query) === query) {
                alreadyExistQuery = true;
            }
        });

        if (alreadyExistQuery) {
            return null;
        }

        var newQuery = {
              "query": encodeURIComponent(query),
              "queryId": THREE.Math.generateUUID(),
              "geometry": currentGeometry
        };

        queries.querySet.unshift(newQuery);
        queries.lastModifiedDate = new Date().getTime();
        userData.allocation.used = userData.allocation.used + 1;
        userData.lastModifiedDate = new Date().getTime();
        self.qsApiService.logSavedQuerySaveClickEvent(0, self.documentUrn, newQuery.geometry, newQuery.queryId, newQuery.query);

        return newQuery;
    }

    function removeQueryToUserDocumentQueries(self, userDocumentQueries, queryId) {
        var userData = userDocumentQueries.userData;
        var queries = userDocumentQueries.documentQueries.queries[0];
        var indexToRemove = 0;
        queries.querySet.forEach(function(query, index) {
            if(query.queryId === queryId) {
                indexToRemove = index;
            }
        });
        var queryToRemove = queries.querySet[indexToRemove];
        self.qsApiService.logSavedQueryDeleteClickEvent(indexToRemove, userDocumentQueries.documentQueries.document.id, queryToRemove.geometry, queryToRemove.queryId, queryToRemove.query);
        queries.querySet.splice(indexToRemove, 1);

        queries.lastModifiedDate = new Date().getTime();
        userData.allocation.used = userData.allocation.used - 1;
        userData.lastModifiedDate = new Date().getTime();
    }

    /**
     * viewerSearchNameSpace.InViewerSearchQueries - Saved queries logic
     *
     * @param  {HTMLElement} viewer  - The Viewer
     * @param  {object} options - An optional dictionary of options.
     * @constructor
     */
    viewerSearchNameSpace.InViewerSearchQueries = function(viewer, options) {
        this.viewer = viewer;
        this.options = options;
        this.container = null;
        this.savedQueriesEnabled = false;
        this.qsApiService = null;
        this.userDocumentQueries = null;
        this.currentGeometry = "";
        this.documentName = "";
        this.settingsPanel = null;
        this.enabled = true;
        this.messageTimer = null;
        this.savedQueriesUIEnabled = false;

        this.container = null; //queries html container

        this.initialized = false;

        this.recentQueriesElem = null;
        this.quotaHTML = null;
        this.savedQueriesContent = null;

        this.saveLastQuery = null;
        this.recentQueries = null;
        this.loading = null;

        this.savedQueriesContent = null;
        this.recentQueriesContent = null;
        this.savedQueriesTitle = null;
        this.recentQueriesTitle = null;
        this.selectedSection = null;
        this.savedQueriesList = null;

        this.searchBarElem = null;
        this.documentUrn = "";
        this.initCb = null;
    };

    viewerSearchNameSpace.InViewerSearchQueries.prototype.constructor = viewerSearchNameSpace.InViewerSearchQueries;

    function afterInit(self, err) {
        self.initialized = true;
        if (self.initCb) {
            self.initCb(err);
        }
    }

    /**
     * InViewerSearchQueries.prototype.initialize -
     * Gets the saved queries list and show them. In case the saved queries are not enabled
     * will show the recent queries only.
     *
     * @param  {HTMLElement} container       - container for the html to create
     * @param  {QsApiService} qsApiService    - qsApiService to use
     * @param  {HTMLElement} searchBar       - the search bar
     * @param  {string} currentGeometry - loaded geometry guid
     * @param  {string} documentName    - loaded document name
     * @param  {function} searchFn      - search function
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.initialize = function(container, qsApiService, searchBar, currentGeometry, documentName, searchFn) {
        var self = this;
        this.qsApiService = qsApiService;
        this.container = container;
        this.toggleLoadingMessage(true);
        this.searchBarElem = searchBar;
        this.uiSearch = searchFn;
        this.currentGeometry = currentGeometry;
        this.documentName = documentName;

        if (this.options.savedQueries && this.options.savedQueries.profileId) {
            this.profileId = this.options.savedQueries.profileId;
            this.savedQueriesEnabled = true;
            this.documentUrn = removeVersionFromDocumentURN(this.viewer.model.getData().urn);
            this.settingsPanel = new viewerSearchNameSpace.InViewerSearchSettingsPanel(this.viewer, 'in-viewer-search-settings', av.i18n.translate('Saved Queries Settings'),
                                this.options, this.qsApiService, this.profileId, function() {
                                    self.toggleEnable(true);
                                }, this.documentUrn, function(userData, queries) {
                                    self.updateUserQueries(userData, queries);
                                });

            this.settingsPanel.createContainers(setAllocationLabelText);
            this.getQueries(function(data) {
                self.savedQueriesUIEnabled = true;
                createQueriesHtml(self, data, container);
                self.toggleLoadingMessage(false);
                afterInit(self);
            }, function(err, message) {
                avp.logger.error('InViewerSearch Extension: Error getting saved queries for document, with error=' + message);
                self.recentQueriesElem = self.container;
                createRecentQueriesUI(self, self.recentQueriesElem);
                self.toggleLoadingMessage(false);
                afterInit(self, err);
            });
        } else {
            avp.logger.warn('InViewerSearch Extension: Saved queries disabled');
            self.recentQueriesElem = self.container;
            createRecentQueriesUI(self, self.recentQueriesElem);
            self.toggleLoadingMessage(false);
            afterInit(self, "errr");
        }

    };


    /**
     * InViewerSearchQueries.prototype.toggleMessage -
     * Shows/hides a message
     *
     * @param  {string} message   - message to show
     * @param  {boolean} show     - if true shows the message, otherwise hides it
     * @param  {boolean} withTimer   - true if the message should be hidden after some time
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.toggleMessage = function(message, show, withTimer) {
        var self = this;
        if (withTimer) {
            viewerSearchNameSpace.Helper.showMessageWithTimer(self, message);
        } else {
            viewerSearchNameSpace.Helper.toggleMessage(self, message, show);
        }
    };

    /**
     * InViewerSearchQueries.prototype.toggleLoadingMessage -
     * Shows/hides the loading message
     *
     * @param  {boolean} loading - if true shows the loading message, otherwise hides it.
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.toggleLoadingMessage = function(loading) {
        this.toggleMessage(av.i18n.translate('Loading'), loading);
    };

    /**
     * InViewerSearchQueries.prototype.toggleSection -
     * Shows/hides the saved queries section or recent queries section
     *
     * @param  {string} section - section to show  {recent-queries|saved-queries}
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.toggleSection = function(section) {
        if (!this.enabled) {
            return;
        }

        if (this.selectSection !== section) {
            this.selectSection = section;
            if (section === SAVED_QUERIES_KEY) {
                this.savedQueriesContent.classList.remove('hidden');
                this.savedQueriesTitle.classList.add('non-clickable');
                this.recentQueriesContent.classList.add('hidden');
                this.recentQueriesTitle.classList.remove('non-clickable');

            } else {
                this.recentQueriesContent.classList.remove('hidden');
                this.recentQueriesTitle.classList.add('non-clickable');
                this.savedQueriesTitle.classList.remove('non-clickable');
                this.savedQueriesContent.classList.add('hidden');
            }
        }
    };

    /**
     * InViewerSearchQueries.prototype.updateUserQueries -
     * updates the user quota and saved queries list html
     *
     * @param  {UserData} userData        - user data object
     * @param  {DocumentQueries} documentQueries - document queries object
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.updateUserQueries = function(userData, documentQueries) {
        this.userDocumentQueries.userData = userData;
        this.updateQuota(userData);

        if (documentQueries) {
            this.userDocumentQueries.documentQueries = documentQueries;
            if (documentQueries.queries && documentQueries.queries.length) {
                this.updateSavedQueriesList(null, false, documentQueries.queries[0].querySet);
            }
        }
    }

    /**
     * InViewerSearchQueries.prototype.updateQuota - updates the html that shows the user quota
     *
     * @param  {userData} userData - user data object
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.updateQuota = function(userData) {
        this.quotaHTML.removeChild(this.quotaHTML.childNodes[0]);
        setAllocationLabelText(this.quotaHTML, userData.allocation);
    };

    /**
     * InViewerSearchQueries.prototype.updateSavedQueriesList -
     * Updates the saved queries list. Adding a new item, removing an existing item or if the querySet is passed
     * updates the entire list.
     * @param {HTMLElement} item - html item element to add or remove
     * @param {boolean} remove - if true the item will be removed from list
     * @param {query[]} querySet - saved queries list
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.updateSavedQueriesList = function(item, removing, querySet) {
        var list = this.savedQueriesList;
        var self = this;
        if (item) {
            if (removing) {
                list.removeChild(item);
                if (!list.childNodes.length) {
                    this.savedQueriesContent.appendChild(emptyListMessageHTML());
                    if (!this.savedQueriesList.classList.contains("hidden")) {
                        this.savedQueriesList.classList.add("hidden");
                    }
                }
            } else {
                var itemHTML = createSavedQueryItem(self, item);
                list.insertBefore(itemHTML, list.childNodes[0]);
                var lastChild = this.savedQueriesContent.lastChild;
                if (lastChild.classList.contains("no-queries-saved")) {
                    this.savedQueriesContent.removeChild(lastChild);
                }

                if (this.savedQueriesList.classList.contains("hidden")) {
                    this.savedQueriesList.classList.remove("hidden");
                }
            }
        } else if (querySet.length) {
            this.savedQueriesList.classList.remove("hidden");
            this.savedQueriesList.innerHTML = "";
            querySet.forEach(function(item) {
                var itemHTML = createSavedQueryItem(self, item);
                self.savedQueriesList.appendChild(itemHTML);
            });
        } else {
            this.savedQueriesList.innerHTML = "";
            this.savedQueriesList.classList.add("hidden");
            if (!this.savedQueriesContent.getElementsByClassName("no-queries-saved").length) {
                this.savedQueriesContent.appendChild(emptyListMessageHTML());
            }

        }

    };


    /**
     * InViewerSearchQueries.prototype.toggleEnable -
     * Enable or disable the panel
     *
     * @param  {boolean} enable - true if the panel is enable
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.toggleEnable = function(enable) {
        if (enable) {
            this.enabled = true;
            this.container.classList.remove("disabled");
        } else if (!this.container.classList.contains("disabled")) {
            this.enabled = false;
            this.container.classList.add("disabled");
        }
    }


    /**
     * InViewerSearchQueries.prototype.openSettingsPanel -
     * Opens the settings panel for the saved queries.
     *
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.openSettingsPanel = function() {
        if (!this.enabled) {
            return;
        }

        var self = this;
        if (this.settingsPanel) {
            this.settingsPanel.setVisible(true);
            this.toggleEnable(false);
        }
    };


    /**
     * InViewerSearchQueries.prototype.closeSettingsPanel -
     * Closes the settings panel
     *
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.closeSettingsPanel = function() {
        var self = this;
        if (this.settingsPanel) {
            this.settingsPanel.setVisible(false);
            this.toggleEnable(true);
        }
    };

    /**
     * InViewerSearchQueries.prototype.getQueries -
     * Gets the saved queries from the server and updates userDocumentQueries if success
     *
     * @param  {function} successCb - function to call after success with the queries as a parameter
     * @param  {function} errorCb   - function to call after error with status code error and message error as a parameters
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.getQueries = function(successCb, errorCb) {
        var self = this;
        this.qsApiService.getUserQueries(this.profileId, this.documentUrn, function(err, data) {
            if (err) {
                errorCb(err, data);
            } else {
                self.userDocumentQueries = data;
                self.userDocumentQueries.documentQueries = data.documentQueries[0];
                successCb(data);
            }
        });
    }

    /**
     * InViewerSearchQueries.prototype.saveQuery -
     * Saves the query passed as a parameter in the server. And updated the UI
     *
     * @param  {string} query - query string to save
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.saveQuery = function(query) {
        if (!this.enabled) {
            return;
        }

        var handleSaveError = function (self, err, oldState, errorMessage) {
            if (oldState) {
                self.userDocumentQueries = oldState;
            }

            self.toggleLoadingMessage(false);
            avp.logger.error('InViewerSearch Extension: Error saving document queries, with error=' + err);
            if (!errorMessage) {
                self.toggleMessage(av.i18n.translate('An error occur while saving query, please try again later'), true, true);
            } else {
                self.toggleMessage(errorMessage, true, true);
            }

        };

        this.toggleMessage(av.i18n.translate('Saving'), true, false);
        var self = this;
        var oldState = Helper.copyQueries(this.userDocumentQueries);
        var newQuery = addQueryToUserDocumentQueries(self, this.userDocumentQueries, this.currentGeometry, query);
        if (!newQuery) {
            this.toggleMessage("", false);
            this.toggleMessage(av.i18n.translate("The query is already saved."), true, true);
            return;
        }

        var userData = this.userDocumentQueries.userData;
        var documentQueries = this.userDocumentQueries.documentQueries;

        this.qsApiService.saveUserQueries(this.profileId, this.userDocumentQueries, function(err, result) {
            if (!err) {
                userData.version = result.userDataVersion;
                documentQueries.version = result.documentQueriesVersion;
                self.updateQuota(userData);
                self.updateSavedQueriesList(newQuery);
                self.toggleSection(SAVED_QUERIES_KEY);
                self.updateRecentQueries(query, true);
                self.toggleMessage("", false);
            } else {
                if (err === 400 && result.indexOf(ERROR_NOT_UP_TO_DATE) >= 0) {
                    self.getQueries(function(data) {
                        handleSaveError(self, result, null, av.i18n.translate("Error saving query cause query list was outdated. Review list and retry operation."));
                        self.updateQuota(self.userDocumentQueries.userData);
                        self.updateSavedQueriesList(null, null, self.userDocumentQueries.documentQueries.queries[0].querySet);
                    }, function(err, message) {
                        handleSaveError(self, message, oldState);
                    });
                } if (err === 400 && result.indexOf(ERROR_EXCEEDED_MAX) >= 0) {
                    handleSaveError(self, result, oldState, av.i18n.translate("Maximum number of queries saved exceeded, please delete some queries or contact to your administrator"));
                }else {
                    handleSaveError(self, result, oldState);
                }
            }
        });
    };


    /**
     * InViewerSearchQueries.prototype.showDeleteConfirmation -
     * Shows the delete confirmation popup
     *
     * @param  {string} query  - query string to delete
     * @param  {HTMLElement} li      - item to delete from list
     * @param  {string} queryId - id of the query to delete
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.showDeleteConfirmation = function(query, li, queryId) {
        if (!this.enabled) {
            return;
        }

        var self = this;
        this.toggleEnable(false);
        var popup = Helper.showDeletePopup(this.container, query, function() {
            self.container.removeChild(popup);
            self.toggleEnable(true);
            self.deleteQuery(li, queryId);
        }, function() {
            self.toggleEnable(true);
            self.container.removeChild(popup);
        });
    }


    /**
     * InViewerSearchQueries.prototype.deleteQuery -
     * Deletes the query from the server and updates the UI
     *
     * @param  {HTMLElement} li      - item to delete from list
     * @param  {string} queryId - id of the query to delete
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.deleteQuery = function(li, queryId) {
        if (!this.enabled) {
            return;
        }

        var handleDeleteError = function(self, data, oldState) {
            self.userDocumentQueries = oldState;
            self.toggleLoadingMessage(false);
            avp.logger.error('InViewerSearch Extension: Error deleting document queries, with error=' + data);
            self.toggleMessage(av.i18n.translate('An error occur while deleting query, please try again later'), true, true);
        };

        this.toggleMessage(av.i18n.translate('Deleting'), true, false);
        var self = this;
        var oldState = Helper.copyQueries(this.userDocumentQueries);
        removeQueryToUserDocumentQueries(self, this.userDocumentQueries, queryId);
        var userData = this.userDocumentQueries.userData;
        var documentQueries = this.userDocumentQueries.documentQueries;

        this.qsApiService.saveUserQueries(this.profileId, this.userDocumentQueries, function(err, result) {
            if (!err) {
                userData.version = result.userDataVersion;
                documentQueries.version = result.documentQueriesVersion;
                self.updateQuota(userData);
                self.updateSavedQueriesList(li, true);
                self.toggleMessage("", false);
            } else {
                if (err === 400 && result.indexOf(ERROR_NOT_UP_TO_DATE) >= 0) {
                    self.getQueries(function(data) {
                        self.toggleMessage("", false);
                        self.toggleMessage(av.i18n.translate("Error deleting query cause query list was outdated. Review list and retry operation."), true, true);
                        self.updateQuota(self.userDocumentQueries.userData);
                        self.updateSavedQueriesList(null, null, self.userDocumentQueries.documentQueries.queries[0].querySet);
                    }, function(err, message) {
                        handleDeleteError(self, message, oldState);
                    });
                } else {
                    handleDeleteError(self, result, oldState);
                }
            }
        });
    };


    /**
     * InViewerSearchQueries.prototype.getRecentQueries -
     * returns the recent queries saves in the browser local storage
     *
     * @return {string[]}  recent queries list
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.getRecentQueries = function() {

        if (!this.recentQueries) {
            this.recentQueries = tryJsonParse(window.localStorage[RECENT_QUERIES_STORAGE_KEY] || '[]');
        }

        return this.recentQueries;
    };

    /**
     * InViewerSearchQueries.prototype.updateRecentQueries -
     * adds a new string to the recent queries list and save it to browser local storage
     *
     * @param  {string} str searched string
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.updateRecentQueries = function(str, remove) {
        var self, index, emptyDom, listDom;

        if (!str) {
            return;
        }

        self = this;

        if (!this.recentQueries) {
            this.getRecentQueries();
        }

        index = this.recentQueries.indexOf(str);

        if (remove && index >= 0) {
            listDom = this.recentQueriesElem.getElementsByClassName("recent-searches-list")[0];
            this.recentQueries.splice(index, 1);
            listDom.removeChild(listDom.childNodes[index]);
            window.localStorage[RECENT_QUERIES_STORAGE_KEY] = JSON.stringify(this.recentQueries);

            if (this.recentQueries.length < 1) {
                var itemDom = document.createElement('li');
                itemDom.className = 'recent-item empty-list';
                itemDom.appendChild(document.createTextNode(av.i18n.translate('Recent Queries Empty')));
                listDom.appendChild(itemDom);
            }
            return;
        }

        if (index === 0) {
            return;
        }

        listDom = this.recentQueriesElem.getElementsByClassName("recent-searches-list")[0];
        if (index > 0) {
            this.recentQueries.splice(index, 1);
            listDom.removeChild(listDom.childNodes[index]);
            index = -1;
        }

        if (index < 0) {
            this.recentQueries = [str].concat(this.recentQueries.slice(0, 20));
            window.localStorage[RECENT_QUERIES_STORAGE_KEY] = JSON.stringify(this.recentQueries);

            if (self.options.uiEnabled) {

                emptyDom = listDom.children[0];
                if (emptyDom.className.indexOf('empty-list') >= 0) {
                    emptyDom.parentNode.removeChild(emptyDom);
                }

                listDom.insertBefore(recentSearchItem(self, str), listDom.childNodes[0]);
            }
        }
    };

    /**
     * InViewerSearchQueries.prototype.addInitListener -
     * adds a cb when initialized
     * @param {function} function to call after initialized
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.addInitListener = function(cb) {
        if (this.initialized) {
            cb();
            return;
        }

        this.initCb = cb;
    };

    /**
     * InViewerSearchQueries.prototype.getUserDocumentQueries -
     * returns the userDocumentQueries
     *
     */
    viewerSearchNameSpace.InViewerSearchQueries.prototype.getUserDocumentQueries = function() {
        return this.userDocumentQueries;
    };

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var avu = Autodesk.Viewing.UI;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');
    var Helper = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch.Helper');

    var DOCUMENT_ID_ATTR = "adskdocumentid";
    var QUERY_ID_ATTR = "adskqueryid";
    var DOCUMENT_INDEX_ATTR = "adskdocumentindex";
    var ERROR_NOT_UP_TO_DATE = "The object to save is not up to date.";

    function createDocumentQueriesHTML(self, documentQueries, index) {
        var queries = documentQueries.queries[0].querySet;
        var documentContainer = document.createElement('div');
        documentContainer.className = "document-queries-container";

        var documentName = document.createElement('label');
        documentName.className = 'document-name';
        documentName.appendChild(document.createTextNode(decodeURIComponent(documentQueries.document.name)));
        documentName.addEventListener('click', function() {
            self.toggleQueries(documentContainer);
        });
        documentContainer.appendChild(documentName);
        var docId = documentQueries.document.id;
        var list = document.createElement('ul');
        list.className = "document-list";
        list.setAttribute(DOCUMENT_ID_ATTR, docId);
        list.setAttribute(DOCUMENT_INDEX_ATTR, index);

        queries.forEach(function(item) {
            var li = document.createElement('li');
            li.className = "saved-query-item";
            li.setAttribute(QUERY_ID_ATTR, item.queryId);
            var queryString = decodeURIComponent(item.query);
            var deleteIcon = document.createElement('div');
            deleteIcon.className = "delete-query-icon";
            deleteIcon.addEventListener('click', function() {
                self.showDeleteConfirmation(queryString, li, item.queryId);
            });
            var textContainer = document.createElement('div');
            textContainer.className = "text-container";
            var query = document.createElement('label');
            query.appendChild(document.createTextNode(queryString));
            li.appendChild(deleteIcon);
            textContainer.appendChild(query);
            li.appendChild(textContainer);

            list.appendChild(li);
        });

        documentContainer.appendChild(list);

        return documentContainer;
    }


    /**
     * InViewerSearchSettingPanel
     * Settings for Saved queries. In this panel the user can see all the queries saved and
     * perform some actions like delete.
     *
     * @class
     * @augments Autodesk.Viewing.UI.DockingPanel
     *
     * @param {HTMLElement} viewer - The viewer
     * @param {string} id - The id for this panel.
     * @param {string} title - The initial title for this panel.
     * @param {Object} [options] - An optional dictionary of options.
     * @param {QsApiService} qsApiService - pointer to QS API service.
     * @param {string} pid - viewer search profile id to use.
     * @param {function} enableSearchPanelfn - function to call to enable/disable the search panel
     * @param {string} currentDocument     - loaded document urn
     * @param {function} updateQuerylistfn   - function to call to update the saved queries list in the search panel.
     * @constructor
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel = function(viewer, id, title, options, qsApiService, pid, enableSearchPanelfn, currentDocument, updateQuerylistfn) {
        var that = this;

        this.viewer = viewer;
        this.qsApiService = qsApiService;
        this.queriesString = [];
        this.profileId = pid;
        this.setAllocationLabelText = null;
        this.enableSearchPanel = enableSearchPanelfn;
        this.currentDocument = currentDocument;
        this.updateCurrentQueriesList = updateQuerylistfn;

        avu.DockingPanel.call(this, viewer.container, id, title, options);

        this.container.classList.add('viewer-search-settings-panel');

        options = options || {};

        if (!options.heightAdjustment) {
            options.heightAdjustment = 40;
        }

        if (!options.marginTop) {
            options.marginTop = 0;
        }

        this.options = options;
        this.selectedNodes = [];
        this.spaceLegend = null;

        this.uiCreated = false;
        this.documentsQueriesHTML = null;
        this.userSpaceHTML = null;
        this.searchHTML = null;
        this.message = null;
        this.userData = null;
        this.documentQueries = [];

        this.addVisibilityListener(function(show) {
            if (show) {
                that.initializeQueries();
            }
            that.resizeToContent();
        });
    };

    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype = Object.create(avu.DockingPanel.prototype);
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.constructor = viewerSearchNameSpace.InViewerSearchPanel;


    /**
     * InViewerSearchSettingsPanel.prototype.createUI -
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.createUI = function() {
    };


    /**
     * InViewerSearchSettingsPanel.prototype.toggleLoadingMessage -
     * Shows/hides the loading message
     *
     * @param  {boolean} loading - when true, shows the loading message. Otherwise hides it.
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.toggleLoadingMessage = function(loading) {
        var self = this;
        Helper.toggleMessage(self, av.i18n.translate('Loading'), loading);
    };


    /**
     * InViewerSearchSettingsPanel.prototype.toggleMessage -
     * Shows/hides message
     *
     * @param  {string} message   - string message
     * @param  {boolean} show     - when true, shows the message. Otherwise hides it.
     * @param  {boolean} withTimer - if true the message disappears after some time
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.toggleMessage = function(message, show, withTimer) {
        var self = this;
        if (withTimer) {
            viewerSearchNameSpace.Helper.showMessageWithTimer(self, message);
        } else {
            viewerSearchNameSpace.Helper.toggleMessage(self, message, show);
        }
    };


    /**
     * Given a node's id, adds the given CSS class to this node.
     *
     * @param {string} id - The id of a node in an Autodesk.Viewing.Model
     * @param {string} className - The CSS class to add
     * @returns {boolean} - true if the class was added, false otherwise
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.addClass = function(id, className) {
        return ((this.tree !== null) && this.tree.addClass(id, className));
    };

    /**
     * Given a node's id, removes the given CSS class from this node.
     *
     * @param {string} id - The id of a node in an Autodesk.Viewing.Model
     * @param {string} className - The CSS class to remove
     * @returns {boolean} - true if the class was removed, false otherwise
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.removeClass = function(id, className) {
        return ((this.tree !== null) && this.tree.removeClass(id, className));
    };


    /**
     * InViewerSearchSettingsPanel.prototype.initializeCloseHandler - description
     * Adds a close handler
     *
     * @param  {HTMLElement} closer - element
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.initializeCloseHandler = function(closer) {
        var self = this;

        closer.setAttribute("id", "in-viewer-search-settings-close");
        self.addEventListener(closer, 'click', function() {
            self.setVisible(false);
            self.enableSearchPanel(true);
            self.qsApiService.logGeneralEvent('searchSettingsWindowClose');
        }, false);
    };


    /**
     * InViewerSearchSettingsPanel.prototype.showUserSpace -
     * Displays the UI for the user space
     *
     * @param  {UserData} userData - user data object
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.showUserSpace = function(userData) {
        var self = this;
        this.userSpaceHTML.innerHTML = "";
        var text = document.createElement('p');
        text.className = "space-legend";
        this.setAllocationLabelText(text, userData.allocation);
        this.spaceLegend = text;

        var spaceBar = document.createElement('div');
        spaceBar.className = "user-space-bar";
        var used = document.createElement('div');
        used.className = "used-space-bar";
        var usedNum = userData.allocation.used;
        var maxNum = userData.allocation.max;
        var width = (usedNum * 100) / maxNum;
        used.style.width = width + "%";
        spaceBar.appendChild(used);
        spaceBar.appendChild(text);

        var spaceLabel = document.createElement('label');
        spaceLabel.className = "space-label";
        spaceLabel.appendChild(document.createTextNode(av.i18n.translate('Space')));
        this.userSpaceHTML.appendChild(spaceLabel);
        this.userSpaceHTML.appendChild(spaceBar);
        this.searchHTML = null;
    }


    /**
     * InViewerSearchSettingsPanel.prototype.updateUserSpace -
     * Updates the UI of the user space
     *
     * @param  {UserData} userData - user data object
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.updateUserSpace = function(userData) {
        var self = this;
        this.spaceLegend.innerHTML = '';
        this.setAllocationLabelText(this.spaceLegend, userData.allocation);

        var usedBar = this.userSpaceHTML.getElementsByClassName("used-space-bar")[0];
        var usedNum = userData.allocation.used;
        var maxNum = userData.allocation.max;
        var width = (usedNum * 100) / maxNum;
        usedBar.style.width = width + "%";
    }


    /**
     * InViewerSearchSettingsPanel.prototype.updateQueriesList -
     * Updates the document queries list UI, removing the element.
     *
     * @param  {HTMLElement} li         - item to delete
     * @param  {string} documentId - document urn
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.updateQueriesList = function(li, documentId) {
        var parent = li.parentNode;
        parent.removeChild(li);

        if (!parent.childNodes.length) {
            var listToRemove = parent.parentNode;
            listToRemove.parentNode.removeChild(listToRemove);
        }

        if (!this.documentsQueriesHTML.childNodes.length) {
            var noQueriesSaved = document.createElement('p');
            noQueriesSaved.className = "no-queries-saved";
            noQueriesSaved.appendChild(document.createTextNode(av.i18n.translate('No queries saved')));
            this.documentsQueriesHTML.appendChild(noQueriesSaved);
        }
    }


    /**
     * InViewerSearchSettingsPanel.prototype.showAllQueries -
     * For each document displays the queries list
     *
     * @param  {DocumentQueries[]} documentQueries - list of document queries
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.showAllQueries = function(documentQueries) {
        var self = this;
        this.documentsQueriesHTML.innerHTML = '';

        documentQueries.forEach(function(docQueries, index) {
            var queries = docQueries.queries;
            if (docQueries.document && self.currentDocument === docQueries.document.id) {
                self.updateCurrentQueriesList(self.userData, docQueries);
            }
            if (queries.length && queries[0].querySet && queries[0].querySet.length) {
                self.documentsQueriesHTML.appendChild(createDocumentQueriesHTML(self, docQueries, index));
            }
        });

        if (!this.documentsQueriesHTML.childNodes.length) {
            var noQueriesSaved = document.createElement('p');
            noQueriesSaved.className = "no-queries-saved";
            noQueriesSaved.appendChild(document.createTextNode(av.i18n.translate('No queries saved')));
            this.documentsQueriesHTML.appendChild(noQueriesSaved);
        }
    }


    /**
     * InViewerSearchSettingsPanel.prototype.toggleQueries -
     * Shows/hides document queries list container
     *
     * @param  {HTMLElement} documentContainer - document queries list container to show or hide
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.toggleQueries = function(documentContainer) {
        if (documentContainer.classList.contains('collapsed')) {
            documentContainer.classList.remove('collapsed');
        } else {
            documentContainer.classList.add('collapsed');
        }
    }


    /**
     * InViewerSearchSettingsPanel.prototype.showDeleteConfirmation -
     * Shows the delete confirmation popup
     *
     * @param  {string} query   - query string to delete
     * @param  {HTMLElement} li      - item to delete from list
     * @param  {string} queryId - id for the query to delete
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.showDeleteConfirmation = function(query, li, queryId) {
        var self = this;
        var popup = Helper.showDeletePopup(this.container, query, function() {
            self.container.removeChild(popup);
            self.deleteQueries(li, queryId);
        }, function() {
            self.container.removeChild(popup);
        });
    }


    /**
     * InViewerSearchSettingsPanel.prototype.deleteQueries -
     * Deletes the query for the document queries list and updated the UI.
     *
     * @param  {HTMLElement} li      - item to delete from list
     * @param  {string} queryId - id for the query to delete           -
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.deleteQueries = function(li, queryId) {
        var self = this;

        var handleDeleteError = function(self, data, oldStateUser, oldStateDoc, index) {
            self.userData = oldStateUser;
            self.documentQueries[index] = oldStateDoc;

            avp.logger.error('InViewerSearch Extension: Error deleting document queries, with error=' + data);
            self.toggleMessage(av.i18n.translate('An error occur while deleting query, please try again later'), true, true);
        };

        this.toggleMessage(av.i18n.translate('Deleting'), true, false);
        var userData = this.userData;
        var documentParent = li.parentNode;
        var index = documentParent.getAttribute(DOCUMENT_INDEX_ATTR);
        var documentId = documentParent.getAttribute(DOCUMENT_ID_ATTR);
        var documentQueries = this.documentQueries[index];
        var oldStateDoc= Helper.copyDocumentQueries(documentQueries);
        var oldStateUser= Helper.copyUserData(this.userData);

        var queries = documentQueries.queries[0];
        var indexToRemove = 0;
        queries.querySet.forEach(function(query, index) {
            if(query.queryId === queryId) {
                indexToRemove = index;
            }
        });
        queries.querySet.splice(indexToRemove, 1);

        queries.lastModifiedDate = new Date().getTime();
        userData.allocation.used = userData.allocation.used - 1;
        userData.lastModifiedDate = new Date().getTime();

        var userDocumentQueries = {
            userData: userData,
            documentQueries: documentQueries
        };
        this.qsApiService.saveUserQueries(this.profileId, userDocumentQueries, function(err, result) {
            if (!err) {
                self.userData.version = result.userDataVersion;
                documentQueries.version = result.documentQueriesVersion;
                self.updateUserSpace(userData);
                self.updateQueriesList(li, documentId);
                self.updateCurrentQueriesList(userData, (self.currentDocument === documentId ? documentQueries : null));
                self.toggleMessage("", false);
            } else {
                if (err === 400 && result.indexOf(ERROR_NOT_UP_TO_DATE) >= 0) {
                    self.getAllQueries(function(data) {
                        self.toggleMessage(av.i18n.translate("Error deleting query cause query list was outdated. Review list and retry operation."), true, true);
                    }, function(err, data) {
                        handleDeleteError(self, data, oldStateUser, oldStateDoc, index);
                    });
                } else {
                    self.toggleMessage("", false);
                    handleDeleteError(self, result, oldStateUser, oldStateDoc, index);
                }
            }
        });
    }


    /**
     * InViewerSearchSettingsPanel.prototype.createContainers -
     * Creates the html containers for the saved queries panel.
     *
     * @param  {function} setAllocationLabelTextfn - function to call to get the text for the user space.
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.createContainers = function(setAllocationLabelTextfn) {
        var searchDiv = document.createElement('div');
        searchDiv.className = "search-div";
        this.searchHTML = searchDiv;

        var spaceHTML = document.createElement('div');
        spaceHTML.className = "queries-space-section";
        this.userSpaceHTML = spaceHTML;

        var documentsQueriesHTML = document.createElement('div');
        documentsQueriesHTML.className = "all-document-queries dockingPanelScroll";
        this.documentsQueriesHTML = documentsQueriesHTML;

        this.container.appendChild(searchDiv);
        this.container.appendChild(spaceHTML);
        this.container.appendChild(documentsQueriesHTML);
        this.setAllocationLabelText = setAllocationLabelTextfn;
    }


    /**
     * InViewerSearchSettingsPanel.prototype.getAllQueries -
     * Gets all the user queries from the qs service.
     * Updates the userData and documentQueries objects and the UI
     *
     * @param  {function} successCb - function to call after success
     * @param  {function} errorCb   - function to call after error
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.getAllQueries = function(successCb, errorCb) {
        var self = this;
        this.qsApiService.getUserQueries(this.profileId, null, function(err, data) {
            if (err) {
                errorCb(err, data);
            } else {
                self.userData = data.userData;
                self.documentQueries = data.documentQueries;
                self.showUserSpace(data.userData);
                self.showAllQueries(data.documentQueries);
                self.toggleLoadingMessage(false);
                successCb(data);
            }
        });
    }


    /**
     * InViewerSearchSettingsPanel.prototype.initializeQueries -
     * Gets the queries and initializes the UI
     *
     * @return {type}  description
     */
    viewerSearchNameSpace.InViewerSearchSettingsPanel.prototype.initializeQueries = function() {
        var self = this;
        self.toggleLoadingMessage(true);
        this.getAllQueries(function(data) {}, function(err, message) {
            self.toggleLoadingMessage(false);
            self.toggleMessage(av.i18n.translate("Error getting queries, please close and retry"), true, false);
        });

        self.resizeToContent();
    }

    avu.InViewerSearchSettingsPanel = viewerSearchNameSpace.InViewerSearchSettingsPanel;

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    /**
     * @typedef GeometriesSearchResultType
     * @property {string} id - Geometry id
     * @property {string} name - Geometry Name
     * @property {SearchResultType[]} results - search results for the geometry
     * @property {boolean} moreResults - true is there are more results
     */

    /**
     * @typedef SearchResultType
     * @property {string} dbId - geometry node dbId
     * @property {string} fieldName - property field name
     * @property {string} fieldValue - property field value
     * @property {string} nodeName - geometry node name
     */

    /**
     * @typedef GeometriesSearchResultsType
     * @property {number} page - page number
     * @property {GeometriesSearchResultType[]} results - result list
     * @property {number} resultCount - the total amount of results
     * @property {string} error - Error message.
     */

    var av = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    var _this;

    /**
     * InViewerSearchThisItem
     */
    viewerSearchNameSpace.InViewerSearchThisItem = function(viewer, options, cache) {
        _this = this;
        this.viewer = viewer;
        this.options = options;
        this.container = null;
        this.initialized = false;
        this.controller = null;
        this.qsApi = null;
        this.searchString = null;
        this.geoPages = {};
        this.currentGeometry = null;
        this.limit = options.relatedItemsTab.pageSize;
        this.clicked = null;
        this.cacheObj = cache;

        this.loading = null;
        this.stillLoadingAlertElemId = 'this-item-loading-alert';
        this.stillLoadingAlertElem = null;
        this.geometriesContainer = {};
        this.resultCountDom = null;
        this.currentGeoSearchedIds = [];
        this.selectedNode = null;
        this.selectedNodeId = null;
        this.highlightNodeInViewer = null;
        this.enabled = true;
        this.isNodeVisible = null;
        this.currentGeomResults = [];
        this.listeners = [];
    };

    viewerSearchNameSpace.InViewerSearchThisItem.prototype.constructor = viewerSearchNameSpace.InViewerSearchThisItem;

    /**
     * InViewerSearchThisItem.initialize - initialize the geometries/properties and all the needed information
     *
     * @param  {type} qsApi            - QsApiService
     * @param  {type} viewerProperties - ViewerPropertiesService instance
     * @param  {type} currentGeometry  - geometry id loaded in the viewer
     * @param  {type} container      - html element
     * @param  {type} highlightNodeInViewer      - helper to highlight nodes in the viewer
     * @param  {type} isNodeVisiblefn - helper to check if a node is visible in the loaded model
     * @param  {type} cb         - callback function
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.initialize = function(qsApi, viewerProperties, currentGeometry, container, highlightNodeInViewer, isNodeVisiblefn, cb) {
        var self = this;
        this.qsApi = qsApi;
        this.highlightNodeInViewer = highlightNodeInViewer;
        this.currentGeometry = currentGeometry;
        this.isNodeVisible = isNodeVisiblefn;

        if (this.options.uiEnabled) {
            this.container = container;
            this.container.addEventListener('click', this.clickHandler);
            this.container.addEventListener('dblclick', this.clickHandler);
        }

        this.controller = new Controller(viewerProperties, qsApi, this.options.loadedModelTab.enabled);
        this.controller.initialize(function() { // TODO(jwo): Should initialize() be part of the constructor, or is there a case to create and not initalize?
            self.initialized = true;
            cb();
            if (self.listeners && self.listeners.length) {
                self.listeners.forEach(function(listener) {
                    listener();
                });
                self.listeners = [];
            }
        });
    };

    /**
     * Uninitialize
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.uninitialize = function() {

        if (this.options.uiEnabled) {
            this.container.removeEventListener('click', this.clickHandler);
        }

        if (this.controller) {
            this.controller = null;
        }
    };

    var fnHandleClicks = function(event) {
        var node = event.target;
        var found = false;
        var searchGeoGuid, searchDbId, searchIndex;

        if (!_this.enabled) {
            return;
        }
        while (node && this.container !== node && !found) {
            found = node.hasAttribute('adskSearchDbId');
            if (!found) {
                node = node.parentNode;
            }
        }

        if (found) {
            searchGeoGuid = node.getAttribute('adskSearchGeoGuid');
            searchDbId = parseInt(node.getAttribute('adskSearchDbId'), 10);
            searchIndex = parseInt(node.getAttribute('adskSearchIndex'), 10);

            if (event.type === 'click') {
                if (_this.currentGeometry === searchGeoGuid) {
                    setTimeout(function() {
                        _this.qsApi.logResultClickEvent(searchIndex + 1, searchDbId, true, 'thisItem');
                        _this.selectNode(node, searchDbId);
                    },0);

                } else {
                    _this.loadGeometryInViewer(searchGeoGuid, searchDbId, searchIndex, node);
                }
            } else if (event.type === 'dblclick') {
                if (_this.currentGeometry === searchGeoGuid) {
                    setTimeout(function() {
                        _this.selectNode(node, searchDbId);
                        _this.viewer.fitToView();
                    }, 0);

                }
            } else if (event.type === 'hover') {
                //_this.viewer.impl.rolloverObjectNode(searchDbId);
            }
        }
    };

    viewerSearchNameSpace.InViewerSearchThisItem.prototype.clickHandler = function(event) {
        if (!event) {
            return;
        }
        // Working around both click and dblClick events arriving (SRCH-1169)
        if (_this.mouseClickTimeout) {
            clearTimeout(_this.mouseClickTimeout);
            _this.mouseClickTimeout = null;
        }

        _this.mouseClickTimeout = setTimeout(function() {
            fnHandleClicks.call(_this, event);
        }, 200);
    };

    viewerSearchNameSpace.InViewerSearchThisItem.prototype.selectNode = function(node, dbId) {
        if (this.selectedNode) {
            this.selectedNode.classList.remove("selected");
            this.selectedNode = null;
        }

        if (this.selectedNodeId === dbId) {
            //deselect
            this.selectedNodeId = null;
            this.selectedNode = null;
        } else {
            //select
            this.selectedNodeId = dbId;
            this.selectedNode = node;
            node.classList.add("selected");
        }

        this.highlightNodeInViewer(this.selectedNodeId, this.currentGeoSearchedIds, this.selectedNodeId, false);
    };


    /**
     * [UI ENABLED] shows/hides the loading message
     *
     * @param  {boolean} loading  - if true shows loading else it hides it
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.toggleLoadingMessage = function(loading) {
        var loadingElementDOM = this.loading;
        var spanDOM;

        if (loading && !loadingElementDOM) {
            loadingElementDOM = document.createElement('div');
            loadingElementDOM.className = 'loading this-item-loading';
            spanDOM = document.createElement('span');
            spanDOM.textContent = av.i18n.translate('Loading');
            loadingElementDOM.appendChild(spanDOM);

            this.container.appendChild(loadingElementDOM);
            this.loading = loadingElementDOM;

        } else if (!loading && loadingElementDOM) {
            if (loadingElementDOM.parentNode) {
                loadingElementDOM.parentNode.removeChild(loadingElementDOM);
            }
            this.loading = null;
        }
    };


    /**
     * @private
     * copy the results for the API results and returns the first page. Save the copy results
     * to future page results.
     */
    function copyAPIResultAndReturnFirstPage(self) {
        var resultsCopied = [];
        var firstPage = [];
        var pageCount = 0;
        var ctrl = self.controller;

        ctrl.resultCollection.getResultSetArray().forEach(function(res, index) {
            var resultsForGeometry = [];
            var firstPageResults = [];
            pageCount = 0;

            res.forEach(function(i) {
                var item = {
                    dbId: i.dbId,
                    fieldName: i.fieldName,
                    fieldValue: i.fieldValue,
                    nodeName: i.nodeName
                };
                resultsForGeometry.push(item);
                if (pageCount < self.limit) {
                    firstPageResults.push(item);
                    pageCount ++;
                }
            });
            var geometry = ctrl.resultCollection.getMetaInfo(index);
            resultsCopied.push({
                id: geometry.guid,
                name: geometry.name,
                results: resultsForGeometry,
                moreResults: res.length > self.limit
            });

            firstPage.push({
                id: geometry.guid,
                name: geometry.name,
                results: firstPageResults,
                moreResults: resultsForGeometry.length > self.limit
            });
        });

        self.resultsCopy = resultsCopied;

        var results = {
            page: 1,
            results: firstPage,
            resultCount: ctrl.resultCollection.getResultCount()
        };

        return results;
    }

    /**
     * Searches into the property values of all geometries
     *
     * @param  {string} query - string to search
     * @param  {function} cb  - this func will be called with the results: function(GeometriesSearchResultsType)
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.search = function(query, cb) {
        var self = this;
        var ctrl = self.controller;
        var queryTrimmed = query.trim();

        if (!this.initialized) {
            var listener = function() {
                self.search(query, cb);
            };
            this.listeners.push(listener);
            return;
        }

        this.clearSearch();

        if (queryTrimmed) {
            this.searchString = queryTrimmed;

            if (this.options.uiEnabled) {
                this.toggleLoadingMessage(true);
            }

            this.controller.doSearch(queryTrimmed, function(resultCollection, areAllGeometriesLoaded, ended, guid) {

                if (self.options.uiEnabled) {
                    self.showResults(queryTrimmed, resultCollection, areAllGeometriesLoaded, guid);
                } else if (ended) {
                    var results = copyAPIResultAndReturnFirstPage(self);
                    cb(results);
                }
            });
        }
    };

    /**
     * [UI ENABLED] loads the geometry in the viewer and triggers the search after viewer loaded.
     *
     * @param  {type} guid     - geometry id
     * @param  {type} dbId     - geometry node dbId
     * @param  {type} position - the position of the result selected
     * @param  {type} node - ???
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.loadGeometryInViewer = function(guid, dbId, position, node) {
        var data = this.cacheObj;
        var ctrl = this.controller;
        var geo = ctrl.viewerProperties.getGeometry(guid);
        var item = geo ? geo.data : {
            guid: guid
        };

        if (this.selectedNode) {
            this.selectedNode.classList.remove("selected");
        }

        this.selectedNode = node;
        this.selectedNodeId = dbId;

        this.viewer.getPropertyPanel().setVisible(false);

        this.qsApi.logResultClickEvent(position + 1, dbId, false, 'thisItem');
        data.searchInfoThisItem = {
            node: dbId,
            str: this.searchString
        };

        var onErrorCb = function() {
            avp.logger.error('Error loading geometry');
        };

        var onSuccessCb = function() {
            avp.logger.log('success loading geometry');
        };
        this.enabled = false;
        this.viewer.dispatchEvent({
            type: av.LOAD_GEOMETRY_EVENT,
            data: {
                item: item,
                onSuccessCb: onSuccessCb,
                onErrorCb: onErrorCb
            }
        });
    };

    /**
     * [UI ENABLED]shows/hides the results for the geometry
     *
     * @param  {type} event - click event
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.toggleGeometry = function(event) {

        if (event.target.parentElement.className.indexOf('collapsed') === -1) {
            event.target.parentElement.classList.add('collapsed');
        } else {
            event.target.parentElement.classList.remove('collapsed');
        }
    };

    /**
     * @private
     * [UI ENABLED] creates a display name for the result
     *
     * @param  {Object} result - result being processed
     * @param  {Object} ctrl - ponter to the control class
     * @return  {string} - display name of the result
     */
    function getDisplayName(self, result, ctrl, guid) {
        var displayName,
            name,
            itemValue;

        if (!result.displayName) {
            name = result.nodeName;
            if (!name && self.currentGeometry === guid) {
                var data = self.viewer.model.getData();
                if (data && data.instanceTree) {
                    name = data.instanceTree.getNodeName(result.dbId);
                }
            }
            if (!name) {
                name = ctrl.viewerProperties.defaultNodeName();
            }

            if (name.indexOf(ctrl.searchedString) >= 0 || (result.hasOwnProperty('fieldName') && result.fieldName === "Name")) {
                displayName = ctrl.viewerProperties.highlightText(name, ctrl.searchedString);
            } else {
                itemValue = (Object.prototype.toString.call(result.fieldValue) === '[object Number]' ? String(result.fieldValue) : result.fieldValue);
                displayName = ctrl.viewerProperties.highlightText(name) + ' (' + ctrl.viewerProperties.highlightText(result.fieldName) + ': ' + ctrl.viewerProperties.highlightText(itemValue, ctrl.searchedString) + ')';
            }
        } else {
            displayName = result.displayName;
        }

        return displayName;
    }

    /**
     * @private
     * [UI ENABLED] add a result to result list DOM
     *
     * @param  {type} self - self
     * @param  {type} resultList - result list DOM to append the result to
     * @param  {type} result - result to be added to the result list
     * @param  {type} index - index of the result in the result list
     * @param  {type} guid - geometry ID that the result belongs to
     */
    function addItemResult(self, resultList, result, index, guid) {
        var itemDom = document.createElement('li');
        var ctrl = self.controller;
        var displayName;

        displayName = getDisplayName(self, result, ctrl, guid);

        if (self.currentGeometry === guid && result.dbId === self.selectedNodeId) {
            self.selectedNode = itemDom;
        }

        itemDom.className = 'item-result dbId_' + result.dbId;
        itemDom.innerHTML = displayName; // TODO(jwo): Switch to using the SDK's highlighter
        itemDom.setAttribute('adskSearchGeoGuid', guid); // TODO(jwo): Move these directly to JS props instead of HTML attributes
        itemDom.setAttribute('adskSearchDbId', result.dbId);
        itemDom.setAttribute('adskSearchIndex', index);
        resultList.appendChild(itemDom);
    }

    /**
     * @private
     * [UI ENABLED] ???
     *
     * @param  {type} self - self
     * @param  {type} resultList - result list DOM to append the result to
     * @param  {type} guid - geometry ID that the result belongs to
     */
    function addDummyItemResult(self, resultList, guid) {
        var itemDom;
        var moreExist;

        if (resultList && resultList.children.length) {
            moreExist = resultList.lastChild.className.contains('more-items');
            if (!moreExist) {
                itemDom = document.createElement('li');
                itemDom.className = 'item-result more-items';
                itemDom.textContent = av.i18n.translate('Load More');
                itemDom.addEventListener('click', function(event) {
                    self.qsApi.logLoadMoreClickEvent(guid, 'thisItem');
                    self.loadMoreItems(guid, event);
                }, false);

                resultList.appendChild(itemDom);
            }
        }
    }

    /**
     * @private
     * [UI ENABLED] Create and append results under the geometry
     *
     * @param  {type} self - self
     * @param  {type} geometryResults - geometry being added to the result list
     */
    function createResultListDom(self, geometryResults, guid) {
        var resultListDom,
            length,
            countVisible = 0,
            countTotal = 0,
            geoPages = self.geoPages;

        resultListDom = document.createElement('ul');
        resultListDom.className = 'geometry-result-list';

        length = Math.min(geometryResults.length, self.limit);
        geoPages[guid] = length;

        if (guid === self.currentGeometry) {
            var i = 0;
            var ids = {}; //this is because the callback can be called more than once
            countTotal = geometryResults.length;
            geometryResults.forEach(function(geoResult) {
                self.isNodeVisible(geoResult.dbId, function() {
                    if (!ids.hasOwnProperty(geoResult.dbId)) {
                        ids[geoResult.dbId] = 1;
                        countVisible++;
                        self.currentGeomResults.push(geoResult);
                        if (i < length) {
                            self.currentGeoSearchedIds.push(geoResult.dbId);
                            addItemResult(self, resultListDom, geoResult, i, guid);
                            geoPages[guid] = i + 1;
                        }
                        i++;
                    }
                });
            });
        } else {
            geometryResults.slice(0, length).forEach(function(geoResult, i) {
                if (guid === self.currentGeometry) {
                    self.currentGeoSearchedIds.push(geoResult.dbId);
                }
                addItemResult(self, resultListDom, geoResult, i, guid);
            });
        }

        return {resultListDom:resultListDom, countInvisible:countTotal - countVisible};
    }

    /**
     * @private
     * [UI ENABLED] Create the name of the geometry to be represened in HTML
     *
     * @param  {type} self - self
     * @param  {type} geometry - geometry being added to the result list
     * @param  {type} index -
     */
    function createGeomNameDom(self, geometry, index) {
        var geomNameDom;

        geomNameDom = document.createElement('label');
        geomNameDom.className = 'geometry-name';
        geomNameDom.setAttribute('adskGeomId', geometry.guid);
        geomNameDom.setAttribute('adskGeomIndex', index);
        geomNameDom.addEventListener('click', function(event) {
            var geomId = event.currentTarget.getAttribute('adskGeomId');
            var index = parseInt(event.currentTarget.getAttribute('adskGeomIndex'), 10);
            self.qsApi.logResultGeomClickEvent(index + 1, geomId, self.currentGeometry === geomId, 'thisItem');
            self.toggleGeometry(event);
        }, false);
        geomNameDom.textContent = geometry.name;

        return geomNameDom;
    }

    /**
     * @private
     * [UI ENABLED] Create the name of the geometry to be represened in HTML
     *
     * @param  {type} self - self
     * @param  {type} geometry - geometry being added to the result list
     * @param  {type} geometriesCount - ???
     */
    function createGeometryResultDom(self, geometry, geometriesCount) {
        var geometryResultDom;

        geometryResultDom = document.createElement('div');
        geometryResultDom.className = 'geometry-results ' + 'geometry_' + geometry.guid;
        geometryResultDom.className = geometryResultDom.className + ((geometriesCount > 3) ? ' collapsed' : '');
        if (geometry.guid === self.currentGeometry) {
            geometryResultDom.classList.add("hidden");
            geometryResultDom.setAttribute('adskCheckedForVisibleNodes', true);
        }

        return geometryResultDom;
    }

    /**
     * @private
     * [UI ENABLED] Add a category for a geometry to the result list
     *
     * @param  {type} self - self
     * @param  {type} geometriesContainer - container that holds results by geometry
     * @param  {type} geometry - geometry being added to the result list
     * @param  {type} index - index of the geometry in the result list
     * @param  {type} totalNumberOfResults - ???
     */
    function addNewGeometryResults(self, geometriesContainer, geometryResults, geometry, index, totalNumberOfResults) {
        var geometryResultDom, geomNameDom, resultList, resultListDom, countInvisible;
        var ctrl = self.controller;
        var guid = geometry.guid;

        // Create each component
        resultList = createResultListDom(self, geometryResults, guid);
        resultListDom = resultList.resultListDom;
        geomNameDom = createGeomNameDom(self, geometry, index);
        geometryResultDom = createGeometryResultDom(self, geometry, ctrl.geometriesCount);

        // ToDo(fyamaoka): Needs an explanation on this condition
        if (guid === self.currentGeometry && resultListDom.children.length > 0) {
            if (geometryResultDom.className.indexOf("hidden") >= 0) {
                geometryResultDom.classList.remove("hidden");
            }
        }

        // ToDo(fyamaoka): Needs an explanation on this condition
        if (ctrl.bruteSearch && index < ctrl.geometriesCount - 1) {
            geometriesContainer.insertBefore(geometryResultDom, geometriesContainer.childNodes[index]);
        } else {
            geometriesContainer.appendChild(geometryResultDom);
        }

        // Join them together
        geometryResultDom.appendChild(geomNameDom);
        geometryResultDom.appendChild(resultListDom);
        self.geometriesContainer[guid] = geometryResultDom;

        totalNumberOfResults -= resultList.countInvisible;
        return totalNumberOfResults;
    }

    function updateResultCount(totalNumberOfResults, resultCountDom) {
        var term, ctx, strResultText;

        if (resultCountDom) {
            term = resultCountDom.getAttribute('term');
            ctx = resultCountDom.getAttribute('ctx');

            strResultText = av.i18n.translate('Results Count');
            strResultText = strResultText.split('{0}').join(totalNumberOfResults);
            strResultText = strResultText.split('{1}').join(term);
            strResultText = strResultText.split('{2}').join(ctx);

            resultCountDom.textContent = strResultText;
        }
    }

    function createContainersAndList(self, container, str, geometryResults, geometry, totalNumberOfResults, allLoaded, index) {
        var resultCountDom, strResultText, wrapperDom, geometriesContainerDom;
        var guid = geometry.guid;

        container.textContent = ''; // Empty the container

        wrapperDom = document.createElement('div');
        wrapperDom.id = 'result-count-this-item-wrapper';
        wrapperDom.className = 'result-count';

        strResultText = av.i18n.translate('Results Count')
            .split('{0}').join(totalNumberOfResults) // TODO(jwo): write function to apply templates
            .split('{1}').join(str)
            .split('{2}').join(self.options.relatedItemsTab.displayName);

        resultCountDom = document.createElement('span');
        resultCountDom.id = 'result-count-this-item';
        resultCountDom.setAttribute('term', str);
        resultCountDom.setAttribute('ctx', self.options.relatedItemsTab.displayName);
        resultCountDom.textContent = strResultText;

        self.resultCountDom = resultCountDom;
        wrapperDom.appendChild(resultCountDom);
        container.appendChild(wrapperDom);

        geometriesContainerDom = document.createElement('div');
        geometriesContainerDom.className = 'geometries-results-container dockingPanelScroll';

        if (!allLoaded) {
            geometriesContainerDom.className = geometriesContainerDom.className + ' too-many-geometries';
        }

        container.appendChild(geometriesContainerDom);

        var geometryResult, moreResults;
        totalNumberOfResults = addNewGeometryResults(self, geometriesContainerDom, geometryResults, geometry, index, totalNumberOfResults);
        if (self.geoPages[guid] >= self.limit) {
            geometryResult = self.geometriesContainer[guid];
            moreResults = geometryResults.length > self.geoPages[guid];
            if (moreResults) {
                addDummyItemResult(self, geometryResult.children[1], guid);
            }
        }

        self.controller.resultCollection.setResultCount(totalNumberOfResults);
        updateResultCount(totalNumberOfResults, self.resultCountDom);
    }

    function appendResults(self, geometriesContainer, geometryResults, geometry, totalNumberOfResults, ind) {
        var ctrl = self.controller;

        var resultList, length, index, init;
        var geometryResultDom;
        var guid = geometry.guid;


        if (geometryResults && geometryResults.length) {
            if (!self.geometriesContainer.hasOwnProperty(guid)) {
                totalNumberOfResults = addNewGeometryResults(self, geometriesContainer, geometryResults, geometry, ind, totalNumberOfResults);
            } else if (self.geoPages[guid] < self.limit) {
                geometryResultDom = self.geometriesContainer[guid];
                resultList = geometryResultDom.children[1];
                length = geometryResults.length;
                index = self.geoPages[guid];
                init = 0;

                if (index > 0) {
                    init = index;
                }

                if (length > self.limit) {
                    self.geoPages[guid] = self.limit;
                    length = self.limit;
                } else {
                    self.geoPages[guid] = self.geoPages[guid] + (length - index);
                }

                if (guid === self.currentGeometry) {
                    var i = 0;
                    var ids = {}; //this is because the callback can be called more than once
                    geometryResults.forEach(function(result) {
                        totalNumberOfResults--;
                        self.isNodeVisible(result.dbId, function() {
                            if (!ids.hasOwnProperty(result.dbId)) {
                                if (geometryResultDom.className.indexOf("hidden") >= 0) {
                                    geometryResultDom.classList.remove("hidden");
                                }
                                ids[result.dbId] = 1;
                                totalNumberOfResults++;
                                self.currentGeomResults.push(result);
                                if (init <= i && i < length) {
                                    self.currentGeoSearchedIds.push(result.dbId);
                                    addItemResult(self, resultList, result, i, guid);
                                    self.geoPages[guid] = i;
                                }
                                i++;
                            }
                        });
                    });
                } else {
                    geometryResults.slice(init, length).forEach(function(result, i) {
                        addItemResult(self, resultList, result, i, guid);
                    });
                }
            }

            if (self.geoPages[guid] >= self.limit) {
                var moreResults = ctrl.resultCollection.getResultSetLength(guid) > self.geoPages[guid];

                if (moreResults) {
                    geometryResultDom = self.geometriesContainer[guid];
                    addDummyItemResult(self, geometryResultDom.children[1], guid);
                }
            }
        }
        self.controller.resultCollection.setResultCount(totalNumberOfResults);
        updateResultCount(totalNumberOfResults, self.resultCountDom);
    }

    /**
     * @private
     * [UI ENABLED] Display a no result page
     *
     * @param  {Object} container   - result list
     * @param  {string} str         - query string
     * @param  {string} contextName - name of the context
     */
    function showNoResults(container, str, contextName) {
        container.innerHTML = '';

        var noResultsDom = document.createElement('p');
        noResultsDom.className = 'no-results-this-item';

        noResultsDom.textContent = av.i18n.translate('No Results')
            .split('{0}').join(str)
            .split('{1}').join(contextName);

        container.appendChild(noResultsDom);
    }

    /**
     * [UI ENABLED] show the results in the UI
     *
     * @param  {string} str                     - query string
     * @param  {Object} resultCollection        - result list
     * @param  {boolean} areAllGeometriesLoaded - indicates whether all geometries have been searched
     * @param  {string} guid                    - id of the geometry searched
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.showResults = function(str, resultCollection, areAllGeometriesLoaded, guid) {
        var ctrl = this.controller;
        var _this = this;
        var index;
        var container = _this.container;
        var append = (container.children.length > 1);
        var stillLoadingAlertDom = this.stillLoadingAlertElem;
        var totalNumberOfResults;
        var orderedGem;
        var geometriesContainer = null;
        var gemResults;

        if (resultCollection && resultCollection.getResultSetArrayLength()) {
            orderedGem = ctrl.viewerProperties.getSortedGeometries();

            ctrl.viewerProperties.prepHighlighter(str);

            _this.toggleLoadingMessage(false);
            orderedGem.forEach(function(geometry) {
                index = resultCollection.getResultSetIndex(geometry.guid);
                if (index >= 0) {
                    totalNumberOfResults = ctrl.resultCollection.getResultCount();
                    gemResults = resultCollection.getResultSet(index);
                    if (!append) {
                        createContainersAndList(_this, container, str, gemResults, geometry, totalNumberOfResults, areAllGeometriesLoaded, index, ctrl.bruteSearch);
                        append = true;
                    } else {
                        geometriesContainer = container.children[1];
                        appendResults(_this, geometriesContainer, gemResults, geometry, totalNumberOfResults, index, ctrl.bruteSearch);
                    }
                }
            });
        } else if (ctrl.searchInItemEnded) {
            _this.toggleLoadingMessage(false);
            showNoResults(container, str, _this.options.relatedItemsTab.displayName);
        }

        if (!areAllGeometriesLoaded && ctrl.searchInItemEnded && !stillLoadingAlertDom) {

            stillLoadingAlertDom = document.createElement('div');
            stillLoadingAlertDom.id = _this.stillLoadingAlertElemId;
            stillLoadingAlertDom.className = 'alert-geometries-loading';

            stillLoadingAlertDom.textContent = av.i18n.translate('Geometries Loading');
            this.stillLoadingAlertElem = stillLoadingAlertDom;
            container.appendChild(stillLoadingAlertDom);
        }
    };

    /**
     * sets the search related data empty
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.clearSearch = function() {

        if (this.container && this.options.uiEnabled) {
            this.container.innerHTML = '';
            this.geometriesContainer = {};
            this.stillLoadingAlertElem = null;
            this.resultCountDom = null;
            this.currentGeoSearchedIds = [];
        }

        this.geoPages = {};
        this.currentGeomResults = [];
        this.toggleLoadingMessage(false);
    };

    /**
     * Gets the corresponding page of results for the geometry.
     * If no pageNumber it will return next page from the last offset saved (UI)
     *
     * @param  {type} geometryId - geometry id
     * @param  {type} pageNumber - page to return
     * @param  {function} cb - this will be called with the results: function(GeometriesSearchResultsType)
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.getPage = function(geometryId, pageNumber, cb) {
        var geometry, resultsForGeometry, resToAdd, pageItems, results, page;
        var ctrl = this.controller;
        var self = this;
        if (!this.initialized) {
            var listener = function() {
                self.getPage(geometryId, pageNumber, cb);
            };
            this.listeners.push(listener);
            return;
        }

        if (pageNumber < 1) {
            results = {
                message: "Invalid page number, it must be a positive number."
            };
            
            cb(results);
            return;
        }

        var pageoffset = self.limit * (pageNumber - 1);

        pageItems = {
            id: '',
            name: '',
            results: [],
            moreResults: false
        };

        if (geometryId) {
            geometry = self.resultsCopy[ctrl.resultCollection.getResultSetIndex(geometryId)];

            if (!geometry) {
                results = {
                    page: pageNumber,
                    results: [],
                    message:"The geometry " + geometryId + " doesn't exists."
                };
                cb(results);
                return;
            }

            resultsForGeometry = geometry.results;
            resToAdd = resultsForGeometry.slice(pageoffset, pageoffset + self.limit);

            pageItems = {
                id: geometry.guid,
                name: geometry.name,
                results: resToAdd,
                moreResults: resultsForGeometry.length > (pageoffset + self.limit)
            };

            results = {
                page: pageNumber,
                results: [pageItems],
                resultCount: ctrl.resultCollection.getResultCount()
            };

        } else {
            page = self.resultsCopy.map(function(g) {
                var result = {
                    id: g.id,
                    name: g.name,
                    results: g.results.slice(pageoffset, pageoffset + self.limit),
                    moreResults: g.results.length > (pageoffset + self.limit)
                };

                return result;
            });

            results = {
                page: pageNumber,
                results: page,
                resultCount: ctrl.resultCollection.getResultCount()
            };
        }

        cb(results);
        return;
    };

    /**
     * [UI ENABLED] load more results to the geometry result list
     *
     * @param  {type} guid  - geometry id
     * @param  {type} event - click event
     */
    viewerSearchNameSpace.InViewerSearchThisItem.prototype.loadMoreItems = function(guid, event) {
        var resultsForGeometry, resToAdd, geometryResultDom, resultList, moreItems;
        var ctrl = this.controller;
        var self = this;
        var pageoffset = self.geoPages[guid];
        var index = pageoffset;

        resultsForGeometry = ctrl.resultCollection.getResultSet(guid);
        if (guid === this.currentGeometry) {
            resultsForGeometry = self.currentGeomResults;
        }
        resToAdd = resultsForGeometry.slice(pageoffset, pageoffset + self.limit);

        self.geoPages[guid] = self.geoPages[guid] + self.limit;

        geometryResultDom = this.geometriesContainer[guid];
        resultList = geometryResultDom.children[1];
        event.target.parentNode.removeChild(event.target);

        moreItems = resultsForGeometry.length > self.geoPages[guid];

        resToAdd.forEach(function(res) {
            self.currentGeoSearchedIds.push(res.dbId);
            addItemResult(self, resultList, res, index, guid);
            index++;
        });

        if (moreItems) {
            addDummyItemResult(self, resultList, guid);
        }

        if (resToAdd.length) {
            self.highlightNodeInViewer(self.selectedNodeId, self.currentGeoSearchedIds, self.selectedNodeId, false);
        }
    };

    viewerSearchNameSpace.InViewerSearchThisItem.prototype.updateCurrentGeometry = function(newCurrentGuid) {
        var ctrl = this.controller;
        var self = this;
        this.currentGeometry = newCurrentGuid;
        var dbId = this.selectedNodeId;
        this.geoPages[this.currentGeometry] = 0;

        var geometryResults = ctrl.resultCollection.getResultSet(this.currentGeometry);
        var count = ctrl.resultCollection.getResultCount();
        this.currentGeomResults = [];
        this.currentGeoSearchedIds = [];
        var ids = {};
        var i = 0;

        var geometryResultDom = this.geometriesContainer[this.currentGeometry];
        var checkForVisibleNodes = !geometryResultDom.hasAttribute('adskCheckedForVisibleNodes');
        if (geometryResultDom && checkForVisibleNodes) {
            var resultList = geometryResultDom.children[1];
            resultList.innerHTML = "";
            if (geometryResults && geometryResults.length) {
                geometryResults.forEach(function(result) {
                    count--;
                    self.isNodeVisible(result.dbId, function() {
                        if (!ids.hasOwnProperty(result.dbId)) {
                            ids[result.dbId] = 1;
                            count++;
                            self.currentGeomResults.push(result);
                            if (i < self.limit) {
                                self.currentGeoSearchedIds.push(result.dbId);
                                addItemResult(self, resultList, result, i, self.currentGeometry);
                                self.geoPages[self.currentGeometry] = i;
                            }
                            i++;
                        }
                    });
                });
            }

            if (!self.currentGeomResults.length) {
                geometryResultDom.classList.add("hidden");
            }
            geometryResultDom.setAttribute('adskCheckedForVisibleNodes', true);
            avp.logger.log("count " + count);
            ctrl.resultCollection.setResultCount(count);
            updateResultCount(count, self.resultCountDom);

            var moreItems = self.currentGeomResults.length > self.limit;

            if (moreItems) {
                addDummyItemResult(self, resultList, this.currentGeometry);
            }

            this.selectedNodeId = null;
            this.selectNode(this.selectedNode, dbId);
            this.enabled = true;
        } else {
            this.selectedNodeId = null;
            this.selectNode(this.selectedNode, dbId);
            this.enabled = true;
        }
        this.cacheObj.searchInfoThisItem = null;
    };

    function Controller(viewerProperties, qsApi, thisViewEnabled) {
        var ctrl = this;
        var initStart = null;
        var startBrute = null;

        /**
         *the Key is the geometry Id and save the geometry data and the names for the geometry nodes (if exists)
         * @type {Map[string, {data: object, viewerObjects: Map[string, object]}]}
         */
        ctrl.initialized = false;
        ctrl.searchInItemEnded = false;
        ctrl.isBigModel = false;
        ctrl.bigAmountGeometries = false;
        ctrl.viewerProperties = viewerProperties;
        ctrl.searchedString = "";
        ctrl.lastSearchedString = "";
        ctrl.geometriesCount = 0;
        ctrl.bruteSearch = false;
        ctrl.resultCollection = new ResultCollection();

        /**
         * once all components are initialized
         */
        function ready() {
            var time = new Date().getTime() - initStart;
            avp.logger.log('Execution time INIT: ' + time);
            qsApi.logTimeEvent("initTime", time, 'thisItem');
            ctrl.initialized = true;
        }

        /**
         * if the geometries are not big, it gets the attributes for each geometry and calls ctrl.viewerProperties to initialize it.
         * if are big just ends
         * @param geometries
         * @param cb
         */
        ctrl.initializeAttributes = function(geometries, cb) {
            ctrl.initialized = false;

            if (!ctrl.isBigModel) {
                avp.logger.log("Using Fullproof in This Item");
                ctrl.viewerProperties.getGeometriesAttributes(function() {
                    ready();
                    cb();
                });
            } else {
                avp.logger.log("Using Brute Force in This Item");
                ready();
                cb();
            }
        };

        /**
         * Initialize the ctrl.viewerProperties and get the properties/attributes for the geometries.
         */
        ctrl.initialize = function(cb) {
            initStart = new Date().getTime();

            var databaseCreated = function(geometries, ended, bigAmountGeometries) {
                ctrl.loadingGeom = geometries;
                ctrl.bigAmountGeometries = bigAmountGeometries;
                ctrl.isBigModel = ctrl.viewerProperties.hasTooManyNodes();

                if (ctrl.viewerProperties.getTotalCountGeometries() === 1) {
                    ready();
                    cb();
                    return;
                }
                if (ended) {
                    ctrl.initializeAttributes(geometries, function() {
                        if (!bigAmountGeometries) {
                            cb();
                        }
                    });
                }

                //if there are a lot of geometries I let them load in the background instead of waiting
                if (bigAmountGeometries) {
                    cb();
                }
            };

            ctrl.viewerProperties.initPropertyDatabases(!thisViewEnabled, databaseCreated);

        };

        /**
         * when the geometries are big we just call to bruteSearch and transform the results
         *
         * @param str
         * @param callback
         */
        function bruteSearch(str, callback) {
            // The callback can be wrapped to catch the ending, or the starting time can be moved to calling function.
            // This removes the need for global-ish variables for timers, and allows for multiple running timers.
            startBrute = new Date().getTime();
            var allLoaded = ctrl.viewerProperties.areAllGeometriesLoaded();
            ctrl.viewerProperties.bruteSearch(str, function(str, resultCollection, ended, guid) {
                var geomResults,
                    metaInfo,
                    partialResultCollection,
                    index;

                if (ctrl.lastSearchedString === str) {
                    ctrl.resultCollection.setResultSetArray(resultCollection);
                    ctrl.searchInItemEnded = ended;
                    ctrl.searchedString = str;
                    ctrl.geometriesCount++;
                    ctrl.bruteSearch = true;
                    partialResultCollection = new ResultCollection();

                    // ToDo(fyamaoka): Checking the condition of "bruteSearch", but it is a function. Was this suppposed to be "ctrl.bruteSearch"
                    // But if so, the variable is set right above to be always true. Why did this need to be checked?
                    if (bruteSearch && ended) {
                        qsApi.logSearchResponseTime('bruteSearchTime', str, (new Date().getTime() - startBrute), 'thisItem');
                        qsApi.logSearchResults(ctrl.resultCollection.getResultCount(), str, 'bruteSearch', 'thisItem');
                    }

                    if (guid) {
                        index = resultCollection.getResultSetIndex(guid);
                        geomResults = resultCollection.getResultSet(index);
                        metaInfo = resultCollection.getMetaInfo(index);
                        if (geomResults) {
                            partialResultCollection.setResultSet(metaInfo, geomResults);
                        }

                        callback(partialResultCollection, allLoaded, ended, guid);
                    } else {
                        callback(resultCollection, allLoaded, ended, guid);
                    }
                }
            });
        }

        /**
         * if the geometries are big it performs a bruteSearch
         * if not calls ctrl.viewerProperties search
         *
         * @param str
         * @param cb - callback
         */
        ctrl.doSearch = function(str, cb) {
            ctrl.resultCollection.resetResultCollection();
            ctrl.searchInItemEnded = false;
            ctrl.lastSearchedString = str;
            ctrl.geometriesCount = 0;
            ctrl.bruteSearch = false;

            ctrl.isBigModel = ctrl.viewerProperties.hasTooManyNodes();
            if (ctrl.isBigModel || !ctrl.initialized) {
                avp.logger.log("Using Brute Force in This Item");
                bruteSearch(str, cb);
            } else {
                avp.logger.log("Using Fullproof in This Item");
                var start = +new Date();
                var allLoaded = ctrl.viewerProperties.areAllGeometriesLoaded();
                ctrl.viewerProperties.doSearch(str, function(str, resultCollection, ended) {
                    //checking that the result is not old
                    if (ctrl.lastSearchedString === str) {
                        ctrl.resultCollection.copyResultCollection(resultCollection);
                        ctrl.searchInItemEnded = ended;
                        ctrl.searchedString = str;
                        ctrl.geometriesCount = resultCollection.getResultSetArrayLength();

                        if (ended) {
                            qsApi.logSearchResponseTime('searchTime', str, (new Date() - start), 'thisItem');
                            qsApi.logSearchResults(ctrl.resultCollection.getResultCount(), str, 'fullproof-StringSearch', 'thisItem');
                        }

                        cb(resultCollection, allLoaded, ended);
                    }
                });
            }
        };
    }
})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    var ITEM_OFFSET = 70;

    /* CONSTANTS*/
    var MESSAGE_FEATURE_NOT_CONFIGURED = 'This feature has not been configured.';

    /**
     * @typedef CategoryResultType
     * @property {string} name - item name
     * @property {string} url - item url
     * @property {function} logClick - function to log click on the result
     */

    /**
     * @typedef CategoryDataType
     * @property {string} name - item name
     * @property {number} modifier - query id
     */

    /**
     * @typedef categoriesResultsType
     * @property {string} name - category name
     * @property {number} modifier - query id
     * @property {boolean} moreItems - true if there are more results
     * @property {CategoryResultType[]} categoryResults - search results for the category
     */

    /**
     * @typedef CategoriesSearchResultsType
     * @property {number} page - page number
     * @property {categoriesResultsType[]} results - result list
     * @property {number} resultCount - the total amount of results
     * @property {string} error - Error message.
     */


    /**
     * InViewerSearchThisProject
     */
    viewerSearchNameSpace.InViewerSearchThisProject = function(options) {

        this.options = options;
        this.initialized = false;
        this.controller = null;
        this.qsApi = null;

        this.container = null;
        this.contextMenu = null;
        this.urlCb = null;
        this.loadingId = 'this-project-loading';
        this.listeners = [];
        this.searchParams = null;
        if (options && options.serverSearchTab && options.serverSearchTab.parameters) {
            this.searchParams = options.serverSearchTab.parameters;
        }

        this.loadingElementDom = null;
        self.categoriesContainerDom = null;
    };

    viewerSearchNameSpace.InViewerSearchThisProject.prototype.constructor = viewerSearchNameSpace.InViewerSearchThisProject;

    /**
     * Initialize this project logic
     *
     * @param  {QsApiService} qsApi       - QsApiService initialized
     * @param  {string} container - html container of this project html
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.initialize = function(qsApi, container) {
        var self = this;
        var initStart = +new Date();

        this.qsApi = qsApi;
        if (!self.options || !self.options.serverSearchTab || !self.searchParams) {
            avp.logger.warn('Error initializing server search tab: missing options.');
            return;
        }

        this.urlCb = self.searchParams.urlCallback;
        this.baseURL = (self.searchParams.baseURL ? self.searchParams.baseURL.replace(/\/$/g, '') : '');
        this.fallbackURL = self.searchParams.fallbackURL;
        this.controller = new Controller(qsApi);

        if (this.options.uiEnabled) {
            this.container = container;

            window.addEventListener('click', function() {
                if (self.contextMenu) {
                    self.contextMenu.classList.add('hidden');
                }
            }, false);
        }

        qsApi.logTimeEvent("initTime", (new Date() - initStart), 'thisProject');
        this.initialized = true;
        if (this.listeners && this.listeners.length) {
            this.listeners.forEach(function(listener) {
                listener();
            });
            this.listeners = [];
        }
    };

    viewerSearchNameSpace.InViewerSearchThisProject.prototype.uninitialize = function() {
        if (this.controller) {
            this.controller.uninitialize();
        }
    };

    // FIXME(jwo): This function has both callbacks & a normal non-async return path. why?
    // -- this is not an asyn js callback, it's a sync cb that performs the url resolution if needed
    function createURL(fallbackURL, baseURL, item, urlCb) {
        var url = fallbackURL;
        var reFullUrl = /^https?:\/\//i;
        try {
            if (urlCb) {
                url = urlCb(item);
            } else if (item.url) {
                if (item.url.search(reFullUrl) === 0) {
                    url = item.url;
                } else {
                    url = baseURL + "/" + item.url;
                    url = url.replace(/([^:]\/)\/+/g, '$1');
                }
            }
        } catch (e) {
            url = null;
        }

        return url || fallbackURL;
    }

    /**
     * [UI ENABLED] opens the context menu for the result clicked
     *
     * @param  {object} event - click event (user clicked on a result)
     * @param  {object} item  description
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.openMenu = function(event, item) {
        var anotherWindowOptionDom, thisWindowOptionDom, left;
        var menuDom = this.contextMenu;
        var url = createURL(this.fallbackURL, this.baseURL, item, this.urlCb);
        var containerDom = this.container;
        var offset = containerDom.getBoundingClientRect();

        item.logClick();
        event.stopPropagation();
        menuDom.textContent = ''; // Empty menuDom

        if (url) {
            anotherWindowOptionDom = document.createElement('div');
            anotherWindowOptionDom.className = 'menu-item open-another-window';
            // FIXME(jwo): Remove .innerHTML by building dom elements instead + .textContent
            anotherWindowOptionDom.innerHTML = '<a href=\'' + url + '\' target=\'_blank\'>' + av.i18n.translate('Open Another Window') + '</a>';

            thisWindowOptionDom = document.createElement('div');
            thisWindowOptionDom.className = 'menu-item open-this-window';
            // FIXME(jwo): Remove .innerHTML by building dom elements instead + .textContent
            thisWindowOptionDom.innerHTML = '<a href=\'' + url + '\' target=\'_self\'>' + av.i18n.translate('Open This Window') + '</a>';
            menuDom.appendChild(anotherWindowOptionDom);
            menuDom.appendChild(thisWindowOptionDom);

            left = event.pageX - offset.left + event.currentTarget.offsetLeft - 10;
            if (left > 195) {
                left = left - 145;
            }
            menuDom.style.top = (event.pageY - 7) + 'px';
            menuDom.style.left = left + 'px';

            menuDom.className = menuDom.className.replace(' hidden', '');
        } else {
            avp.logger.warn('The url for ' + item.name + ' is empty');
        }
    };

    /**
     * [UI ENABLED] shows/hides search results for the category
     *
     * @param  {object} event - click event (user clicked on a category name)
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.toggleCategory = function(event) {
        var expanded = (event.target.parentElement.className.indexOf('collapsed') === -1);

        if (expanded) {
            event.target.parentElement.classList.add('collapsed');
        } else {
            event.target.parentElement.classList.remove('collapsed');
        }
    };

    /**
     * [UI ENABLED] shows/hides loading message
     *
     * @param  {boolean} loading - if true shows else hides
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.toggleLoadingMessage = function(loading) {
        var loadingElementDom = this.loadingElementDom;

        if (loading && !loadingElementDom) {
            loadingElementDom = document.createElement('div');
            loadingElementDom.id = this.loadingId;
            loadingElementDom.className = 'loading';
            // FIXME(jwo): Replace .innerHTML w/ dom elements + .textContent
            loadingElementDom.innerHTML = '<span>' + av.i18n.translate('Loading') + '</span>';
            this.loadingElementDom = loadingElementDom;
            this.container.appendChild(loadingElementDom);
        } else if (!loading && loadingElementDom) {
            if (loadingElementDom.parentNode) {
                loadingElementDom.parentNode.removeChild(loadingElementDom);
            }
            this.loadingElementDom = null;
        }
    };

    /**
     * [UI ENABLED] returns the next page of results for the category
     *
     * @param  {object} event    - click event
     * @param  {categoriesResultsType} category - category data
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.loadMoreItems = function(event, category) {
        var self = this;
        var ctrl = this.controller;
        var listDom = event.target.parentElement;

        this.toggleLoadingMessage(true);

        ctrl.getMoreResults(this.searchParams.pid, category.name, category.modifier, function(err, newpage, moreItems) {
            var elementScrollDom;

            if (!moreItems) {
                event.target.parentNode.removeChild(event.target);
            }

            self.toggleLoadingMessage(false);

            if (err) {
                // ToDo(fyamaoka): Consider displaying a message at the bottom of the search window
                return;
            }

            newpage.forEach(function(catItem) {
                var itemDom = document.createElement('li');

                itemDom.innerHTML = catItem.name;
                itemDom.className = 'item-result';

                itemDom.addEventListener('click', function(event) {
                    self.openMenu(event, catItem);
                }, false);

                if (moreItems) {
                    listDom.insertBefore(itemDom, listDom.childNodes[(listDom.childElementCount - 1)]);
                } else {
                    listDom.appendChild(itemDom);
                }

            });

            elementScrollDom = this.categoriesContainerDom;
            elementScrollDom.scrollTop = elementScrollDom.scrollTop + ITEM_OFFSET;
        });
    };


    /**
     * Gets the page of results passed as parameter
     *
     * @param  {CategoryDataType} category - category data
     * @param  {number} pageNumber     - page number
     * @param  {function} cb - callback function(CategoriesSearchResultsType)
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.getPage = function(category, pageNumber, cb) {
        var self = this;
        if (!this.initialized) {
            var listener = function() {
                self.getPage(category, pageNumber, cb);
            };
            this.listeners.push(listener);
            return;
        }
        var ctrl = this.controller;
        if (this.options.uiEnabled) {
            this.toggleLoadingMessage(true);
        }

        ctrl.getMoreResults(this.searchParams.pid, category.name, category.modifier, function(err, newpage, moreItems) {

            var moreResults = {
                page: pageNumber,
                results: newpage,
                resultsCount: ctrl.count,
                moreItems: moreItems,
                message: err
            };

            cb(moreResults);
        }, pageNumber);
    };


    function showNoResults(container, str, contextName) {
        var strResultText, noResultsDOM;

        container.textContent = ''; // clear container

        noResultsDOM = document.createElement('p');
        noResultsDOM.className = 'no-results-this-project';

        strResultText = av.i18n.translate('No Results');
        strResultText = strResultText.split('{0}').join(str);
        strResultText = strResultText.split('{1}').join(contextName);

        noResultsDOM.textContent = strResultText;

        container.appendChild(noResultsDOM);
    }

    /**
     * [UI ENABLED] displays the results in the UI
     *
     * @param  {string} str     - string searched
     * @param  {categoriesResultsType[]} results - results search
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.showResults = function(str, results) {
        var wrapperDom, strResultText, resultCountDom, categoriesContainerDom;
        var self = this;
        var container = this.container;
        var ctrl = this.controller;

        this.toggleLoadingMessage(false);
        container.textContent = '';

        self.qsApi.logSearchResults(ctrl.count, str, 'elasticsearch', 'thisProject');
        if (ctrl.count > 0) {
            wrapperDom = document.createElement('div');
            wrapperDom.className = 'result-count';

            strResultText = av.i18n.translate('Results Count');

            strResultText = strResultText.split('{0}').join(ctrl.count);
            strResultText = strResultText.split('{1}').join(str);
            strResultText = strResultText.split('{2}').join(self.options.serverSearchTab.displayName);

            resultCountDom = document.createElement('span');
            resultCountDom.id = 'result-count-this-project';
            resultCountDom.textContent = strResultText;

            wrapperDom.appendChild(resultCountDom);
            container.appendChild(wrapperDom);

            categoriesContainerDom = document.createElement('div');
            categoriesContainerDom.className = 'categories-results-container dockingPanelScroll';
            container.appendChild(categoriesContainerDom);
            self.categoriesContainerDom = categoriesContainerDom;
            self.contextMenu = document.createElement('div');
            self.contextMenu.className = 'context-menu hidden';
            container.appendChild(self.contextMenu);

            results.forEach(function(category, index) {
                var categoryResultDom, categoryNameDom, resultListDom, moreItemDom;

                categoryResultDom = document.createElement('div');
                categoryResultDom.id = 'category_' + category.name;
                categoryResultDom.className = 'category-results';

                categoryNameDom = document.createElement('label');
                categoryNameDom.className = 'category-name';
                categoryNameDom.setAttribute('adskCatId', category.name);
                categoryNameDom.setAttribute('adskCatIndex', index.toString());

                categoryNameDom.addEventListener('click', function(event) {
                    var catId = event.currentTarget.getAttribute('adskCatId');
                    var index = parseInt(event.currentTarget.getAttribute('adskCatIndex'), 10);
                    self.qsApi.logResultGeomClickEvent(index + 1, catId, false, 'thisProject');
                    self.toggleCategory(event);
                }, false);

                categoryNameDom.innerText = category.name;
                categoryResultDom.appendChild(categoryNameDom);

                resultListDom = document.createElement('ul');
                resultListDom.className = 'category-result-list';

                [].slice.call(category.categoryResults).forEach(function(catItem, index) {
                    var itemDom = document.createElement('li');
                    itemDom.className = 'item-result';
                    itemDom.innerHTML = catItem.name;
                    itemDom.setAttribute('adskItemId', catItem.url);
                    itemDom.setAttribute('adskItemIndex', index.toString());
                    itemDom.addEventListener('click', function(event) {
                        var itemId = event.currentTarget.getAttribute('adskItemId');
                        var index = parseInt(event.currentTarget.getAttribute('adskItemIndex'), 10);
                        self.qsApi.logResultClickEvent(index + 1, itemId, false, 'thisProject');
                        self.openMenu(event, catItem);
                    }, false);
                    resultListDom.appendChild(itemDom);
                });

                if (category.moreItems) {
                    moreItemDom = document.createElement('li');
                    moreItemDom.className = 'more-items item-result';
                    moreItemDom.textContent = av.i18n.translate('Load More');
                    moreItemDom.addEventListener('click', function(event) {
                        self.qsApi.logLoadMoreClickEvent(category.name, 'thisProject');
                        self.loadMoreItems(event, category);
                    }, false);
                    resultListDom.appendChild(moreItemDom);
                }

                categoryResultDom.appendChild(resultListDom);
                categoriesContainerDom.appendChild(categoryResultDom);
            });
        } else {
            showNoResults(container, str, self.options.serverSearchTab.displayName);
        }
    };

    /**
     * Server side search
     *
     * @param  {string} query      - string to search
     * @param  {function} cb - after getting the results this func will be called (Optional): function(CategoriesSearchResultsType)
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.search = function(query, cb) {
        var self = this;
        if (!this.initialized) {
            var listener = function() {
                self.search(query, cb);
            };
            this.listeners.push(listener);
            return;
        }
        var ctrl = this.controller;
        var strTrimmed = query.trim();

        this.clearSearch();

        if (!this.searchParams.pid || !this.searchParams.filters) {
            self.displayMessage(MESSAGE_FEATURE_NOT_CONFIGURED);
            return;
        }

        if (strTrimmed) {
            this.searchString = strTrimmed;

            if (this.options.uiEnabled) {
                this.toggleLoadingMessage(true);
            }

            this.controller.search(this.searchParams.pid, strTrimmed, 'dateModifiedDescending', this.searchParams.filters, 1, function(results) {

                if (self.options.uiEnabled) {
                    self.showResults(strTrimmed, results);
                } else {
                    cb({
                        page: 1,
                        results: results,
                        resultCount: ctrl.count
                    });
                }
            });
        }
    };

    /**
     * Displays a message provided
     *
     * @param {string} message - a message to be displayed.
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.displayMessage = function(message) {
        var containerDom, messageDisplayDom;

        if (this.container && this.options.uiEnabled) {
            containerDom = this.container;
            this.toggleLoadingMessage(false);
            containerDom.textContent = '';

            messageDisplayDom = document.createElement('p');
            messageDisplayDom.className = 'display-message';
            messageDisplayDom.textContent = message;

            containerDom.appendChild(messageDisplayDom);
        }
    };

    /**
     * clears the search data
     *
     */
    viewerSearchNameSpace.InViewerSearchThisProject.prototype.clearSearch = function() {
        var containerDom;

        if (this.container && this.options.uiEnabled) {
            containerDom = this.container;
            containerDom.textContent = '';
            this.toggleLoadingMessage(false);
        }
    };

    function Controller(qsApi) {
        var ctrl = this;
        var actualParameters = {};
        var actualCategory = '';
        var next = {};

        ctrl.categories = null;
        ctrl.categoriesIndex = {};
        ctrl.count = 0;
        ctrl.projectResults = null;

        /**
         * transform the search results and store them in ctrl.categories collection.
         * ctrl.categories: [{name, categoryResults}]
         * @param result
         * @param cb
         */
        function translateResults(result, cb) {
            var categories = [];

            if (result) {
                result.forEach(function(group) {
                    var category;

                    if (group.suggestionCount > 0) {
                        category = {
                            modifier: group.modifier,
                            name: group.displayName,
                            categoryResults: [],
                            moreItems: group.suggestionCount > 3
                        };

                        group.suggestions.forEach(function(suggestion) {
                            var categoryResult = {
                                name: qsApi.sanitizeAndHighlightString(suggestion.title, '<b>', '</b>'),
                                logClick: suggestion.logClick,
                                url: suggestion.url,
                                resultData: suggestion
                            };

                            category.categoryResults.push(categoryResult);
                        });

                        ctrl.count = ctrl.count + group.suggestionCount;
                        categories.push(category);
                        ctrl.categoriesIndex[category.name] = categories.length - 1;
                    }
                });

                ctrl.categories = categories;
            }

            cb(ctrl.categories);
        }

        /**
         * if the response from QsApi is success
         * @param err
         * @param result
         * @param cb
         * @returns {boolean}
         */
        function handleResult(err, result, cb) {
            if (!err) {
                if (result && result.suggestionGroups) {
                    translateResults(result.suggestionGroups, cb);
                }
            } else {
                qsApi.logErrorEvent('Error getting suggestions: ' + err, 'in_viewer_search_this_project', 'handleResult', 'thisProject');
                // TODO(jwo): Call the cb w/ the error, so the upsteam caller can properly handle (or squash) the error.
                cb([]);
            }
        }

        /**
         * calls to QsApi to get the search results
         * @param pid
         * @param query
         * @param sort
         * @param filters
         * @param page
         * @param cb
         */
        ctrl.search = function(pid, query, sort, filters, page, cb) {
            if (page === 1) {
                ctrl.categories = null;
                ctrl.count = 0;
                next = {};
            }

            actualParameters = {
                query: query,
                sort: sort,
                filters: filters
            };

            var start = +new Date();
            qsApi.search(pid, query, sort, filters, page, function(err, result) {
                qsApi.logSearchResponseTime("searchTime", query, (new Date() - start), 'thisProject');
                handleResult(err, result, cb);
            }, 'thisProject');
        };

        ctrl.uninitialize = function() {};

        /**
         * Retrieves the next page results
         * @param err
         * @param result
         * @param cb
         */
        function loadMoreResults(err, result, cb) {
            var newPage, moreItems, categoryResults;

            if (err) {
                qsApi.logErrorEvent('Error getting more item results: ' + err, 'in_viewer_search_this_project', 'loadMoreResults', 'thisProject');
                cb(err, null, null);
            } else {
                if (result && result.queryResults) {
                    newPage = [];
                    categoryResults = ctrl.categories[ctrl.categoriesIndex[actualCategory]].categoryResults;

                    result.queryResults.forEach(function(queryResult) {
                        var cat = {
                            name: qsApi.sanitizeAndHighlightString(queryResult.title, '<b>', '</b>'),
                            logClick: queryResult.logClick,
                            url: queryResult.url,
                            resultData: queryResult
                        };

                        newPage.push(cat);

                        categoryResults.push(cat);
                    });

                    moreItems = result.queryResultCount > categoryResults.length;

                    cb(null, newPage, moreItems);
                }
            }
        }

        /**
         * Gets the next page of results
         * @param pid
         * @param category
         * @param modifier
         * @param cb
         * @param page
         */
        ctrl.getMoreResults = function(pid, category, modifier, cb, page) { // TODO(jwo): Move cb to last property. This allows inline anonymous functions to be the last variable in a function call.
            var nextPage = 2;

            actualCategory = category;

            if (category && next.hasOwnProperty(category.name)) {
                nextPage = next[category.name];
            }

            if (page) {
                nextPage = page;
            }

            qsApi.getMoreResults(pid, modifier, actualParameters.query, actualParameters.sort, actualParameters.filters, nextPage, function(err, result) {
                loadMoreResults(err, result, cb);
            });

            if (!page) {
                next[category.name] = nextPage + 1;
            }
        };
    }

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    /**
     * @typedef SearchResultType
     * @property {string} dbId - geometry node dbId
     * @property {string} fieldName - property field name
     * @property {string} fieldValue - property field value
     * @property {string} nodeName - geometry node name
     */

    /**
     * @typedef SearchResultsType
     * @property {number} page - page number
     * @property {SearchResultType[]} results - result list
     * @property {number} resultCount - the total amount of results
     * @property {boolean} moreResults - true is there are more results
     * @property {string} error - Error message.
     */

    var _this;

    var SCROLL_OFFSET_IN_THIS_VIEW = 500;
    var SCROLL_LIMIT_IN_THIS_VIEW = 200;
    var ALERT_MESSAGE_DURATION = 7000;

    /**
     * InViewerSearchThisView
     */
    viewerSearchNameSpace.InViewerSearchThisView = function(viewer, options) {
        _this = this;
        this.options = options;
        this.viewer = viewer;
        this.container = null;
        this.initialized = false;
        this.controller = null;
        this.resultList = null;
        this.clicked = null;
        this.is2DMode = null;
        this.qsApi = null;
        this.searchString = null;
        this.highlightNode = null;
        this.scrollOffset = SCROLL_OFFSET_IN_THIS_VIEW;
        this.limitScroll = SCROLL_LIMIT_IN_THIS_VIEW;
        this.limit = options.loadedModelTab.pageSize;
        this.offset = 0;
        this.mouseClickTimeout = null;

        this.loadingId = 'this-view-loading';
        this.loadingDom = null;
        this.resultsDom = null;
        this.resultCountDOM = null;
        this.highlightNodeInViewer = null;
        this.fittedToView = false;
        this.isNodeVisible = null;
        this.listeners = [];
    };

    viewerSearchNameSpace.InViewerSearchThisView.prototype.constructor = viewerSearchNameSpace.InViewerSearchThisView;

    function removeNodeNotVisibleAlert(self) {
        if (self.nodeNotVisibleAlert) {
            self.viewer.container.removeChild(self.nodeNotVisibleAlert);
            self.nodeNotVisibleAlert = null;
            clearTimeout(self.nodeNotVisibleAlertTimer);
        }
    }

    function removeNoVisibleNodesAlert(self) {
        if (self.noVisibleNodesAlert) {
            self.viewer.container.removeChild(self.noVisibleNodesAlert);
            self.noVisibleNodesAlert = null;
            clearTimeout(self.noVisibleNodesAlertTimer);
        }
    }
    /**
     * initialize this view search
     *
     * @param  {QsApiService} qsApi            - QsApiService initialized
     * @param  {ViewerPropertiesService} viewerProperties - viewer initialized
     * @param  {string} currentGeometry  - geometry guid of the geometry loaded in the viewer
     * @param  {boolean} is2D             - true id model is 2D
     * @param  {string} container      - html container
     * @param  {type} highlightNodeInViewer      - html container
     * @param  {function} cb         - after initialized will be called
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.initialize = function(qsApi, viewerProperties, currentGeometry, is2D, container, highlightNodeInViewer, isNodeVisiblefn, cb) {
        var self = this;
        this.qsApi = qsApi;
        this.highlightNodeInViewer = highlightNodeInViewer;
        this.is2DMode = is2D;
        this.isNodeVisible = isNodeVisiblefn;

        if (this.options.uiEnabled) {
            this.container = container;
            this.container.addEventListener('click', this.clickHandler);
            this.container.addEventListener('dblclick', this.clickHandler);
            this.container.addEventListener('hover', this.clickHandler);

            window.addEventListener('click', function() {
                removeNodeNotVisibleAlert(self)
                removeNoVisibleNodesAlert(self);
            }, false);
        }

        this.controller = new Controller(qsApi, viewerProperties, currentGeometry);
        this.controller.initializeAllAttributes(function() {
            self.initialized = true;
            cb();
            if (self.listeners && self.listeners.length) {
                self.listeners.forEach(function(cb) {
                    cb();
                });
                self.listeners = [];
            }
        });
    };

    /**
     * Uninitialize
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.uninitialize = function() {

        if (this.options.uiEnabled) {
            this.container.removeEventListener('click', this.clickHandler);
            this.container.removeEventListener('dblclick', this.clickHandler);
            this.container.removeEventListener('hover', this.clickHandler);
        }

        if (this.controller) {
            this.controller = null;
        }
    };

    var fnHandleClicks = function(event) {
        var node = event.target;
        var found = false;
        var searchDbId, searchIndex;

        while (node && this.container !== node && !found) {
            found = node.hasAttribute('adskSearchDbId');
            if (!found) {
                node = node.parentNode;
            }
        }

        if (found) {
            searchDbId = parseInt(node.getAttribute('adskSearchDbId'), 10);
            searchIndex = parseInt(node.getAttribute('adskSearchIndex'), 10);

            if (event.type === 'click') {
                setTimeout(function() {
                    _this.showNodeProperties(event, searchDbId, searchIndex);
                },0);
            } else if (event.type === 'dblclick') {
                setTimeout(function() {
                    _this.showNodeProperties(event, searchDbId, searchIndex, true);
                    _this.viewer.fitToView();
                },0);

            } else if (event.type === 'hover') {
                _this.viewer.impl.rolloverObjectNode(searchDbId);
            }
        }
    };

    viewerSearchNameSpace.InViewerSearchThisView.prototype.clickHandler = function(event) {
        if (!event) {
            return;
        }

        // Working around both click and dblClick events arriving (SRCH-1169)
        clearTimeout(_this.mouseClickTimeout);

        _this.mouseClickTimeout = setTimeout(function() {
            fnHandleClicks.call(_this, event);
        }, 200);
    };

    /**
     * searches into the property values of the geometry loaded in the viewer
     *
     * @param  {string} str  - string to search
     * @param  {function} cb  - function to be called with the results as a parameter function(SearchResultsType)
     * @param  {number} node - if redirecting front this item tab (Optional, UI)
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.search = function(str, node, cb) {
        var self = this;
        if (!this.initialized) {
            var listener = function() {
                self.search(str, node, cb);
            };
            this.listeners.push(listener);
            return;
        }

        var ctrl = this.controller;
        var queryTrimmed = str.trim();

        this.clearSearch();

        if (queryTrimmed) {
            this.searchString = queryTrimmed;
            self.resultList = null;

            if (this.options.uiEnabled) {
                this.toggleLoadingMessage(true);
                this.highlightNode = node;
            }

            this.controller.doSearch(queryTrimmed, function(queryTrimmed, results, ended) {
                if (self.options.uiEnabled) {
                    self.showResults(queryTrimmed, results, ended);
                } else {
                    processResults(self, queryTrimmed, results, ended);

                    if (ended) {
                        var res = {
                            page: 1,
                            results: ctrl.resultSetArray.slice(0, self.limit),
                            resultCount: ctrl.resultCount,
                            moreResults: ctrl.resultCount > self.limit
                        };

                        cb(res);
                    }
                }
            });
        }
    };

    var setSelectedNode = function(self, item) {
        var selected;

        selected = self.selectedNode;

        if (selected) {
            selected.classList.remove('selected');
        }

        if (item) {
            self.selectedNode = item;
            if (item) {
                item.classList.add('selected');
            }
        }
    };

    /**
     * [UI ENABLED] after clicking on a result the properties are shown
     * (if the result is already clicked we hide the properties)
     *
     * @param  {object} event    - click event
     * @param  {string} nodeId   - node id of the selected result
     * @param  {number} position - position in the result list
     * @param  {type} showExtensionViewer
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.showNodeProperties = function(event, nodeId, position, showExtensionViewer) {
        var self = this;
        this.qsApi.logResultClickEvent(position + 1, nodeId, true, 'thisView');

        if (this.clicked === nodeId) {
            this.clicked = null;

            this.highlightNodeInViewer(null, this.controller.searchResultIds, !!showExtensionViewer, false);

            if (showExtensionViewer) {
                setSelectedNode(self, event.target, event);
            } else {
                setSelectedNode(self, null);
            }

        } else {
            this.selectNode(event.target, nodeId, false);
        }
    };

    /**
     * [UI ENABLED] after clicking on a result the properties are shown
     * (if the result is already clicked we hide the properties)
     *
     * @param  {string} item   - ???
     * @param  {string} nodeId   - node id of the selected result
     * @param  {boolean} doScroll - scroll to the position in the list
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.selectNode = function(item, nodeId, doScroll) {
        var self = this;
        var finished = false;
        var ctrl = this.controller;
        var i;
        var items;
        var reClickedItem;

        this.clicked = nodeId;
        if (!item && this.container.children.length > 1) {

            items = this.container.children[1].children;
            length = items.length;
            i = 0;
            reClickedItem = "/\b" + "dbId_" + nodeId + "\b/";
            while (!finished && i < length) {
                if (items[i].className.match(reClickedItem)) {
                    finished = true;
                    item = items[i];
                }
                i++;
            }
        }

        this.highlightNodeInViewer(this.clicked, this.controller.searchResultIds, true, false);

        setSelectedNode(self, item);

        if (doScroll) {
            if (item && item.parentNode) {
                item.parentNode.scrollTop = item.offsetTop;
            }
        }

        if (!item) {
            if (!ctrl.searchResultIds.length) {
                //no visible nodes in the geometry
                this.clicked = null;
                this.showAlertNoVisibleNodes();

            } else if (ctrl.searchResultIds.indexOf(nodeId) < 0)
            {
                //node is not visible
                this.clicked = null;
                this.showAlertNodeNotVisible();
            }
        }
    };

    function appendItem(self, item, containerDom, index) {
        var resultDom = document.createElement('li');

        resultDom.innerHTML = item.displayNameSanitized;
        resultDom.setAttribute('adskSearchDbId', item.dbId);
        resultDom.setAttribute('adskSearchIndex', index);
        resultDom.className = 'item-result dbId_' + item.dbId;

        if (self.highlightNode === item.dbId) {
            //we have to add here the class because it isn't appended in the container yet
            self.selectedNode = resultDom;
            resultDom.className += ' selected';
            self.selectNode(resultDom, item.dbId, true);
        }
        self.resultsDom = resultDom;
        containerDom.appendChild(resultDom);
    }

    /**
     * clears search data
     *
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.clearSearch = function() {

        this.offset = 0;
        this.scrollOffset = SCROLL_OFFSET_IN_THIS_VIEW;
        this.limitScroll = SCROLL_LIMIT_IN_THIS_VIEW;
        this.clicked = null;
        this.selectedNode = null;
        this.highlightNode = null;

        if (this.options.uiEnabled) {
            if (this.container) {
                this.container.textContent = '';
            }

            if (this.controller && this.controller.searchResultIds && this.controller.searchResultIds.length > 0) {
                this.toggleLoadingMessage(false);
                this.controller.searchResultIds = [];
                this.controller.resultSetArray = [];
                this.controller.resultCount = 0;
                //this.controller.resultCollection.resetResultCollection();
                this.resultList = null;
            }

            this.loadingDom = null;
            this.resultsDom = null;
            this.resultCountDOM = null;
            this.resultList = null;
        }
    };

    /**
     * [UI ENABLED] shows/hides loading message
     *
     * @param  {boolean} loading - if true shows else hides
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.toggleLoadingMessage = function(loading) {
        var loadingDom = this.loadingDom;

        if (loading && !loadingDom) {
            loadingDom = document.createElement('div');
            loadingDom.id = this.loadingId;
            loadingDom.className = 'loading';
            loadingDom.textContent = av.i18n.translate('Loading');
            this.loadingDom = loadingDom;
            this.container.appendChild(loadingDom);
        } else if (loadingDom) {
            if (loadingDom.parentNode) {
                loadingDom.parentNode.removeChild(loadingDom);
            }
            this.loadingDom = null;
        }
    };

    /**
     * [UI ENABLED] loads the next page of results
     *
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.loadMoreResults = function() {
        var nextLastIndex, i;
        var ctrl = this.controller;
        var self = this;
        var offset = this.offset;
        var length = ctrl.resultCount;

        if (length > offset) {
            nextLastIndex = (offset + self.limit);
            for (i = offset; i < nextLastIndex; i++) {
                if (length > i) {
                    appendItem(self, ctrl.resultSetArray[i], self.resultList, i);
                }
            }

            self.offset = offset + self.limit;
        }
    };

    /**
     * Returns the page of results
     *
     * @param  {number} pageNumber - page to be returned
     * @param  {function} cb   - function to be called passing the results as a parameter: function(SearchResultType[])
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.getPage = function(pageNumber, cb) {
        var self = this;
        if (!this.initialized) {
            var listener = function() {
                self.getPage(pageNumber, cb);
            };
            this.listeners.push(listener);
            return;
        }

        var results, returnVal;
        var ctrl = this.controller;

        if (pageNumber < 1) {
            returnVal = {
                page: pageNumber,
                message: "Invalid page number, it must be a positive number.",
                moreResults: false
            };

            cb(returnVal);
            return;
        }

        var offset = self.limit * (pageNumber - 1);

        if (ctrl.resultCount < offset) {
            returnVal = {
                page: pageNumber,
                results: [],
                resultCount: ctrl.resultCount,
                moreResults: false,
                message: "That page doesn't exists."
            };
            cb(returnVal);
            return;
        }

        results = ctrl.resultSetArray.slice(offset, offset + self.limit);

        returnVal = {
            page: pageNumber,
            results: results,
            resultCount: ctrl.resultCount,
            moreResults: ctrl.resultCount > (offset + self.limit)
        };

        cb(returnVal);
        return;
    };

    function showNoResults(container, str, contextName) {
        var noResultsDOM, strResultText;

        container.textContent = ''; // Clear container

        strResultText = av.i18n.translate('No Results')
            .split('{0}').join(str) // TODO(jwo): Move to templating function
            .split('{1}').join(contextName);

        noResultsDOM = document.createElement('p');
        noResultsDOM.className = 'no-results-this-view';
        noResultsDOM.textContent = strResultText;

        container.appendChild(noResultsDOM);
    }

    function getDisplayName(self, item, ctrl, str) {
        var itemValue, nodeName, displayNameSanitized;

        nodeName = item.nodeName;

        if (!nodeName) {
            var data = self.viewer.model.getData();
            if (data && data.instanceTree) {
                nodeName = data.instanceTree.getNodeName(item.dbId);
            } else {
                nodeName = ctrl.viewerProperties.defaultNodeName();
            }
            item.nodeName = nodeName;
        }

        if ((nodeName && nodeName.indexOf(str) >= 0) || ((item.hasOwnProperty('fieldName') && item.fieldName === "Name"))) {
            displayNameSanitized = ctrl.viewerProperties.highlightText(nodeName, str);
        } else {
            if (item.hasOwnProperty('fieldName') && item.hasOwnProperty('fieldValue')) {
                itemValue = (Object.prototype.toString.call(item.fieldValue) === '[object Number]' ? String(item.fieldValue) : item.fieldValue);

                // highlightText() is called to sanitize the text, and to do actual highlighting in for itemValue
                displayNameSanitized = ctrl.viewerProperties.highlightText(nodeName) + ' (' + ctrl.viewerProperties.highlightText(item.fieldName) + ': ' + ctrl.viewerProperties.highlightText(itemValue, str) + ')';
            } else {
                // highlightText() is called to sanitize the text
                displayNameSanitized = ctrl.viewerProperties.highlightText(nodeName);
            }
        }

        return displayNameSanitized;
    }

    function updateResultCount(count, self) {
        var term, ctx, strResultText, resultCountDOM;

        resultCountDOM = self.resultCountDOM;

        if (!resultCountDOM) {
            return;
        }

        term = resultCountDOM.getAttribute('term');
        ctx = resultCountDOM.getAttribute('ctx');

        strResultText = av.i18n.translate('Results Count');
        strResultText = strResultText.split('{0}').join(count);
        strResultText = strResultText.split('{1}').join(term);
        strResultText = strResultText.split('{2}').join(ctx);

        resultCountDOM.textContent = strResultText;
    }

    function processResults(self, str, results) {
        var wrapperDom, resultCountDom, strResultText, displayNameSanitized, nodeItem;
        var containerDom = self.container;
        var ctrl = self.controller;
        var length = results ? results.length : 0;
        var limit = self.limit;
        var offset = self.offset;
        var nextLastIndex = offset + limit;

        if (length < limit) {
            nextLastIndex = offset + length;
        }

        if (length) {
            if (self.options.uiEnabled) {
                self.toggleLoadingMessage(false);

                if (!self.resultList) {
                    // Clear containerDom
                    containerDom.textContent = '';

                    wrapperDom = document.createElement('div');
                    wrapperDom.className = 'result-count';

                    resultCountDom = document.createElement('span');
                    resultCountDom.id = 'result-count-this-view';
                    resultCountDom.setAttribute('term', str);
                    resultCountDom.setAttribute('ctx', self.options.loadedModelTab.displayName);

                    strResultText = av.i18n.translate('Results Count');

                    resultCountDom.textContent = strResultText.split('{0}').join(length)
                        .split('{1}').join(str)
                        .split('{2}').join(self.options.loadedModelTab.displayName);

                    self.resultCountDOM = resultCountDom;
                    wrapperDom.appendChild(resultCountDom);
                    containerDom.appendChild(wrapperDom);

                    self.resultList = document.createElement('ul');
                    self.resultList.className = 'search-result-list dockingPanelScroll';

                    self.resultList.addEventListener('scroll', function() {
                        if (this.scrollTop > self.scrollOffset) {
                            self.loadMoreResults();
                            self.scrollOffset = self.scrollOffset + self.limitScroll;
                        }
                    });

                    containerDom.appendChild(self.resultList);
                }
            }
            ctrl.viewerProperties.prepHighlighter(str);

            results.slice(offset, length).forEach(function(item, i) {
                if (!item.hasOwnProperty("dbId")) {
                    item = {
                        fieldName: item.name,
                        fieldValue: item.value,
                        dbId: item.id,
                        nodeName: item.nodeName
                    }
                }

                self.isNodeVisible(item.dbId, function() {
                    //we show the nodes that are visible in the results for this view
                    if (!ctrl.searchedIds.hasOwnProperty(item.dbId)) {
                        displayNameSanitized = getDisplayName(self, item, ctrl, str);

                        nodeItem = {
                            displayNameSanitized: displayNameSanitized,
                            dbId: item.dbId,
                            fieldName: item.fieldName,
                            fieldValue: item.fieldValue,
                            nodeName: item.nodeName
                        };

                        ctrl.resultSetArray.push(nodeItem);
                        ctrl.searchResultIds.push(item.dbId);
                        ctrl.searchedIds[item.dbId] = 1;
                        ctrl.resultCount++;

                        if (self.options.uiEnabled) {
                            if (ctrl.resultCount <= limit && offset < nextLastIndex) {
                                appendItem(self, nodeItem, self.resultList, i);
                                offset = offset + 1;
                            }
                        }
                    }
                });
            });

            self.offset = offset;

            if (self.options.uiEnabled) {
                updateResultCount(ctrl.resultCount, self);
            }
        }
    }

    viewerSearchNameSpace.InViewerSearchThisView.prototype.showAlertNodeNotVisible = function() {
        var self = this;
        this.nodeNotVisibleAlert = document.createElement("div");
        this.nodeNotVisibleAlert.className = "alert-node-not-visible";
        this.nodeNotVisibleAlert.textContent = av.i18n.translate('Selected Node Result Not Visible');
        this.viewer.container.appendChild(this.nodeNotVisibleAlert);
        this.nodeNotVisibleAlertTimer = setTimeout(function() {
            removeNodeNotVisibleAlert(self);
        }, ALERT_MESSAGE_DURATION);
    };

    viewerSearchNameSpace.InViewerSearchThisView.prototype.showAlertNoVisibleNodes = function() {
        var self = this;
        this.noVisibleNodesAlert = document.createElement("div");
        this.noVisibleNodesAlert.className = "alert-no-visible-nodes";
        this.noVisibleNodesAlert.textContent = av.i18n.translate('No Visible Node Results For Geometry');
        this.viewer.container.appendChild(this.noVisibleNodesAlert);
        this.noVisibleNodesAlertTimer = setTimeout(function() {
            removeNoVisibleNodesAlert(self);
        }, ALERT_MESSAGE_DURATION);
    };

    /**
     * [UI ENABLED] displays the results list
     *
     * @param  {string} str     - searched string
     * @param  {SearchResultBruteType[]} results - results list
     * @param  {boolean} ended   - the search is done
     */
    viewerSearchNameSpace.InViewerSearchThisView.prototype.showResults = function(str, results, ended) {
        var self = this;
        var ctrl = this.controller;
        var container = self.container;

        processResults(self, str, results);

        if (ended && (ctrl.resultCount < 1 || !self.resultList.childNodes.length)) {
            self.toggleLoadingMessage(false);
            showNoResults(container, str, self.options.loadedModelTab.displayName);
        }

        if (ended && self.highlightNode) {
            if (!ctrl.searchedIds.hasOwnProperty(self.highlightNode)) {
                //the node is not visible
                this.selectNode(null, self.highlightNode, false);
            }
        }

        if (ctrl.searchResultIds && ctrl.searchResultIds.length) {
             this.highlightNodeInViewer(self.highlightNode, null, self.highlightNode, false);
        }

        if (ended) {
            ctrl.searchedIds = {}; //cleaning up
        }

        ctrl.searchEnded = ended;
    };

    viewerSearchNameSpace.InViewerSearchThisView.prototype.updateCurrentGeometry = function(newCurrent, resultCollection, str, is2D, highlightedNode) {
        var ctrl = this.controller;
        this.clearSearch();
        this.is2DMode = is2D;
        this.highlightNode = highlightedNode;

        // ToDo(fyamaoka): Not sure of the purpose of "isBig" when the same value is retreived on isBigModel.
        // Maybe one of them supposed to be retrieved with hasTooManyNodes(false)?
        // (lc):here we are loading a new model so this value may change and we need to take action
        var isBig = ctrl.viewerProperties.hasTooManyNodes(true);
        if (ctrl.isBigModel && !isBig) {
            ctrl.initialized = false;
            ctrl.viewerProperties.getCurrentGeometryAttributes(function() {
                ctrl.initialized = true;
            });
        }

        ctrl.currentGeometry = newCurrent;
        ctrl.searchResultIds = [];
        ctrl.searchedIds = {};
        ctrl.resultCount = 0;
        ctrl.resultSetArray = [];

        var partialResults = [];
        if (resultCollection && resultCollection.hasResultSet(newCurrent)) {
            partialResults = resultCollection.getResultSet(newCurrent);
        }
        this.showResults(str, partialResults, true);
    };

    // Logic
    function Controller(qsApi, viewerProperties, currentGeometry) {
        var ctrl = this;
        var initStart = null;

        ctrl.initialized = false;
        ctrl.searchResultIds = [];
        ctrl.searchedIds = {};
        ctrl.resultCount = 0;
        ctrl.resultSetArray = [];
        //ctrl.resultCollection = new ResultCollection();
        ctrl.searchEnded = null;
        ctrl.viewerProperties = viewerProperties;
        ctrl.isBigModel = false;
        ctrl.isSharedPropertyDb = false;
        ctrl.currentGeometry = currentGeometry;

        /**
         * after initialized ready will be called
         */
        function ready() {
            var duration = new Date().getTime() - initStart;
            avp.logger.log('Execution time INIT: ' + duration);
            qsApi.logTimeEvent("initTime", duration, 'thisView');
            ctrl.initialized = true;
        }

        /**
         * if the geometry is not big, it gets the attributes/properties for the geometry and initialize the viewerProperties
         * if it is big, just initialize the viewerOptions
         */
        ctrl.initializeAllAttributes = function(onReady) {
            initStart = new Date().getTime();
            ctrl.isBigModel = ctrl.viewerProperties.hasTooManyNodes(true);

            if (!ctrl.currentGeometry) {
                ctrl.isBigModel = true;
            }

            if (!ctrl.isBigModel) {
                avp.logger.log("Using Fullproof in This View");
                ctrl.viewerProperties.getCurrentGeometryAttributes(function() {
                    ready();
                    onReady();
                });
            } else {
                avp.logger.log("Using Brute Force in This View");
                ready();
                onReady();
            }
        };

        /**
         * when the geometry is big we call the search implemented in the viewer that returns the ids of the nodes that
         * matched the search
         *
         * @param str
         * @param cb
         */
        function bruteSearch(str, cb) {
            var start = new Date().getTime();

            var onSuccessCb = function(results) {
                ctrl.searchEnded = true;
                qsApi.logSearchResponseTime('bruteSearchTime', str, (new Date().getTime() - start), 'thisView');
                qsApi.logSearchResults(results.length, str, 'bruteSearch', 'thisView');
                cb(str, results, true);
            };

            var onErrorCb = function() { // TODO(jwo): shouldn't viewer.search() send an error message back to this OnErrorCb()?
                ctrl.searchEnded = true;
                qsApi.logErrorEvent('LMV search bruteForceSearch failed', 'in_viewer_search_this_view', 'bruteSearch', 'thisView');
                cb(str, null, true);
            };

            //viewer.search(str, onSuccessCb, onErrorCb, [], true);
            ctrl.viewerProperties.bruteSearchCurrent(str, onSuccessCb, onErrorCb);
        }

        /**
         * if the model is big calls bruteSearch
         * if not, calls viewerProperties search
         *
         * @param str
         * @param cb
         */
        ctrl.doSearch = function(str, cb) {
            var start;

            ctrl.searchResultIds = [];
            ctrl.searchedIds = {};
            ctrl.resultCount = 0;
            ctrl.resultSetArray = [];
            //ctrl.resultCollection.resetResultCollection();
            ctrl.searchEnded = false;

            if (ctrl.isBigModel) {
                bruteSearch(str, cb);
            } else {
                start = new Date().getTime();

                ctrl.viewerProperties.doSearch(str, function(str, resultCollection, ended) {
                    var partialResults = [];

                    if (resultCollection.getResultCount()) {
                        if (resultCollection.hasResultSet(ctrl.currentGeometry)) {
                            partialResults = resultCollection.getResultSet(ctrl.currentGeometry);
                        }
                    }

                    cb(str, partialResults, ended);

                    if (ended) {
                        qsApi.logSearchResponseTime('searchTime', str, (new Date().getTime() - start), 'thisView');
                        qsApi.logSearchResults(ctrl.resultCount, str, 'fullproof-StringSearch', 'thisView');
                    }
                });
            }
        };
    }

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var avp = Autodesk.Viewing.Private;
    var av = Autodesk.Viewing;
    var viewerSearchNameSpace = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    /* CONSTANT */
    var APPLICATION_ID = 'adsk.viewer';

    /**
     * QsApi is a service that interacts with qs-api library
     * @constructor
     */
    viewerSearchNameSpace.QsApiService = function() {
        this.qsAPI = null;
    };

    var proto = viewerSearchNameSpace.QsApiService.prototype;

    var params = {
        pid: '', // profile id
        query: '', // query string
        sort: '',
        page: 1,
        filters: '',
        language: 'ENU',
        modifier: null
    };

    var sessionInfo = {};
    var queryStr = null;
    var queryId = null;
    var envLMV = null;
    var viewerBuildId = null;

    var lmvToSearchEnv = Object.freeze({
        development: 'apidev',
        staging: 'apistg',
        production: 'apiprod',
        autodeskstaging: 'apistg',
        autodeskdevelopment: 'apidev',
        autodeskproduction: 'apiprod'
    });

    function getUserIdFromService(onSuccess, onFailure) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", av.endpoint.getApiEndpoint() + '/userprofile/v1/users/@me', true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + sessionInfo.oauth2Token);
        xhr.responseType = "json";

        xhr.onload = function () {
            if (xhr.status === 200 && xhr.response) {
                // If the response is a string (e.g. from IE), need to parse it to an object first
                var response = typeof(xhr.response) === 'string' ? JSON.parse(xhr.response) : xhr.response;

                if (response) {
                    onSuccess(response);
                }
                else {
                    onFailure(xhr.status, "Can't get user data from response.");
                }

            } else {
                onFailure(xhr.status);
            }
        };

        xhr.onerror = onFailure;
        xhr.ontimeout = onFailure;

        xhr.send();
    }

    /**
     * Creates a new instance of SearchQueryAPI
     * @param viewerBuildIdArg
     * @param environment - dev/stg/prod
     * @param appId -
     * @param sessionId -
     */
    proto.initialize = function(viewerBuildIdArg, environment, appId, sessionId) {
        sessionInfo = {
            token: null,
            oauth2Token: null,
            clientId: appId,
            sessionId: sessionId,
            clientFeatureId: "",
            userId: ""
        };

        viewerBuildId = viewerBuildIdArg;

        envLMV = environment.toLowerCase();

        this.qsAPI = new Autodesk.Search.SearchQueryAPI(lmvToSearchEnv[envLMV]);

        getSessionInfo('');
        this.getUserId(function(userData) {
            sessionInfo.userId = userData.userId;
        }, function(err, msg) {
            avp.logger.log('InViewerSearch Extension: QsApi sessionInfo.userId not set: ' + err);
        });
    };

    function getSessionInfo(tabName) {

        if (!envLMV) {
            return sessionInfo;
        }

        if (envLMV.indexOf('autodesk') >= 0) { // TODO(go) -- 20160601 - is there a better way to decide is it's oauth2 or 1?
            sessionInfo.token = null;
            sessionInfo.oauth2Token = avp.token.accessToken;
        } else {
            sessionInfo.token = avp.token.getAccessToken ? avp.token.getAccessToken() : null;
            sessionInfo.oauth2Token = null;
        }

        if (tabName) {
            sessionInfo.clientFeatureId = APPLICATION_ID + (tabName ? ("." + tabName) : "");
        }

        return sessionInfo;
    }

    function loggedCb(err) {
        if (err) {
            avp.logger.log('InViewerSearch Extension: recieved ' + err);
        }
    }

    /**
     * generate UUID to be used as query ID
     */
    proto.generateQueryId = function() {
        var d = new Date().getTime();

        if (window.performance && typeof window.performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }

        queryId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    };

    /**
     * returns the sessionInfo.userId
     */
    proto.getUserId = function(onSuccess, onFailure) {
        if (!sessionInfo.userId) {
            getUserIdFromService(onSuccess, onFailure);
        } else {
            onSuccess(sessionInfo.userId);
        }
    };

    /**
     * @private
     * helper to get the browser name
     * @returns {string}
     */
    function browser() { // TODO(jwo): Is there a library we can pull in to do this? This is seems fragile.
        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isChrome) {
            return 'Chrome';
        }
        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if (isOpera) {
            return 'Opera';
        }
        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) {
            return 'Firefox';
        }
        // At least Safari 3+: '[object HTMLElementConstructor]'
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        if (isSafari) {
            return 'Safari';
        }
        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (isIE) {
            return 'Internet Explorer';
        }
        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge) {
            return 'Edge';
        }
        // Blink engine detection
        var isBlink = (isChrome || isOpera) && !!window.CSS;
        if (isBlink) {
            return 'Blink';
        }

        return 'Unknown';
    }

    /**
     * executes a search calling the suggest Api and calls handleResultSuccess or handleResultFailure depending on the response
     * @param pid
     * @param query
     * @param sort
     * @param filters
     * @param page
     * @param handleResult - success callback
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.search = function(pid, query, sort, filters, page, handleResult, tabName) {
        if (!this.qsAPI) {
            avp.logger.log('InViewerSearch Extension: QsApi not initialized');
        }

        queryStr = query;
        params.pid = pid;
        params.page = page;
        params.query = query;
        params.sort = sort;
        params.filters = filters;

        var sessionInfo = getSessionInfo(tabName);

        this.qsAPI.suggest(params, sessionInfo, handleResult);
    };

    /**
     * gets more results given the modifier identifier and query params
     * @param pid
     * @param modifier
     * @param query
     * @param sort
     * @param filters
     * @param page
     * @param successCallback
     */
    proto.getMoreResults = function(pid, modifier, query, sort, filters, page, successCallback) {
        if (!this.qsAPI) {
            avp.logger.log('InViewerSearch Extension: QsApi not initialized');
        }

        queryStr = query;
        params.pid = pid;
        params.page = page;
        params.query = query;
        params.sort = sort;
        params.filters = filters;
        params.modifier = modifier;

        var sessionInfo = getSessionInfo();

        this.qsAPI.query(params, sessionInfo, successCallback);
    };

    proto.getUserQueries = function(pid, document, successCallback) {
        var sessionInfo = getSessionInfo("init");

        this.qsAPI.getUserQueries({pid: pid, document: document}, sessionInfo, function(err, data) {
            if (err && data && data.hasOwnProperty("errors")) {
                //data is an array of errors
                if (data.errors.length) {
                    data = data.errors[0].detail;
                } else {
                    data = "";
                }
            }
            successCallback(err, data);
        });
    };

    proto.saveUserQueries = function(pid, userQueries, successCallback) {
        var sessionInfo = getSessionInfo("init");

        this.qsAPI.saveUserQueries({pid: pid, userQueries: userQueries}, sessionInfo, function(err, data) {
            if (err && data && data.hasOwnProperty("errors")) {
                //data is an array of errors
                if (data.errors.length) {
                    data = data.errors[0].detail;
                } else {
                    data = "";
                }
            }
            successCallback(err, data);
        });
    };

    /**
     * logs an event to the QS service
     * @param type
     * @param sessionInfo
     * @param body
     */
    proto.logEvent = function(type, sessionInfo, body) {
        if (this.qsAPI) {
            this.qsAPI.logEvent(queryId, sessionInfo, type, body, loggedCb);
        }
    };

    /**
     * This logs static information at initialization.
     * @param documentId - document ID
     * @param modelInfo - Information gathered about the model
     * @param options - options provided by application
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logInitEvent = function(documentId, modelInfo, options, tabName) {
        var eventType = 'inViewer.initialization';

        var body = {
            viewerVersion: viewerBuildId,
            id: documentId,
            modelInfo: modelInfo,
            url: window.location.href,
            browser: browser(),
            userAgent: window.navigator.userAgent,
            options: options
        };

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(eventType, sessionInfo, body);
    };

    /**
     * logs a click event on a result
     * @param timerType - searchTime / bruteSearchTime
     * @param tabName
     */
    proto.logGeneralEvent = function(timerType, tabName) {
        var timerEventType = 'inViewer.' + timerType;

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(timerEventType, sessionInfo, "");
    };

    /**
     * This logs times, for example init time in This Viewer tab
     * @param timerType - searchTime / bruteSearchTime
     * @param duration - in milliseconds
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logTimeEvent = function(timerType, duration, tabName) {
        var timerEventType = 'inViewer.' + timerType;

        var body = {};
        body[timerType + 'DurationMs'] = duration;

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(timerEventType, sessionInfo, body);
    };

    /**
     * Intended for logging search response time
     * @param timerType - searchTime / bruteSearchTime
     * @param query - query string
     * @param duration - in milliseconds
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logSearchResponseTime = function(timerType, query, duration, tabName) {
        var timerEventType = 'inViewer.' + timerType;

        var body = {
            queryString: query
        };
        body[timerType + 'DurationMs'] = duration;

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(timerEventType, sessionInfo, body);
    };

    /**
     * logs the query data
     * @param count - amount of results
     * @param query - query string
     * @param algorithm - {bruteSearch - fullproof-StringSearch}
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logSearchResults = function(count, query, algorithm, tabName) {
        var resultType = 'inViewer.searchResults';

        var body = {
            resultCount: count || 0,
            queryString: query,
            algorithm: algorithm
        };

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(resultType, sessionInfo, body);
    };

    /**
     * logs a change tab event
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logTabClickEvent = function(tabName) {
        var tabClickType = 'inViewer.tabClick';

        var body = null;

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(tabClickType, sessionInfo, body);
    };

    /**
     * logs a click event on a result
     * @param position
     * @param nodeId
     * @param current
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logResultClickEvent = function(position, nodeId, current, tabName) {
        var resultClickType = 'inViewer.resultClick';

        this.logResultComponentClickEvent(resultClickType, position, nodeId, current, tabName);
    };

    /**
     * logs a click event on a geometry (collapsible item that holds results for a geometry)
     * @param position
     * @param nodeId
     * @param current
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logResultGeomClickEvent = function(position, nodeId, current, tabName, geom) {
        var resultClickType = 'inViewer.resultGeomClick';

        this.logResultComponentClickEvent(resultClickType, position, nodeId, current, tabName, geom);
    };

    /**
     * utility function to handle click event on result components
     * @param resultClickType - resultClick / resultGeomClick
     * @param position
     * @param nodeId
     * @param current
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logResultComponentClickEvent = function(resultClickType, position, nodeId, current, tabName, geom) {
        var body = {
            position: position,
            /* first result is at position '1' */
            nodeId: nodeId,
            clickedCurrentGeometry: current
        };

		if (geom) {
			body.geometry = geom;
		}

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(resultClickType, sessionInfo, body);
    };

    /**
     * logs a click event on a "Load More" link
     * @param documentId
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logLoadMoreClickEvent = function(documentId, tabName) {
        var resultClickType = 'inViewer.loadMoreClick';

        var body = {
            id: documentId
        };

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(resultClickType, sessionInfo, body);
    };

    /**
     * logs errors
     * @param message
     * @param file - file where it happen
     * @param method - file where it happen
     * @param tabName - thisProject, thisView, thisItem
     */
    proto.logErrorEvent = function(message, file, method, tabName) {
        var timeType = 'inViewer.error';

        var body = {
            file: file,
            method: method,
            querySource: 'inViewer',
            message: message
        };

        var sessionInfo = getSessionInfo(tabName);

        this.logEvent(timeType, sessionInfo, body);

    };


    /**
     * logs saved query click
     *
     * @param {string} clicktype - type of event delete/search/save
     * @param  {int} position index within the querySet
     * @param  {string} document document urn
     * @param  {string} geometry geometry loaded
     * @param  {string} queryId  query identifier
     */
    proto.logSavedQueryClickEvent = function(clicktype, position, document, geometry, queryId, query) {
        var resultType = 'inViewer.savedQueries.' + clicktype;

        var body = {
            position: position + 1, //starts at 1
            document: document,
            currentGeometry: geometry,
            queryId: queryId,
            query: query
        };

        var sessionInfo = getSessionInfo("saved-queries");

        this.logEvent(resultType, sessionInfo, body);
    };

    /**
     * logs saved query click when repeating search
     *
     * @param  {int} position index within the querySet
     * @param  {string} document document urn
     * @param  {string} geometry geometry loaded
     * @param  {string} queryId  query identifier
     */
    proto.logSavedQuerySearchClickEvent = function(position, document, geometry, queryId, query) {
        this.logSavedQueryClickEvent("search", position, document, geometry, queryId, query);
    };

    /**
     * logs saved query click when deleting query
     *
     * @param  {int} position index within the querySet
     * @param  {string} document document urn
     * @param  {string} geometry geometry loaded
     * @param  {string} queryId  query identifier
     */
    proto.logSavedQueryDeleteClickEvent = function(position, document, geometry, queryId, query) {
        this.logSavedQueryClickEvent("delete", position, document, geometry, queryId, query);
    };

    /**
     * logs saved query click when saving query
     *
     * @param {string} clicktype - type of event delete/search/save
     * @param  {int} position index within the querySet
     * @param  {string} document document urn
     * @param  {string} geometry geometry loaded
     * @param  {string} queryId  query identifier
     */
    proto.logSavedQuerySaveClickEvent = function(position, document, geometry, queryId, query) {
        this.logSavedQueryClickEvent("save", position, document, geometry, queryId, query);
    };

    /**
     * highlights the string using the passed replaceStrings
     * @param str
     * @param replaceStart
     * @param replaceEnd
     * @returns {string html}
     */
    proto.sanitizeAndHighlightString = function(str, replaceStart, replaceEnd) {
        return this.qsAPI.sanitizeAndHighlightString(str, replaceStart, replaceEnd);
    };

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';

    var av = Autodesk.Viewing;
    var avp = Autodesk.Viewing.Private;
    var viewerSearchNameSpace = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

    /**
     * viewer property service encapsulates the logic to get the geometries properties
     * @constructor
     */
    viewerSearchNameSpace.ViewerPropertiesService = function() {
        this.worker = undefined;
        this.viewerpropertiesworker = undefined;
        this.initialized = false;
        this.viewer = null;

        this.isGeometry = false;
        this.isSearchInProgress = false;
        this.isSearchInProgressTimer = null;
        this.searchingString = "";
        this.cbSecond = null; // Second callback. Likely callback from This Item depending on the tab search order.
    };

    var proto = viewerSearchNameSpace.ViewerPropertiesService.prototype;

    // ToDo(fyamaoka): is this, maxGeometriesToLoad, the same as the other max limit that is set to 100???
    // (lc): No, this number are the max maout of geometries to load, if there are more we ignore them. The other number
    // is an indicator to not build the index for the geometries.
    var maxGeometriesToLoad = 300; //we don´t load more than 300 geometries to prevent memory crash
    var geometriesCache = {};
    var current = null; //current geometry
    var geometriesFlat = null;
    var currentGeometryData = null;
    var totalGeometries = 0;
    var qsApi = null;
    var maxNodeGeometryCount;
    var geometriesLoaded = 0;
    var sharedPropertyDbPath = null;
    var isSharedPropertyDb = false;
    var loadContext = {};
    var runningBruteSearch = false; //this is to avoid calling twice bruteSearch
    var successBruteSearchListener = null;
    var errorBruteSearchListener = null;
    var orderedGeometries = [];
    var preCompiledReplaceRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
    var highlighter;
    var loadAllGeometries;
    var numPropDBToBeBuilt = 0;

    var SHARED_PROPERTY_KEY = "_sharedPropertyDatabase_";
    var MAX_NUMBER_OF_GEOMETRIES = 100;

    /**
     * Deletes the worker to prevent memory leaks and many workers
     */
    proto.uninitialize = function() {

        if (this.worker !== undefined) {
            this.worker.terminate();
            this.worker = undefined;
            self.viewerpropertiesworker = undefined;
        }
        this.initialized = false;
    };

    /**
     * @private
     * given the geometry it gets the URN to get the property files
     * @param children
     * @returns {string}
     */
    function getUrnFromChildren(children) {
        var urn = null;

        if (!children) {
            avp.logger.warn("InViewerSearch Extension: No URN to retrieve from in getUrnFromChildren()");
        } else {
            [].slice.call(children).forEach(function(childDom) {
                if (!urn) {
                    urn = childDom.urn();

                    if (urn) {
                        urn = urn.substr(0, urn.lastIndexOf('/') + 1);

                        if (urn.indexOf("output/Resource") > 0) {
                            urn = urn.substr(0, urn.lastIndexOf('Resource') + 9);
                        }
                    }
                }
            });

            if (!urn) {
                avp.logger.warn("InViewerSearch Extension: No URN found for geometry");
            }
        }

        return urn;
    }

    /**
     * Initializes the important data.
     *
     * @param viewer
     * @param noBubbleData
     * @param geometries
     * @param currentGeometry - geometry loaded in the viewer
     * @param thresholdSearchMaxNodes
     * @param qsApiService
     * @param sharedPropertyDb
     */
    proto.initialize = function(viewer, noBubbleData, geometries, currentGeometry, thresholdSearchMaxNodes, qsApiService, sharedPropertyDb) {
        this.viewer = viewer;
        qsApi = qsApiService;
        if (noBubbleData) {
            if (this.worker !== undefined) {
                this.worker.terminate();
                this.worker = undefined;
                this.viewerpropertiesworker = undefined;
            }
        } else {
            geometriesCache = {};
            var acmSessionId = this.viewer.model.getData().acmSessionId;
            geometriesFlat = geometries;
            current = currentGeometry;
            geometriesFlat.forEach(function(g){
                if(g.data.guid === current) {
                    currentGeometryData = g;
                }
            });
            geometriesLoaded = 0;
            sharedPropertyDbPath = sharedPropertyDb;
            isSharedPropertyDb = !!sharedPropertyDbPath;
            totalGeometries = geometries.length;
            avp.logger.info("Number of geometries: " + totalGeometries);

            loadContext = {
                url: "",
                itemUrl: av.endpoint.getItemApi(),
                basePath: viewer.model.getData().basePath
            };

            //Add the configured base endpoint URL and query params, etc.
            loadContext = avp.initLoadContext(loadContext);

            maxNodeGeometryCount = thresholdSearchMaxNodes;

            if (this.viewerpropertiesworker === undefined) {
                this.worker = viewerSearchNameSpace.WorkerUtils.createPropertyWorker();
                this.viewerpropertiesworker = this.worker;
            } else {
                this.worker = this.viewerpropertiesworker;
            }
            this.worker.postMessage({
                operation: "SET_DEBUG",
                enable: avp.ENABLE_DEBUG,
                level: avp.logger.level
            });
        }
        this.initialized = true;
    };

    /**
     * @private
     * compares two strings alphabetically
     *
     * @param  {type} g1 - geometry object
     * @param  {type} g2 - geometry object
     * @return {number}  - -1 if g2 is larger, 1 if g1 is larger, 0 if equal
     */
    function comparatorGeometryAlphabetical(g1, g2) {
        var nameA = g1.name.toUpperCase(); // ignore upper and lowercase
        var nameB = g2.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    }

    /**
     * Sort the geometries in a particular order for display in This Item.
     * The purpose is to provide consistent order in presentation.
     * @returns {Array}
     */
     proto.getSortedGeometries = function() {
        if (orderedGeometries && orderedGeometries.length) {
            return orderedGeometries;
        }

        var geometries = [];
        geometriesFlat.forEach(function(geom) {
            geometries.push(geom.data);
        });

        orderedGeometries = geometries.sort(comparatorGeometryAlphabetical);

        return orderedGeometries;
    };

    /**
     * Gets the PropertyDatabase for each geometry except for the one that is loaded in the viewer
     *
     * @param loadAll - indicates whether to load all geometries including the current geometry
     * @param cb      - callback
     */
    proto.initPropertyDatabases = function(loadAll, cb) {
        var self = this,
            geoPropertyPacks = [],
            numGeometriesInModel = 0,
            length,
            key,
            isBigAmount = false;

        loadAllGeometries = loadAll;
        if (!loadAllGeometries) {
            numGeometriesInModel = 1; //add one for this view
        }

        var listener = function(e) {
            var context = e.data;

            if (context.assetRequest) {
                return;
            }

            switch (context.operation) {
                case "PROP_DB_CREATED":
                    avp.logger.log('Received PROP_DB_CREATED for ' + context.guid + ' containing ' + context.objCount + " nodes");
                    if (loadAllGeometries || context.guid !== current) {
                        geometriesLoaded++;
                        geometriesCache[context.guid].objCount = context.objCount;

                        if (geometriesLoaded === numPropDBToBeBuilt) {
                            self.worker.removeEventListener('message', listener);
                        }

                        cb(geometriesCache, geometriesLoaded === numPropDBToBeBuilt, isBigAmount);
                    }
                    break;
                case "PROCESS_BRUTE_SEARCH_OK":
                case "BRUTE_SEARCH_OK":
                    avp.logger.info('Indexing is still on going and brute force search is in progress');
                    break;
                case "GEOMETRIES_ATTR_ERR":
                case "GEOMETRY_ATTR_ERR":
                case "GEOMETRIES_ATTR_OK":
                case "GEOMETRY_ATTR_OK":
                    avp.logger.info('Indexing is still on going');
                    break;
                default:
                    avp.logger.warn('Received unexpected event, ' + context.operation + ', for ' + context.str);
            }
        };

        if (sharedPropertyDbPath) {
            // Share the geometry property data among all geometries.
            geometriesFlat.forEach(function(geometry) {
                key = geometry.data.guid;
                if (geometriesLoaded < maxGeometriesToLoad) {
                    if (!geometriesCache.hasOwnProperty(key)) {
                        geometriesCache[key] = {
                            geometry: geometry.data,
                            hasSharedProperties: true,
                            objCount: 0,
                            propdb_loaded: true
                        };
                    }

                    geometriesLoaded++;
                    numPropDBToBeBuilt++;
                }
            });

            cb(geometriesCache, totalGeometries > 1, isBigAmount);
        } else {
            geometriesFlat.forEach(function(geometry) {
                var urn;
                var key = geometry.data.guid;
                if (loadAllGeometries || key !== current) {
                    if (numGeometriesInModel < maxGeometriesToLoad) {
                        if (!geometriesCache.hasOwnProperty(key)) {
                            geometriesCache[key] = {
                                geometry: geometry.data
                            };

                            urn = getUrnFromChildren(geometry.children);

                            geoPropertyPacks.push({
                                urn: urn,
                                geo: geometry.data
                            });
                            numGeometriesInModel++;
                        }
                    }
                }
            });
            numPropDBToBeBuilt = geoPropertyPacks.length;
            if (numPropDBToBeBuilt) {
                self.worker.addEventListener('message', listener);
                self.worker.postMessage({
                    operation: "CREATE_PROP_DB",
                    geoPropertyPacks: geoPropertyPacks,
                    context: loadContext
                });
            } else {
                cb(geometriesCache, true, false);
            }
        }
    };

    /**
     * get the shared property database
     *
     * @param cb - callback
     */
    proto.initSharedPropertyDatabase = function(cb) {
        var self = this;
        var key = SHARED_PROPERTY_KEY;
        var listener = function(e) {
            var context = e.data;

            if (context.assetRequest) {
                return;
            }

            switch (context.operation) {
                case "PROP_DB_CREATED":
                    avp.logger.log('Received PROP_DB_CREATED for ' + context.guid + ' containing ' + context.objCount);
                    if (context.guid === key) {
                        geometriesCache[key].objCount = context.objCount;
                        geometriesCache[key].loading = false;
                        self.worker.removeEventListener('message', listener);
                        if (geometriesCache[key].sharedDbInit) {
                            geometriesCache[key].sharedDbInit();
                        }
                        cb();
                    }
                    break;

                default:
                    avp.logger.warn('Received unexpected event, ' + context.operation + ', for ' + context.str);
            }
        };

        if (geometriesCache.hasOwnProperty(key)) {
            if (geometriesCache[key].loading) {
                geometriesCache[key].sharedDbInit = cb;
            } else {
                cb();
            }
        } else {
            geometriesCache[key] = {
                isShared: true,
                loading: true
            };

            geometriesCache[current] = {
                isShared: true,
                geometry: currentGeometryData.data
            };
            self.worker.addEventListener('message', listener);
            self.worker.postMessage({
                operation: "CREATE_PROP_DB",
                geoPropertyPacks: [{
                    urn: sharedPropertyDbPath,
                    geo: {
                        guid: key
                    }
                }],
                context: loadContext
            });
        }
    };

    /**
     * get the PropertyDatabase for the geometry loaded in the viewer
     *
     * @param guid
     * @param cb - callback
     */
    proto.initCurrentPropertyDatabase = function(guid, cb) {
        var geometry;
        var urn;
        var self = this;

        if (sharedPropertyDbPath) {
            this.initSharedPropertyDatabase(function() {
                var geometryInner = currentGeometryData;

                if (!geometriesCache.hasOwnProperty(guid)) {
                    geometriesCache[guid] = {
                        geometry: geometryInner.data,
                        hasSharedProperties: true,
                        objCount: 0,
                        propdb_loaded: true
                    };
                }

                cb();
            });
        } else {
            var listener = function(e) {
                var context = e.data;

                if (context.assetRequest) {
                    return;
                }

                switch (context.operation) {
                    case "PROP_DB_CREATED":
                        geometriesCache[context.guid].objCount = context.objCount;

                        if (context.guid === current) {
                            geometriesLoaded++;
                            numPropDBToBeBuilt++;
                            self.worker.removeEventListener('message', listener);
                            cb();
                        }
                        break;
                    default:
                        avp.logger.warn("An unexpected message was received: " + context.operation);
                }
            };

            if (geometriesCache.hasOwnProperty(guid)) {
                cb();
            } else {
                geometry = currentGeometryData || {};
                geometriesCache[current] = {
                    geometry: geometry.data,
                    propdb_loaded: true
                };

                urn = getUrnFromChildren(geometry.children);
                self.worker.addEventListener('message', listener);
                self.worker.postMessage({
                    operation: "CREATE_PROP_DB",
                    geoPropertyPacks: [{
                        urn: urn,
                        geo: geometry.data
                    }],
                    context: loadContext
                });
            }
        }
    };

    /**
     * gets the properties for the current geometry. This calls to viewer getObjectProperties method.
     *
     * @param cb
     */
    proto.getCurrentGeometryAttributes = function(cb) {
        var self = this;
        if (!geometriesCache.hasOwnProperty(current) || !geometriesCache[current].propdb_loaded) {
            this.initCurrentPropertyDatabase(current, function() {
                self.getGeometryAttributes(current, function() {
                    cb();
                });
            });
        }
    };

    /**
     * gets the properties for the given geometry. This calls to PropertyDatabase getObjectProperties method.
     * The attributes are returned as a Map where the key is the value of the property and the values are
     * collections of nodes that contains that property value.
     *
     * @param guid
     * @param cb
     */
    proto.getGeometryAttributes = function(guid, cb) {
        var self = this;

        var listener = function(e) {
            var context = e.data;

            switch (context.operation) {
                case "GEOMETRY_ATTR_OK":
                    self.worker.removeEventListener('message', listener);
                    cb();
                    break;
                case "GEOMETRY_ATTR_ERR":
                    self.worker.removeEventListener('message', listener);
                    avp.logger.warn("InViewerSearch Extension: No attributes found for: " + guid);
                    cb();
                    break;
                default:
                    // TODO(go) 20160520 - investigate this, should we call the callback? should we remove the listener?
                    avp.logger.warn("InViewerSearch Extension: Invalid operation found: " +
                        " Operation: " + (context.operation || "") +
                        " Error: " + (context.error || "") +
                        " Place: " + (context.place || "") +
                        " Method: " + (context.method || "")
                    );
                    break;
            }
        };

        this.worker.addEventListener('message', listener);
        this.worker.postMessage({
            operation: "GEOMETRY_ATTR",
            guid: guid,
            sharedPropDbKey: SHARED_PROPERTY_KEY,
            isSharedPropertyDb: isSharedPropertyDb
        });
    };

    /**
     * for each geometry but current, it gets the geometries attributes
     *
     * @returns {Array}
     */
    proto.getGeometriesAttributes = function(cb) {
        var self = this;

        var listener = function(e) {
            var context = e.data;

            switch (context.operation) {
                case "GEOMETRIES_ATTR_OK":
                    cb();
                    self.worker.removeEventListener('message', listener);
                    break;
                case "GEOMETRIES_ATTR_ERR":
                    avp.logger.info("InViewerSearch Extension: No attributes found for: " + context.geometry.guid);
                    if (context.ended) {
                        cb();
                        self.worker.removeEventListener('message', listener);
                    }
                    break;
                default:
                    // TODO(go) 20160520 - investigate this, should we call the callback? should we remove the listener?
                    avp.logger.warn("InViewerSearch Extension: Invalid operation found: " +
                        " Operation: " + (context.operation || "") +
                        " Error: " + (context.error || "") +
                        " Place: " + (context.place || "") +
                        " Method: " + (context.method || "")
                    );
                    break;
            }
        };

        if (!loadAllGeometries && isSharedPropertyDb) {
            cb({}, isSharedPropertyDb, true);
        } else {
            this.worker.addEventListener('message', listener);
            this.worker.postMessage({
                operation: "GEOMETRIES_ATTR",
                sharedPropDbKey: SHARED_PROPERTY_KEY,
                isSharedPropertyDb: isSharedPropertyDb,
                loadAll: loadAllGeometries
            });
        }
    };

    /**
     * returns the geometry data for a geometry id specified
     *
     * @param  {string} guid - geometry Id
     * @return {object}      - geometry object
     */
    proto.getGeometry = function(guid) {
        var geometry = null;
        geometriesFlat.forEach(function(g) {
            if (g.data.guid === guid) {
                geometry = g;
            }
        });

        return geometry;
    };

    /**
     * returns the geometry data
     *
     * @param  {type} resultCollection
     * @return {object}      - geometry object
     */
    proto.orderGeometriesByName = function(resultCollection) {
        var results = [];
        var index;
        var orderedGem = this.getSortedGeometries();

        orderedGem.forEach(function(g) {
            if (resultCollection.hasResultSet(g.guid)) {
                results.push(resultCollection.getResultSetArray(g.guid));
            }
        });
        return results;
    };

    /**
     * Returns the total number of geometries in the loaded document
     *
     * @return {number}  the total number of geometries in the loaded document
     */
    proto.getTotalCountGeometries = function() {
        if (totalGeometries > maxGeometriesToLoad) {
            return maxGeometriesToLoad;
        } else {
            return totalGeometries;
        }
    };

    proto.areMoreGeometriesToLoad = function() {

        return totalGeometries > maxGeometriesToLoad;
    };

    /**
     * indicates whether all the geometries are loaded.
     *
     * @oaran {boolean} countCurrent - indicates whether to count the current geometry.
     * @return {boolean}             - the number of geometries already loaded
     */
    proto.areAllGeometriesLoaded = function() {
        return geometriesLoaded === numPropDBToBeBuilt;
    };

    /**
     * retrieve the latest result set stored when a new geometry is loaded.
     *
     * @param {string} guid   - id for the new geometry being loaded
     * @param {function} cb - callback
     */
    proto.updateCurrentGeometry = function(guid, cb) {
        current = guid;
        var _this = this;
        var listener = function(e) {
            var context = e.data,
                resultCollection;

            switch (context.operation) {
                case "UPDATE_CURRENT_OK":
                    _this.worker.removeEventListener('message', listener);
                    resultCollection = receiveSearchResults(context);
                    cb(context.str, resultCollection, context.ended);
                    break;

                default:
                    avp.logger.warn('Received unexpected event, ' + context.operation + ', for ' + context.str);
            }
        };

        this.worker.addEventListener('message', listener);
        this.worker.postMessage({
            operation: "UPDATE_CURRENT",
            current: current
        });
    };

    /**
     * @private
     * returns the number of nodes in the model.
     *
     * @param viewer
     * @returns {number}
     */
    function getCurrentGeomObjectCount(viewer) {
        var objCount = 0;
        if (!viewer.model) {
            return 0;
        }

        var myData = viewer.model.getData();
        if (myData.instanceTree && myData.instanceTree.objectCount) {
            objCount = myData.instanceTree.objectCount;
        } else if (myData.instanceTree && myData.instanceTree.children) {
            objCount = myData.instanceTree.children.length;
        } else {
            objCount = 0;
        }

        return objCount;
    }

    /**
     * Decides if the model(or a geometry) has too many nodes.
     * Return only the number of nodes in currently loaded geometry if isCurrentGeoOnly is true.
     * Return the total number of all nodes including current if isCurrentGeoOnly is false.
     *
     * @param {boolean} isCurrentGeoOnly - indicates whether decision is on the current geometry loaded.
     * @returns {boolean}
     */
    proto.hasTooManyNodes = function(isCurrentGeoOnly) {
        var objCount = getCurrentGeomObjectCount(this.viewer);

        if (!isSharedPropertyDb && !isCurrentGeoOnly) {
            // If more than predetermined max geometries, use brute search
            if (this.getTotalCountGeometries() > MAX_NUMBER_OF_GEOMETRIES) {
                return true;
            }

            Object.keys(geometriesCache).forEach(function(guid) {
                if (guid !== current && geometriesCache[guid].objCount) {
                    objCount += geometriesCache[guid].objCount;
                }
            });
        }
        avp.logger.log("Total number of nodes in model: " + objCount);
        return (maxNodeGeometryCount < objCount);
    };

    /**
     * searches the currently loaded geometry. Leverages the viewer's string match service.
     *
     * @param {string} str           - query string
     * @param {function} onSuccessCb - callback upon success
     * @param {function} onErrorCb   - callback upon error
     * @returns {Array}
     */
    proto.bruteSearchCurrent = function(str, onSuccessCb, onErrorCb) {
        var onsuccess = function(results) {
            runningBruteSearch = false;
            onSuccessCb(results);
            if (successBruteSearchListener) {
                successBruteSearchListener(results);
                successBruteSearchListener = null;
            }
        };

        var onerror = function() {
            runningBruteSearch = false;
            avp.logger.warn('A call to viewer native search failed for query string: ' + str);
            onErrorCb();
            if (errorBruteSearchListener) {
                errorBruteSearchListener();
            }
        };

        if (current && !geometriesCache.hasOwnProperty(current)) {
            geometriesLoaded++;
            numPropDBToBeBuilt++;
            var geometry = currentGeometryData || {};
            geometriesCache[current] = {
                geometry: geometry.data
            };
        }

        if (!runningBruteSearch) {
            runningBruteSearch = true;
            this.viewer.search(str, onsuccess, onerror, [], true);
        } else {
            successBruteSearchListener = onSuccessCb;
            errorBruteSearchListener = onErrorCb;
        }
    };

    /**
     * searches in all geometries but current one.
     *
     * @param str
     * @param cb
     * @returns {Array}
     */
    proto.bruteSearch = function(str, cb) {
        var _this = this;
        var orderedGeometriesList = this.getSortedGeometries();

        var listener = function(e) {
            var context = e.data,
                resultCollection;

            switch (context.operation) {
                case "PROCESS_BRUTE_SEARCH_OK":
                case "BRUTE_SEARCH_OK":
                    resultCollection = receiveSearchResults(context);
                    if (_this.cbSecond) {
                        _this.cbSecond(context.str, resultCollection, context.ended);
                    }
                    cb(context.str, resultCollection, context.ended, context.geometry);
                    if (context.ended) {
                        _this.worker.removeEventListener('message', listener);
                        _this.cbSecond = null;
                        _this.isSearchInProgress = false;
                        _this.searchingString = null;
                        avp.logger.debug('The last ' + context.operation + ' messgage received for query \'' + context.str + '\' Ready for another search');
                    }
                    break;
                case "PROP_DB_CREATED":
                    avp.logger.log('Property DB is created. Passing the message through.');
                    break;
                default:
                    avp.logger.warn('Received unexpected event, ' + context.operation + ', for ' + context.str);
            }
        };
        var onCurrentBruteSearch = function(results) {
            var resultForCurr = {
                geometry: current,
                results: results
            };
            _this.worker.postMessage({
                operation: "PROCESS_BRUTE_SEARCH",
                str: str,
                results: resultForCurr,
                sharedPropDbKey: SHARED_PROPERTY_KEY,
                isSharedPropertyDb: isSharedPropertyDb,
                geometries: orderedGeometriesList
            });
        };
        var onErrorCurrentBruteSearch = function() {
            _this.worker.postMessage({
                operation: "PROCESS_BRUTE_SEARCH",
                str: str,
                results: {
                    geometry: current,
                    results: []
                },
                sharedPropDbKey: SHARED_PROPERTY_KEY,
                isSharedPropertyDb: isSharedPropertyDb,
                geometries: orderedGeometriesList
            });
        };

        this.worker.addEventListener('message', listener);
        this.bruteSearchCurrent(str, onCurrentBruteSearch, onErrorCurrentBruteSearch);
        if (!isSharedPropertyDb) {
            this.worker.postMessage({
                operation: "BRUTE_SEARCH",
                str: str,
                currentGeo: current,
                geometries: orderedGeometriesList
            });
        }
    };

    function escapeRegExpChars(str) {
        return str.replace(preCompiledReplaceRegex, '\\$&');
    }

    /**
     * highlights the highlightStr in the text passed as a parameter
     *
     * @param text
     * @param highlightStr
     * @returns {*}
     */
    proto.highlightText = function(text, highlightStr) {
        var highlighted;

        if (Object.prototype.toString.call(text) !== '[object String]') {
            avp.logger.warn('Error: Non-string sent to highlightText(). Check type, and if correct, convert to String() first.');
        }

        if (highlightStr) {
            highlighted = text.replace(highlighter, '<span class="bolder">' + '$1' + '</span>');
            return highlighted;
        } else {
            return text;
        }
    };

    proto.prepHighlighter = function(highlightStr) {
        highlighter = new RegExp('(' + escapeRegExpChars(highlightStr) + ')', 'gi');
    };

    /**
     * @private
     * Convert Array to ArrayBuffer.
     *
     * @param {ArrayBuffer} arrayBuffer - input array
     * @param {function} onSuccess      - callback to be called upon success
     * @param {function} onFail         - callback to be called upon failure
     */
    function arrayBufferToArray(arrayBuffer, onSuccess, onFail) {
        var bufView = new Uint16Array(arrayBuffer),
            length = bufView.length,
            resultArray = [],
            index;

        if (length) {
            var resultString = '';
            var addition = Math.pow(2, 16) - 1;

            for (index = 0; index < length; index += addition) {

                if (index + addition > length) {
                    addition = length - index;
                }
                resultString += String.fromCharCode.apply(null, bufView.subarray(index, index + addition));
            }
            resultArray = JSON.parse(resultString);

            if (resultArray) {
                if (onSuccess)
                    onSuccess(resultArray);
            } else {
                if (onFail)
                    onFail('buffer was invalid');
            }
        }
        return resultArray;
    }

    /**
     * @private
     * translates the search results formatted for Transferable Object to the format for use in downstream.
     *
     * @param context - context passed thru postMessage.
     */
    function receiveSearchResults(context) {
        var resultCollection = new ResultCollection(),
            length = 0,
            meta = context.meta ? context.meta : null,
            resultSetIndex = context.resultSetIndex,
            resultSetArray = context.results ? context.results : null,
            index;

        if (meta) {
            length = Object.keys(meta);
        }

        Object.keys(resultSetIndex).forEach(function(guid) {
            index = resultSetIndex[guid];
            resultCollection.setResultSet({guid: meta[index].guid, name: meta[index].name}, arrayBufferToArray(resultSetArray[index]));
        });

        return resultCollection;
    }

    /**
     * searches using fullproof and string search algorithms
     *
     * @param str
     * @param cb - callback to process the results
     */
    proto.doSearch = function(str, cb) {
        var _this = this,
            geometries;

        var listener = function(e) {
            var context = e.data,
                resultCollection;

            switch (context.operation) {
                case 'SEARCH_RESULT':
                    resultCollection = receiveSearchResults(context);
                    if (_this.cbSecond) {
                        _this.cbSecond(context.str, resultCollection, context.ended);
                    }
                    cb(context.str, resultCollection, context.ended);
                    if (context.ended) {
                        _this.worker.removeEventListener('message', listener);
                        _this.cbSecond = null;
                        _this.isSearchInProgress = false;
                        _this.searchingString = null;
                        avp.logger.debug('The last ' + context.operation + ' messgage received for query \'' + context.str + '\' Ready for another search');
                    }
                    break;
                case 'OLD_SEARCH_RESULT':
                    _this.worker.removeEventListener('message', listener);
                    _this.isSearchInProgress = false;
                    break;
                case "PROCESS_BRUTE_SEARCH_OK":
                case 'BRUTE_SEARCH_OK':
                    avp.logger.info('Indexing is still building and brute force search is in progress');
                    break;
                default:
                    avp.logger.warn('Received unexpected event, ' + context.operation + ', for ' + context.str);
            }
        };

        clearTimeout(_this.isSearchInProgressTimer);

        if (_this.isSearchInProgress === true) {
            // ToDo(fyamaoka): Wonder if the logic here causes any issues when rapid search-as-you-type.
            if (str === _this.searchingString) {
                _this.cbSecond = cb;
            } else {
                _this.isSearchInProgressTimer = setTimeout(function() {
                    _this.doSearch(str, cb);
                }, 100);
            }
        } else {
            if (isSharedPropertyDb) {
                geometries = {};
                Object.keys(geometriesCache).forEach(function(key) {
                    if (key !== SHARED_PROPERTY_KEY) {
                        geometries[key] = {
                            guid: geometriesCache[key].geometry.guid,
                            name: geometriesCache[key].geometry.name
                        };
                    }
                });
            }
            avp.logger.debug('Submitting a new search request for query \'' + str + '\'');
            _this.isSearchInProgress = true;
            _this.searchingString = str;
            _this.worker.addEventListener('message', listener);
            _this.worker.postMessage({
                operation: 'SEARCH',
                str: str,
                isSharedPropertyDb: isSharedPropertyDb,
                geometries: geometries
            });
        }
    };

    proto.defaultNodeName = function() {
        return 'Untitled Node';
    };

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

(function() {
    'use strict';
    var av = Autodesk.Viewing;
    var Helper = AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch.Helper');

    var MESSAGE_TIME = 5000;

    Helper.toggleMessage = function(self, messageText, show) {
        if (show && !self.message) {
            self.message = document.createElement('div');
            self.message.className = 'message-container';
            self.message.appendChild(document.createTextNode(messageText));

            self.container.appendChild(self.message);

        } else if (!show && self.message) {
            if (self.message.parentNode) {
                self.message.parentNode.removeChild(self.message);
            }
            self.message = null;
        }

    };

    Helper.showMessageWithTimer = function(self, messageText) {
        if (self.messageTimer) {
            clearTimeout(self.messageTimer);
        }

        Helper.toggleMessage(self, messageText, true);

        self.messageTimer =  setTimeout(function() {
            Helper.toggleMessage(self, messageText, false);
        }, MESSAGE_TIME);
    };

    Helper.copyDocumentQueries = function(userDocumentQueries) {
        var documentQueries = {
            document: {
                id: userDocumentQueries.document.id,
                name: userDocumentQueries.document.name,
                idType: userDocumentQueries.document.idType
            },
            queries: [],
            version: userDocumentQueries.version
        };

        userDocumentQueries.queries.forEach(function(queries) {
            var queriesCopy = {
                creationDate: queries.creationDate,
                lastModifiedDate: queries.lastModifiedDate,
                name: queries.name,
                querySet: []
            };

            queries.querySet.forEach(function(qs) {
                var query = {
                    query: qs.query,
                    queryId: qs.queryId,
                    geometry: qs.geometry
                }
                queriesCopy.querySet.push(query);
            });

            documentQueries.queries.push(queriesCopy);
        });

        return documentQueries;
    };

    Helper.copyUserData = function(userData) {
        return {
            allocation: {
                used: userData.allocation.used,
                max: userData.allocation.max,
            },
            lastModifiedDate: userData.lastModifiedDate,
            creationDate: userData.creationDate,
            version: userData.version
        };
    }

    Helper.copyQueries = function(userDocumentQueries) {
        var userDocumentQueriesCopy = {
            userData: Helper.copyUserData(userDocumentQueries.userData),
            documentQueries: {}
        };

        if (userDocumentQueries.documentQueries) {
            userDocumentQueriesCopy.documentQueries = Helper.copyDocumentQueries(userDocumentQueries.documentQueries);
        }
        return userDocumentQueriesCopy;
    };

    Helper.showDeletePopup = function(container, query, deleteCb, cancelCb) {
        var confirmation = document.createElement('div');
        confirmation.className = "message-container delete-popup";

        var message = document.createElement('div');
        message.className = 'text-container';
        var text = av.i18n.translate('Are you sure you want to delete the query from your list?').replace("{0}", query);
        message.appendChild(document.createTextNode(text));

        var deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function(){
            deleteCb();
        });
        deleteButton.appendChild(document.createTextNode(av.i18n.translate('Delete')));

        var cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.addEventListener('click', function(){
            cancelCb();
        });
        cancelButton.appendChild(document.createTextNode(av.i18n.translate('Cancel')));

        confirmation.appendChild(message);
        confirmation.appendChild(deleteButton);
        confirmation.appendChild(cancelButton);

        container.appendChild(confirmation);

        return confirmation;
    };

})();

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

'use strict';

function ResultCollection() {
    this.partialResults = [];
    this.resultIDArray = {};
    this.resultSetArray = [];
    this.resultArrayBufferArray = [];
    this.metaInfoArray = [];
    this.resultSetIndex = {};
    this.resultCount = 0;
}

/*
 * Resets all variables.
 */
ResultCollection.prototype.resetResultCollection = function() {
    this.partialResults = [];
    this.resultIDArray = {};
    this.resultSetArray = [];
    this.resultArrayBufferArray = [];
    this.metaInfoArray = [];
    this.resultSetIndex = {};
    this.resultCount = 0;
};

/*
 * Returns the result count.
 */
ResultCollection.prototype.getResultCount = function() {
    return this.resultCount;
};

/*
 * Sets the result count. This is used to reduce the number of the count
 * by invisible nodes that are discovered as the results are clicked. So
 * the count may NOT represent the number of results retained in the
 * resultSetArray
 *
 * @param {number} resultCount - total number of results to be noted.
 */
ResultCollection.prototype.setResultCount = function(resultCount) {
    this.resultCount = resultCount;
};

/*
 * Retrieves the entire resultSetArray.
 *
 * @return {Array} - resultSetArray.
 */
ResultCollection.prototype.getResultSetArray = function() {
        return this.resultSetArray;
};

/*
 * Adds up the number of results in resultSetArray. Set the number to
 * the true number exists in the array.
 */
ResultCollection.prototype.recalcResultCount = function() {
    var index,
        length;

    this.resultCount = 0;
    length = this.resultSetArray.length;
    for (index = 0; index < length; index++) {
        this.resultCount += this.resultSetArray[index].length;
    }
};

/*
 * Returns the index value in the resultSetArray for a particular geometry.
 *
 * @param {string} guid - ID for geometry
 * @return {number} - Index value of the geometry with the guid
 */
ResultCollection.prototype.getResultSetIndex = function(guid) {
    if (!this.resultSetIndex.hasOwnProperty(guid)) {
        return -1;
    }
    return this.resultSetIndex[guid];
};

/*
 * Indicates whether a particular result exists for a geometry.
 *
 * @param {string} guid - ID for geometry
 * @param {string} id - ID for result
 * @return {boolean} - True if the result exists in the result set for the geometry. False otherwise.
 */
ResultCollection.prototype.hasResult = function(guid, id) {
    if (!this.resultIDArray.hasOwnProperty(guid) || this.resultIDArray[guid].indexOf(id) < 0) {
        return false;
    }
    return true;
};

/*
 * Tracks the result added to the result sets by id.
 *
 * @param {string} guid - Guid of result set the result should be added to
 * @param {number} id   - ID of the result to be added
 * @return {boolean} - True if the result is newly added. False if the result is already tracked
 */
ResultCollection.prototype.trackResult = function(guid, id) {
    if (this.resultIDArray.hasOwnProperty(guid)) {
        if (this.resultIDArray[guid].indexOf(id) >= 0) {
            return false;
        } else {
            this.resultIDArray[guid].push(id);
            return true;
        }
    } else {
        this.resultIDArray[guid] = [];
        this.resultIDArray[guid].push(id);
        return true;
    }
};

/*
 * Returns the array that tracks index into resultSetArray for geometries.
 *
 * @return {Array} - The array that tracks index into resultSetArray
 */
ResultCollection.prototype.getResultSetIndexArray = function() {
    return this.resultSetIndex;
};

/*
 * Adds a result into result set fot the geometry specified.
 *
 * @param {Object} geometry - The object representing a geometry
 * @param {string} id - ID for result
 * @param {Object} result - The result to be added
 * @return {boolean} - True if added successfully. False if the result exists in the result set for the geometry.
 */
ResultCollection.prototype.addResult = function(geometry, id, result) {
    if (this.trackResult(geometry.guid, id)) {
        if (!this.resultSetIndex.hasOwnProperty(geometry.guid)) {
            this.setResultSet({
                    guid: geometry.guid,
                    name: geometry.name
                },
                [result]
            );
        } else {
            this.resultSetArray[this.resultSetIndex[geometry.guid]].push(result);
            this.resultCount++;
        }
        return true;
    }
    return false;
};

/*
 * Appends a result set for geometry specified by guid to resultSetArray.
 * Replace the result set if there is one already for the geometry.
 * Updates the total number of results.
 *
 * @param {string} guid - ID for geometry
 * @param {Array} resultSet - The result to be added
 */
ResultCollection.prototype.setResultSet = function(metaInfo, resultSet) {
    if (!metaInfo || !metaInfo.guid) {
        return;
    }
    if (this.resultSetIndex.hasOwnProperty(metaInfo.guid)) {
        this.resultSetArray[this.resultSetIndex(metaInfo.guid)] = resultSet;
    } else {
        this.metaInfoArray.push(metaInfo);
        this.resultSetArray.push(resultSet);
        this.resultSetIndex[metaInfo.guid] = this.resultSetArray.length - 1;
    }
    this.recalcResultCount();
};

/*
 * Replaces the result set for geometry specified by index to resultSetArray.
 * Updates the total number of results.
 *
 * @param {number} index - Index of the result set into resultSetArray
 * @param {Array} resultSet - The result to replace the existing one
 * @return {boolean} - True if successfully replaced. False if not.
 */
ResultCollection.prototype.replaceResultSet = function(index, resultSet) {
    if (this.resultSetArray.length <= index || !resultSet) {
        return false;
    }
    this.resultSetArray[index] = resultSet;
    this.recalcResultCount();
    return true;
};

/*
 * Retrieves the result set at the position in resultSetArray specified by index parameter.
 *
 * @param {number} index - Index of the result set into resultSetArray
 * @return {Array} - Array of the result sets.
 */
ResultCollection.prototype.getResultSet = function(index) {
    if (typeof(index) === 'number') {
        if (!this.resultSetArray || this.resultSetArray.length <= index) {
            return null;
        }
    } else if (typeof(index) === 'string') {
        index = this.getResultSetIndex(index);
        if (index < 0) {
            return null;
        }
    } else {
        return null;
    }
    return this.resultSetArray[index];
};

/*
 * Indicates whether the result set at the position in resultSetArray specified by the input parameter.
 *
 * @param {type} index - Index of the result set into resultSetArray or guid of the geometry whose index can be looked up
 * @return {boolean} - True if found. False if not.
 */
ResultCollection.prototype.hasResultSet = function(index) {
    if (typeof(index) === 'number') {
        if (!this.resultSetArray || this.resultSetArray.length <= index) {
            return false;
        }
    } else if (typeof(index) === 'string') {
        index = this.getResultSetIndex(index);
        if (index < 0) {
            return false;
        }
    } else {
        return false;
    }
    return true;
};

/*
 * Takes the entire result collection.
 *
 * @param {type} index - Index of the result set into resultSetArray or guid of the geometry whose index can be looked up
 * @return {boolean} - True if found. False if not.
 */
ResultCollection.prototype.setResultSetArray = function(resultCollection) {
    this.resultSetArray = resultCollection.resultSetArray;
    this.resultSetIndex = resultCollection.resultSetIndex;
    this.resultCount = resultCollection.resultCount;
    this.partialResults = [];
    this.resultIDArray = {};
    this.resultArrayBufferArray = [];
    this.metaInfoArray = [];
};

/*
 * Retrieves the meta info for a result set at the position in metaInfoArray indicated by index parameter.
 *
 * @param {number} index - Index of the result set into metaInfoArray
 * @return {Object} - Object containing meta info.
 */
ResultCollection.prototype.getMetaInfo = function(index) {
    if (this.metaInfoArray.length <= index) {
        return null;
    }
    return this.metaInfoArray[index];
};

/*
 * Retrieves the meta info from meta info array at specified index.
 *
 * @return {Object} - Meta info object.
 */
ResultCollection.prototype.getMetaInfo = function(index) {
    if (typeof(index) === 'number') {
        if (!this.metaInfoArray || this.metaInfoArray.length <= index) {
            return null;
        }
    } else {
        return null;
    }
    return this.metaInfoArray[index];
};

/*
 * Retrieves the entire meta info array.
 *
 * @return {Array} - Array of meta info object.
 */
ResultCollection.prototype.getMetaInfoArray = function() {
    return this.metaInfoArray;
};

/*
 * Retrieves the ArrayBuffer for a result set at the position in resultArrayBufferArray indicated by index parameter.
 *
 * @return {Array} - Array of meta info object.
 */
ResultCollection.prototype.getResultArrayBuffer = function(index) {
    if (this.resultArrayBufferArray.length <= index) {
        return null;
    }
    return this.resultArrayBufferArray[index];
};

/*
 * Appends the ArrayBuffer to resultArrayBufferArray.
 *
 * @return {Array} - The new length property of the Array upon which the push method was called.
 */
ResultCollection.prototype.addResultArrayBuffer = function(resultArrayBuffer) {
    return this.resultArrayBufferArray.push(resultArrayBuffer);
};

/*
 * Retrieves the entire resultArrayBufferArray.
 *
 * @return {Array} - The Array ArrayBuffer containing results.
 */
ResultCollection.prototype.getResultArrayBufferArray = function() {
    return this.resultArrayBufferArray;
};

/*
 * Retrieves the length of the result set at the position in resultSetArray indicated by index parameter.
 *
 * @return {number} - The length of the result set.
 */
ResultCollection.prototype.getResultSetLength = function(index) {
    if (typeof(index) === 'number') {
        if (!this.resultSetArray || this.resultSetArray.length <= index) {
            return -1;
        }
    } else if (typeof(index) === 'string') {
        index = this.getResultSetIndex(index);
        if (index < 0) {
            return -1;
        }
    } else {
        return -1;
    }
    return this.resultSetArray[index].length;
};

/*
 * Retrieves the length of the resultSetArray.
 *
 * @return {number} - The length of the result set array.
 */
ResultCollection.prototype.getResultSetArrayLength = function() {
    if (!this.resultSetArray) {
        return 0;
    }
    return this.resultSetArray.length;
};

/*
 * Retrieves the length of the getMetaInfoArray.
 *
 * @return {number} - The length of the meta info array.
 */
ResultCollection.prototype.getMetaInfoArrayLength = function() {
    if (!this.metaInfoArray) {
        return 0;
    }
    return this.metaInfoArray.length;
};

/*
 * Retrieves the length of the resultArrayBufferArray.
 *
 * @return {number} - The length of the array of ArrayBuffer.
 */
ResultCollection.prototype.getResultArrayBufferArrayLength = function() {
    if (!this.resultArrayBufferArray) {
        return 0;
    }
    return this.resultArrayBufferArray.length;
};

/*
 * Copies the entire ResultCollection. Deep copies the resultArrayBufferArray. Shallow copy otherwise.
 *
 * @param {Object} - ResultCollection to be copied.
 * @param {boolean} shouldCopyArrayBuffer - Indicates whether to deep copy all ArrayBuffers.
 * @param {boolean} shouldBuildArrayBuffer - Indicates whether all the ArrayBuffer for the recieving object should be rebuild from the result sets.
 */
ResultCollection.prototype.copyResultCollection = function(ResultCollection, shouldCopyArrayBuffer, shouldBuildArrayBuffer) {
    var length,
        index,
        resultArrayBufferArray;

    if (shouldBuildArrayBuffer === undefined || shouldBuildArrayBuffer === null) {
        shouldBuildArrayBuffer = true;
    }
    this.resultCount = ResultCollection.resultCount;
    this.resultSetArray = ResultCollection.resultSetArray;
    this.resultSetIndex = ResultCollection.resultSetIndex;
    this.metaInfoArray = ResultCollection.metaInfoArray;
    this.resultIDArray = ResultCollection.resultIDArray;

    if (shouldCopyArrayBuffer) {
        // Make the arrays containing results an array of ArrayBuffers for Transferable Objects compatibility
        this.resultArrayBufferArray = [];
        ResultCollection.resultArrayBufferArray = [];
        length = ResultCollection.getResultSetArrayLength();
        for (index = 0; index < length; index++) {
            resultArrayBufferArray = this.arrayToArrayBuffer(this.resultSetArray[index], true);
            ResultCollection.addResultArrayBuffer(resultArrayBufferArray.arrayBuffer);
            this.addResultArrayBuffer(resultArrayBufferArray.arrayBufferStore);
        }
    }

    if (!shouldCopyArrayBuffer && shouldBuildArrayBuffer) {
        this.resultArrayBufferArray = [];
        length = this.getResultSetArrayLength();
        for (index = 0; index < length; index++) {
            this.resultArrayBufferArray.push(this.arrayToArrayBuffer(this.resultSetArray[index]));
        }
    }
};

/**
 * Convert Array to ArrayBuffer.
 *
 * @param {Array} array           - input array
 * @param {boolean} shouldDouble  - produce second copy of ArrayBuffer if true
 */
ResultCollection.prototype.arrayToArrayBuffer = function(array, shouldDouble) {
    var input = JSON.stringify(array),
        length = input.length,
        resultArrayBuffer = new ArrayBuffer(length * 2),
        resultArrayBufferStore,
        bufView = new Uint16Array(resultArrayBuffer),
        bufViewStore,
        index;
    if (shouldDouble) {
        resultArrayBufferStore = new ArrayBuffer(length * 2);
        bufViewStore = new Uint16Array(resultArrayBufferStore);
    }

    for (index = 0; index < length; index++) {
        bufView[index] = input.charCodeAt(index);
        if (shouldDouble) {
            bufViewStore[index] = input.charCodeAt(index);
        }
    }

    if (shouldDouble) {
        return {
            arrayBuffer: resultArrayBuffer,
            arrayBufferStore: resultArrayBufferStore
        };
    }
    return resultArrayBuffer
};

/**
 * Deep copy ArrayBuffer.
 *
 * @param {number} index  - index of the ArrayBuffer in the resultArrayBufferArray
 * @returns {ArrayBuffer} - array buffer containing deep copied data from the source
 */
ResultCollection.prototype.copyArrayBuffer = function(index) {
    var length,
        arrayBufferCopy,
        bufView,
        bufViewCopy,
        pos;

    if (this.resultArrayBufferArray.length <= index) {
        return null;
    }
    length = this.resultArrayBufferArray[index].byteLength;
    arrayBufferCopy = new ArrayBuffer(length);
    bufView = new Uint16Array(this.resultArrayBufferArray[index]);
    bufViewCopy = new Uint16Array(arrayBufferCopy);

    for (pos = 0; pos < length; pos++) {
        bufViewCopy[pos] = bufView[pos];
    }

    return arrayBufferCopy;
};

/**
 * Deep copy ArrayBuffer Array.
 *
 * @returns {Array} - array buffer array generated from the source array
 */
ResultCollection.prototype.generateArrayBufferArray = function() {
    var resultArrayBufferArray = [],
        length,
        index;

    if (this.resultCount) {
        length = this.getResultArrayBufferArrayLength();

        for (index = 0; index < length; index++) {
            resultArrayBufferArray.push(this.copyArrayBuffer(index));
        }
    }
    return resultArrayBufferArray;
};

/*
 * @private
 * loads the ResultCollection from an object, this is for testing porpuses
 */
ResultCollection.prototype.loadResultCollectionFromObject = function(resultObject) {
    this.partialResults = resultObject.partialResults;
    this.resultIDArray = resultObject.resultIDArray;
    this.resultSetArray = resultObject.resultSetArray;
    this.resultArrayBufferArray = resultObject.resultArrayBufferArray;
    this.metaInfoArray = resultObject.metaInfoArray;
    this.resultSetIndex = resultObject.resultSetIndex;
    this.resultCount = resultObject.resultCount;
};
