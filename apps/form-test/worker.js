export default {
    async fetch(request, env) {
        const who = env.WHOAMI;
        if (request.url.endsWith("/api/who")) {
            return new Response("secret-from-env:" + who);
        }
        return new Response("worker up, secret present: " + (who ? "yes" : "no"));
    }
};
