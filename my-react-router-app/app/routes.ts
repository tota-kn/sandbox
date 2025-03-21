import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
    route("contacts/:contactId", "routes/contacts.tsx")
] satisfies RouteConfig;
