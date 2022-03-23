// api/api.js
// used as the connection method to the Dynatrace API
// pass in the full URL and the token

const axios = require('axios');

//hosts v1
const API_V1_HOSTS_ALL = "api/v1/entity/infrastructure/hosts?pageSize={{pagesize}}&relativeTime={{timeframe}}&includeDetails=true";
const API_V1_HOSTS_ALL_LIMIT = "api/v1/entity/infrastructure/hosts?pageSize={{pagesize}}&relativeTime={{timeframe}}";

//pgis v1
const API_V1_PGIS_ALL = "api/v1/entity/infrastructure/processes?relativeTime={{timeframe}}&pageSize={{pagesize}}&includeDetails=true";
const API_V1_PGIS_ALL_LIMIT = "api/v1/entity/infrastructure/processes?relativeTime={{timeframe}}&pageSize={{pagesize}}";

//hosts v2
const API_V2_HOSTS_ALL = "api/v2/entities?pageSize={{pagesize}}&entitySelector=type%28%22HOST%22%29";
const API_V2_HOSTS_ONE = "api/v2/entities?pageSize={{pagesize}}&entitySelector=type%28%22HOST%22%29%2CentityId%28%22{{entityId}}%22%29";

//pgis v2
const API_V2_PGIS_ALL = "api/v2/entities?pageSize={{pagesize}}&entitySelector=type%28%22PROCESS_GROUP_INSTANCE%22%29";
const API_V2_PGIS_ONE = "api/v2/entities?pageSize={{pagesize}}&entitySelector=type%28%22PROCESS_GROUP_INSTANCE%22%29%2CentityId%28%22{{entityId}}%22%29";

//get api results
const getApi = async (apiUrl, token) =>
{
  if (gl_logging) console.info(`Trying cx with token:${token} and URL:${apiUrl}`);
  const resp = await axios.get(apiUrl,
      { 
        headers: {
          'accept': 'application/json',
          'Authorization': `Api-Token ${token}`
        }
      });
  return resp.data;
}

module.exports = { getApi, API_V1_HOSTS_ALL, API_V1_HOSTS_ALL_LIMIT, API_V1_PGIS_ALL , API_V2_HOSTS_ALL, API_V2_HOSTS_ONE, API_V2_PGIS_ALL, API_V2_PGIS_ONE, API_V1_PGIS_ALL_LIMIT };
