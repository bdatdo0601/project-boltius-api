const Boom = require("boom");

class Preware {
    static requireAdminGroup(groups) {
        return {
            assign: "ensureAdminGroup",
            method: function(request, h) {
                let newGroups;
                if (Object.prototype.toString.call(groups) !== "[object Array]") {
                    newGroups = [groups];
                } else {
                    newGroups = groups;
                }

                const admin = request.auth.credentials.roles.admin;
                const groupFound = newGroups.some(group => admin.isMemberOf(group));

                if (!groupFound) {
                    throw Boom.forbidden("Missing required group membership.");
                }

                return h.continue;
            },
        };
    }
}

Preware.requireNotRootUser = {
    assign: "requireNotRootUser",
    method: function(request, h) {
        if (request.auth.credentials.user.username === "root") {
            throw Boom.forbidden("Not permitted for the root user.");
        }

        return h.continue;
    },
};

module.exports = Preware;
