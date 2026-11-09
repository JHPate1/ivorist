export default {
    async fetch(request, env) {
        return new Response(`hello ${env.WHOAMI}`);
    }
};
