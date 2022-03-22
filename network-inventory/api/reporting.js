// api/reporting.js
// used to extract the data from the Dynatrace API and display the report.

const res = require("express/lib/response");
const reporting = require('./report.js');
const data = require('./database.js');
const api = require('./api.js');

module.exports = function(route, app, db) {

    connections= {};
    hosts={};
    pgis={};

    //get extract
    app.get('/api/'+route,(req,res) => {
        url = req.query.url;
        token = req.query.token;
        timeframe = req.query.timeframe;
        pagesize = 1000;

        const r = async () => {
            // use promise for all API connections
            await performActions(url, token, timeframe, pagesize);
        }

        // wait on all promises to complete to ensure we have all the data
        r().then((resp) => {
            Promise.all([connections, hosts, pgis])
            .then((values) => {
                co = values[0];
                ho = values[1];
                pg = values[2];
                if (gl_logging) console.info("Successfully pulled all reporting data.");
                if (gl_logging) console.info("Connections count is "+co.length);
                if (gl_logging) console.info("Host count is "+ho.length);
                if (gl_logging) console.info("PGI count is "+pg.length);
                res.send(reporting.generateHTML(values[0],values[1],values[2],timeframe));
            })
            .catch(error => {
                console.error(`API failed when pulling report data - ${error}`);
                if (error.message.includes('code 401')) {
                    res.status(401).json({ message: 'Check URL and Token.'});
                } else if (error.message.includes('code 400')) {
                    res.status(400).json({ message: 'Invalid format of API called.'});
                } else {                 
                    res.status(500).json({ message: 'Unauthorized - Check URL and Token.'});
                }
            });        
        });
    });  

    const performActions = async (url, token, timeframe, pagesize) =>
    {

        if (gl_logging) console.info(Date.now() + ` -> called performActions using timeframe of ${timeframe} and pagesize of ${pagesize}`);

        pgis = api.getApi(cleanUrl(url,api.API_V1_PGIS_ALL,timeframe,'',pagesize), token);
        hosts = api.getApi(cleanUrl(url,api.API_V1_HOSTS_ALL,timeframe,'',pagesize), token);
        connections = hosts; //api.getApi(cleanUrl(url,api.API_V1_HOSTS_ALL,timeframe,'',pagesize), token);

    }
    
    const cleanUrl = (url, path, timeframe, id, pagesize) => {
    
        let returnUrl = url + path;
        returnUrl = returnUrl.replace('{{timeframe}}',timeframe).replace('{{entityId}}',id).replace('{{pagesize}}', pagesize);
        return returnUrl;

    }
    
  };