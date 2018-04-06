class AppBuilder {
    constructor(baseClass) {
        this.baseClass = baseClass;
        const c = function () {}
        c.prototype = Object.create(this.baseClass.prototype);
        c.prototype.constructor = c;
        this.class = c;
    }

    className(name) {
        this.className = name;
    }

    register(...args) {
        this.baseClass.register(...args);
        return this;
    }

    setup(func) {
        const _steup = this.class.prototype.setup;
        this.class.prototype.setup = function (...args) {
            _steup.call(this, ...args);
            func.call(this, ...args);
        };
        return this;
    }

    extend(props) {
        return this;
    }

    build() {
        return this.class;
    }
}

export default (baseClass) => new AppBuilder(baseClass);
