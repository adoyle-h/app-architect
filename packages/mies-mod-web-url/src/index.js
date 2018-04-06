
    /**
     *              origin
     *      __________|__________
     *     /                     \
     *                        authority
     *    |             __________|_________
     *    |            /                    \
     *             userinfo                host                          resource
     *    |         __|___                ___|___                 __________|___________
     *    |        /      \              /       \               /                      \
     *        username  password     hostname    port     path & segment      query   fragment
     *    |     __|___   __|__    ______|______   |   __________|_________   ____|____   |
     *    |    /      \ /     \  /             \ / \ /                    \ /         \ / \
     *   foo://username:password@www.example.com:123/hello/world/there.html?name=ferret#foo
     *   \_/                     \ / \       \ /    \__________/ \     \__/
     *    |                       |   \       |           |       \      |
     * scheme               subdomain  \     tld      directory    \   suffix
     *                                  \____/                      \___/
     *                                     |                          |
     *                                   domain                   filename
     *
     * @param {Object} config
     * @param {String} [config.url]
     * @param {String} [config.path]
     * @param {Object} [config.query]
     * @param {String} [config.fragment]
     * @param {String} [config.protocol]
     * @param {String} [config.hostname]
     * @param {String} [config.port]
     * @return {Object} {url: <new url>, uriObj: <new URI instance>}
     */
    _parseUrl(config) {
        const {location} = window;

        const {
            url: _url,
            fragment,
            query,
            path = location.pathname,
            hostname = location.hostname,
            port = location.port,
        } = config;
        let {
            protocol = location.protocol,
        } = config;

        if (protocol.endsWith(':')) {
            protocol = protocol.slice(0, -1);
        }

        let url, uriObj;
        if (_url) {
            uriObj = new URI(_url);
            url = _url;
        } else {
            uriObj = new URI({
                protocol, hostname, port, fragment, path,
            }).query(query);
            url = uriObj.href();
        }

        return {url, uriObj};
    },
