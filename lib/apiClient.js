var rp = require('request-promise');

class ApiClient {

    constructor(options) {
        this.options = options;
    }

    async getMgmtApiTokenAsync(scope) {
        if (this.access_token)
            return this.access_token;

        scope = scope || 'read:users update:users';
        let clientId = this.options.clientId;
        let clientSecret = this.options.clientSecret;
        let domain = this.options.domain;
        const request = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            audience: `https://${domain}/api/v2/`,
            scope: scope
        };
        console.log(`getting token...`);
        const json = await rp.post({
            uri: `https://${domain}/oauth/token`,
            json: request
        });
        this.access_token = json.access_token;
        return this.access_token;
    }

    handleError(message, err, handler) {
        console.log(err);
        handler(new Error(message));
    }

    async getUserByEmail(email, token) {
        const json = await rp.get({
            uri: `https://${this.options.domain}/api/v2/users`,
            qs: {
                q: `email:"${email}"`
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return JSON.parse(json);
    }

    async getAppMetadata(userId) {
        const token = await this.getMgmtApiTokenAsync();
        const json = await rp.get({
            uri: `https://${this.options.domain}/api/v2/users/${userId}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return JSON.parse(json).app_metadata;
    }
    async getAppMetadataByEmail(email) {
        const mgmtToken = await this.getMgmtApiTokenAsync();
        const user = await this.getUserByEmail(email, mgmtToken)
        if (user && user.length==1)
            return user[0].app_metadata;

        throw new Error("User Not found");
    }

    async updateAppMetadata(user_id, app_metadata, token) {
       return await rp.patch({
            uri: `https://${this.options.domain}/api/v2/users/${user_id}`,
            json: {app_metadata: app_metadata},
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    async createAccess(accessRequest, user) {
        const mgmtToken = await this.getMgmtApiTokenAsync();
        let resourceOwner = await this.getUserByEmail(user.email, mgmtToken);
        let requestingParty = await this.getUserByEmail(accessRequest.email, mgmtToken);

        if (resourceOwner.length!=1 || requestingParty.length!=1) {
            throw new Error("One of the required users is not found.")
        }

        resourceOwner = resourceOwner[0];
        requestingParty = requestingParty[0];

        const ro_app_metadata = resourceOwner.app_metadata || {};
        const rp_app_metadata = requestingParty.app_metadata || {};

        const ro_shared_access = ro_app_metadata.shared_access || [];
        const rp_access_grants = rp_app_metadata.access_grants || [];

        ro_shared_access.push({
            requestingParty_email: requestingParty.email,
            requestingParty_id: requestingParty.user_id,
            permissions: accessRequest.permissions.join(' '),
            valid_until: 23212111
        });

        rp_access_grants.push({
            owner_email: resourceOwner.email,
            owner_id: resourceOwner.user_id,
            permissions: accessRequest.permissions.join(' '),
            valid_from: 3212121,
            valid_until: 23212111
        });

        ro_app_metadata.shared_access = ro_shared_access;
        rp_app_metadata.access_grants = rp_access_grants;

        await this.updateAppMetadata(resourceOwner.user_id, ro_app_metadata, mgmtToken);
        await this.updateAppMetadata(requestingParty.user_id, rp_app_metadata, mgmtToken);
    }
}

module.exports = new ApiClient({domain: process.env.Domain, clientId: process.env.ClientID, clientSecret: process.env.ClientSecret, audience: process.env.Audience, baseUrl: process.env.BaseUrl});