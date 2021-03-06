/** Declaration file generated by dts-gen */

export = promise_cache_decorator;

declare function promise_cache_decorator(opt: any): any;

declare namespace promise_cache_decorator {
    const prototype: {
    };

    function clear(): void;

    function restoreDefaultSettings(): void;

    function setSettings(obj: any): void;

    namespace validator {
        function register(p0: any, p1: any): any;
        function unregister(p0: any, p1: any): any;
    }
}