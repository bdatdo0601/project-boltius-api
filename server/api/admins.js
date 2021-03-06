const Admin = require("../models/admin");
const Boom = require("boom");
const Joi = require("joi");
const Preware = require("../preware");
const User = require("../models/user");

const RESPONSES = require("../constants/Responses");

const register = function(server, serverOptions) {
    server.route({
        method: "GET",
        path: "/api/admins",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                query: {
                    sort: Joi.string()
                        .default("_id")
                        .description("param to sort list"),
                    limit: Joi.number()
                        .default(20)
                        .description("amount of admin per page"),
                    page: Joi.number()
                        .default(1)
                        .description("current page to show"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Get Admin Groups",
            notes: "Get all available admin groups",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const query = {};
            const limit = request.query.limit;
            const page = request.query.page;
            const options = {
                sort: Admin.sortAdapter(request.query.sort),
            };

            return await Admin.pagedFind(query, page, limit, options);
        },
    });

    server.route({
        method: "POST",
        path: "/api/admins",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                payload: {
                    name: Joi.string()
                        .required()
                        .description("new admin name"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Create new admin",
            notes: "Create a new admin",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            return await Admin.create(request.payload.name);
        },
    });

    server.route({
        method: "GET",
        path: "/api/admins/{id}",
        options: {
            auth: {
                scope: "admin",
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Get Admin",
            notes: "Get info about an admin",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const admin = await Admin.findById(request.params.id);

            if (!admin) {
                throw Boom.notFound("Admin not found.");
            }

            return admin;
        },
    });

    server.route({
        method: "PUT",
        path: "/api/admins/{id}",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                params: {
                    id: Joi.string().invalid("111111111111111111111111"),
                },
                payload: {
                    name: Joi.object({
                        first: Joi.string().required(),
                        middle: Joi.string().allow(""),
                        last: Joi.string().required(),
                    }).required(),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Update admin name",
            notes: "Update admin name",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const id = request.params.id;
            const update = {
                $set: {
                    name: request.payload.name,
                },
            };
            const admin = await Admin.findByIdAndUpdate(id, update);

            if (!admin) {
                throw Boom.notFound("Admin not found.");
            }

            return admin;
        },
    });

    server.route({
        method: "DELETE",
        path: "/api/admins/{id}",
        options: {
            auth: {
                scope: "admin",
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Delete an admin",
            notes: "Delete current admin",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const admin = await Admin.findByIdAndDelete(request.params.id);

            if (!admin) {
                throw Boom.notFound("Admin not found.");
            }

            return { message: "Success." };
        },
    });

    server.route({
        method: "PUT",
        path: "/api/admins/{id}/groups",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                params: {
                    id: Joi.string().invalid("111111111111111111111111"),
                },
                payload: {
                    groups: Joi.object()
                        .required()
                        .description("each key is groupId and value is group name"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Link admin to groups",
            notes: "Link an admin to one to many groups (including admin groups)",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const id = request.params.id;
            const update = {
                $set: {
                    groups: request.payload.groups,
                },
            };
            const admin = await Admin.findByIdAndUpdate(id, update);

            if (!admin) {
                throw Boom.notFound("Admin not found.");
            }

            return admin;
        },
    });

    server.route({
        method: "PUT",
        path: "/api/admins/{id}/permissions",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                params: {
                    id: Joi.string().invalid("111111111111111111111111"),
                },
                payload: {
                    permissions: Joi.object()
                        .required()
                        .description("each key is variable with a boolean value"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Give permission to an admin",
            tags: ["api", "rootScope"],
            pre: [Preware.requireAdminGroup("root")],
        },
        handler: async function(request, h) {
            const id = request.params.id;
            const update = {
                $set: {
                    permissions: request.payload.permissions,
                },
            };
            const admin = await Admin.findByIdAndUpdate(id, update);

            if (!admin) {
                throw Boom.notFound("Admin not found.");
            }

            return admin;
        },
    });

    server.route({
        method: "PUT",
        path: "/api/admins/{id}/user",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                params: {
                    id: Joi.string().invalid("111111111111111111111111"),
                },
                payload: {
                    username: Joi.string()
                        .lowercase()
                        .required()
                        .description("user's username"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Set an user as Admin",
            notes: "Only one admin record to one user",
            tags: ["api", "rootScope"],
            pre: [
                Preware.requireAdminGroup("root"),
                {
                    assign: "admin",
                    method: async function(request, h) {
                        const admin = await Admin.findById(request.params.id);

                        if (!admin) {
                            throw Boom.notFound("Admin not found.");
                        }

                        return admin;
                    },
                },
                {
                    assign: "user",
                    method: async function(request, h) {
                        const user = await User.findByUsername(request.payload.username);

                        if (!user) {
                            throw Boom.notFound("User not found.");
                        }

                        if (user.roles.admin && user.roles.admin.id !== request.params.id) {
                            throw Boom.conflict("User is linked to an admin. Unlink first.");
                        }

                        if (request.pre.admin.user && request.pre.admin.user.id !== `${user._id}`) {
                            throw Boom.conflict("Admin is linked to a user. Unlink first.");
                        }

                        return user;
                    },
                },
            ],
        },
        handler: async function(request, h) {
            const user = request.pre.user;
            let admin = request.pre.admin;

            [admin] = await Promise.all([
                admin.linkUser(`${user._id}`, user.username),
                user.linkAdmin(`${admin._id}`, admin.fullName()),
            ]);

            return admin;
        },
    });

    server.route({
        method: "DELETE",
        path: "/api/admins/{id}/user",
        options: {
            auth: {
                scope: "admin",
            },
            validate: {
                params: {
                    id: Joi.string().invalid("111111111111111111111111"),
                },
            },
            plugins: {
                "hapi-swagger": {
                    responses: RESPONSES,
                },
            },
            description: "Unlink an admin record from an user",
            tags: ["api", "rootScope"],
            pre: [
                Preware.requireAdminGroup("root"),
                {
                    assign: "admin",
                    method: async function(request, h) {
                        let admin = await Admin.findById(request.params.id);

                        if (!admin) {
                            throw Boom.notFound("Admin not found.");
                        }

                        if (!admin.user || !admin.user.id) {
                            admin = await admin.unlinkUser();

                            return h.response(admin).takeover();
                        }

                        return admin;
                    },
                },
                {
                    assign: "user",
                    method: async function(request, h) {
                        const user = await User.findById(request.pre.admin.user.id);

                        if (!user) {
                            throw Boom.notFound("User not found.");
                        }

                        return user;
                    },
                },
            ],
        },
        handler: async function(request, h) {
            const [admin] = await Promise.all([request.pre.admin.unlinkUser(), request.pre.user.unlinkAdmin()]);

            return admin;
        },
    });
};

module.exports = {
    name: "api-admins",
    dependencies: ["auth", "hapi-auth-basic", "hapi-mongo-models"],
    register,
};
